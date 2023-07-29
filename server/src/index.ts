import { AxiosError } from 'axios'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import { createServer } from 'http'
import { getAccessToken, stkPush } from './utils/mpesaActions'

const main = async() => {
   // dotenv config
   dotenv.config()
   //express app
   const app = express()
   
   //middleware
   app.use(express.json())
   app.use(express.urlencoded({ extended: true }))
   app.use(cors({ credentials: true, origin: '*' }))

   //httpServer
   const httpServer = createServer(app)

   //stk-push
   app.post('/api/stk-push', async(req: Request, res: Response) => {
      try {
        const { phone } = req.body
        const token = await getAccessToken()
        if(!token) return res.status(400).json({ message: 'Unable to genrate access token try again'})
        
        //perform sdk push & simulate response
        const response = await stkPush(token, phone) 
        
        // return response to user success or error
        if(response === "The service request is processed successfully."){
            return res.status(200).json({ msg: "payment has been recieved successfully"})
        }else if(response !== "The service request is processed successfully." ){
            return res.status(400).json({ message: response })
        }
      
      } catch (error) {
        if(error instanceof AxiosError){
           return res.status(400).json({ message: error.response?.data })
        }else if(error instanceof Error){
            console.log(error.message)
            return res.status(500).json({ message: error.message })
        }
      }
   })
   
   //host api to recieve response on the callback url
   app.post('/api/response', (req: Request, res: Response) => {
      try {
        console.log({ response: req.body})
      } catch (error: any) {
        return res.status(500).json({ message: error.message })
      }
   })

   //port
   const PORT = process.env.PORT || 3001

   await new Promise<void>((resolve) => ( httpServer.listen({ port: PORT }, resolve)))
   console.log(`Server is running on port ${PORT}....`)
}

main().catch(err => {
    if(err instanceof Error){
        console.log(err.message)
        process.exit(1) //exit on error
    }
})
