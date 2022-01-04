import {Request } from 'express'

export interface IAuth extends Request{
    password?: string
    token?: string
}