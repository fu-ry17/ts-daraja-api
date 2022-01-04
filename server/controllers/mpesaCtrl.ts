import axios from 'axios'
import { Request, Response } from 'express'
import { IAuth } from '../config/interface'
const datetime = require('node-datetime')

const mpesaCtrl = {
    stkPush: async(req: IAuth, res: Response) => {
        try {
            const formated = datetime.create().format('YmdHMS')
            const password = req.password
            const token = req.token

            const auth = 'Bearer '+ token

            const url = `${process.env.STK_URL}`

            const data = {
                "BusinessShortCode": `${process.env.SHORT_CODE}`,
                "Password": password,
                "Timestamp": formated,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": 1,
                "PartyA": 254779197745, // phone number
                "PartyB": `${process.env.SHORT_CODE}`,
                "PhoneNumber": 254779197745, // phone number
                "CallBackURL": "https://8dea-197-237-129-100.ngrok.io/api/response",
                "AccountReference": "Fury Store",
                "TransactionDesc": "Lipa na m-pesa" 
            }

            axios.post(url, data, {
                headers: { Authorization: auth }
            }).then(resp =>{
                 return res.status(200).json({ msg: resp.data })
            }).catch(err => {
                return res.status(400).json({ msg: err.message })
            })
             

        } catch (error: any) {
            return res.status(500).json({ msg: error.message })
        }
    },
    // callback url
    response: async(req: IAuth, res: Response) => {
        try {
            const { Body } = req.body 

            const data = Body.stkCallback.CallbackMetadata
            const Item = data.Item
            const res = Body.stkCallback.ResultDesc

            console.log({ Body, data, Item, res })

            return res.status(200).json({ msg: 'success'})

        } catch (error: any) {
            return res.status(500).json({ msg: error.message })
        }
    }
}

export default mpesaCtrl