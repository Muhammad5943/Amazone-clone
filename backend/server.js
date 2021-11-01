import express from 'express'
// import data from './data.js'
import dotenv from 'dotenv'
import morgan from 'morgan'
import mongoose from 'mongoose'
import bodyParser from 'body-parser'
import userRouter from './routers/userRouter.js'
import productRouter from './routers/productRouter.js'
import orderRouter from './routers/orderRouter.js'

dotenv.config()

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
/* from the original */
// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

try {
     mongoose.connect(process.env.MONGODB_URL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: true
     }, () => console.log('Database Connected'))
} catch (error) {
     console.log("could not connect to database")
}

app.use(morgan('dev'))

app.get('/', (req, res) => {
     res.send('Server is built')
})

// app.get('/api/products', (req, res) => {
//      res.status(200).json({
//           data: data
//      })
// })

// app.get('/api/product/:_id', (req, res) => {
//      const product = data.products.find((x) => x._id === req.params._id)
//      if (product) {
//           res.send(product)
//      } else {
//           res.status(404).send({
//                message: 'Product not found'
//           })
//      }
// })

app.use('/api/users', userRouter)
app.use('/api/products', productRouter)
app.use('/api/orders', orderRouter)
app.use('/api/config/paypal', (req,res) => {
     res.status(200).send(process.env.PAYPAL_CLIENT_ID)
})

app.use((err, req, res, next) => {
     res.status(500).send({
          message: err.message
     })
})

const port = process.env.PORT

app.listen(port, () => {
     console.log(`Server started on http://127.0.0.1:${port}`)
})