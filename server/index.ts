import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import cors from 'cors'
import routes from './routes'

const app = express()
// middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// routes
app.use('/api', routes.mpesaRouter)

// PORT
const PORT = process.env.PORT || 3001 
app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT}..`)
})