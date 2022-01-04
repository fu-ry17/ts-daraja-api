import express from 'express'
import mpesaCtrl from '../controllers/mpesaCtrl'
import { generatePassword, getAccessToken } from '../middleware/token'
const router = express.Router()

router.post('/stk-push', generatePassword, getAccessToken, mpesaCtrl.stkPush)

router.post('/response', mpesaCtrl.response)

export default router