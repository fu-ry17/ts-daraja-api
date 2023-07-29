import axios, { AxiosError } from "axios"
import dotenv from 'dotenv'
const dt = require('node-datetime')

//dotenv to fix error
dotenv.config()

const auth = 'Basic ' + Buffer.from(`${process.env.CONSUMER_KEY as string}`+ ':' + `${process.env.CONSUMER_SECRET as string}`).toString('base64')
const stk_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

export const generatePassword = () => {
    const formated = dt.create().format('YmdHMS')
    const newPassword = `${process.env.SHORT_CODE}${process.env.PASS_KEY}${formated}`
    const encodedPassword = Buffer.from(newPassword).toString('base64')
    
    return { password: encodedPassword, formated }
}

export const getAccessToken = async() => {
    try {
        const response = await axios.get(process.env.AUTH_URL as string, { headers: { Authorization: auth }})
        return response.data.access_token

    } catch (error) {
        if(error instanceof Error){
            console.log(error.message)
        }
    }
}

export const stkPush = async (token: string, phone: number): Promise<string | null> => {
  const { password, formated } = generatePassword();

  const auth = 'Bearer ' + token;

  const data = {
    BusinessShortCode: `${process.env.SHORT_CODE as string}`,
    Password: password,
    Timestamp: formated,
    TransactionType: 'CustomerPayBillOnline',
    Amount: 100,
    PartyA: phone,
    PartyB: `${process.env.SHORT_CODE as string}`,
    PhoneNumber: phone,
    CallBackURL: 'https://mydomain.com/path',
    AccountReference: 'FuryStore',
    TransactionDesc: 'Ultimate store',
  };

  const response = await axios.post(stk_url, data, { headers: { Authorization: auth } });

  const checkOutId = response.data?.CheckoutRequestID as string;
  const simulate = await retrySimulateResponse(token, checkOutId);

  return simulate;
};

export const simulateResponse = async (token: string, checkOutId: string) => {
    const { password, formated } = generatePassword();
    const data = {
      BusinessShortCode: `${process.env.SHORT_CODE as string}`,
      Password: password,
      Timestamp: formated,
      CheckoutRequestID: checkOutId,
    };
  
    const uri = 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query';
    const resp = await axios.post(uri, data, { headers: { Authorization: 'Bearer ' + token } });
  
    return resp.data.ResultDesc;
};
  
// retry while the transaction is being processed
const retrySimulateResponse = async (token: string, checkOutId: string): Promise<string | null> => {
  try {
    const simulate = await simulateResponse(token, checkOutId);
    return simulate;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.data.errorMessage === 'The transaction is being processed') {
        console.log(`Retrying simulateResponse`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return retrySimulateResponse(token, checkOutId);
      }
    }else if(error instanceof Error){
       return error.message
    }

    return "The request was cancelled, took too long to reply"
  }
};
