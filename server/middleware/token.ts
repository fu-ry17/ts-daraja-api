import { Request, Response, NextFunction } from 'express'
import { IAuth } from '../config/interface'
import axios from 'axios'
const datetime = require('node-datetime')

// generate password
export const generatePassword = (req: IAuth, res: Response, next: NextFunction) => {
    try {
        const formated = datetime.create().format('YmdHMS')
        const newPassword = `${process.env.SHORT_CODE}`+`${process.env.PASS_KEY}`+ formated
        const encodedPassword = Buffer.from(newPassword).toString('base64')

        req.password = encodedPassword

        next()

    } catch (error: any) {
        return res.status(500).json({ msg: error.message })
    }
}

// accessToken
export const getAccessToken = (req: IAuth, res: Response, next: NextFunction) => {
    try {
        const url = `${process.env.AUTH_URL}`
        const auth = 'Basic ' + Buffer.from(`${process.env.CONSUMER_KEY}`+ ':' + `${process.env.CONSUMER_SECRET}`).toString('base64')

        axios.get(url, { headers: { Authorization: auth} })
             .then( response => {
                 req.token = response.data.access_token
                 next()

             }).catch(error => {
                 return res.status(400).json({ msg: error })
             })

    } catch (error: any) {
        return res.status(500).json({ msg: error.message })
    }
}