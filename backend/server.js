import express from 'express'
import data from './data.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import userRouter from './routers/userRouter.js'

dotenv.config()

const app = express()

try {
     mongoose.connect(process.env.MONGODB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: true
     }, () => console.log('Database Connected'))
} catch (error) {
     console.log("could not connect")
}


app.get('/', (req, res) => {
     res.send('Server is built')
})

app.get('/api/products', (req, res) => {
     res.status(200).json({
          data: data
     })
})

app.get('/api/product/:_id', (req, res) => {
     const product = data.products.find((x) => x._id === req.params._id)
     if (product) {
          res.send(product)
     } else {
          res.status(404).send({
               message: 'Product not found'
          })
     }
})

app.use('/api/users', userRouter)

app.use((err, req, res, next) => {
     res.statue(500).send({
          message: err.message
     })
})

const port = process.env.PORT

app.listen(port, () => {
     console.log(`Server started on http://localhost:${port}`)
})