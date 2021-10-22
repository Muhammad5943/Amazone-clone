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

const port = process.env.PORT

app.listen(port, () => {
     console.log(`Server started on http://localhost:${port}`)
})