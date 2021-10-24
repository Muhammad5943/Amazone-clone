import express from 'express'
import data from './data.js'
import dotenv from 'dotenv'

dotenv.config()

const app = express()

app.get('/', (req, res) => {
     res.send('Server is built')
});

app.get('/api/products', (req, res) => {
     res.status(200).json({
          data: data
     })
})

app.get('/api/product/:_id', (req, res) => {
     console.log('data ', data.products);
     const product = data.products.find((x) => x._id === req.params._id)
     console.log('productId ', req.params._id);
     console.log('product ', product);
     if (product) {
          res.send(product)
     } else {
          res.status(404).send({
               message: 'Product not found'
          })
     }
})

const port = process.env.PORT

app.listen(port, () => {
     console.log(`Server started on http://localhost:${port}`)
})