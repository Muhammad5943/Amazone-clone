import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import data from '../data.js'
import Product from '../models/productModel.js'
import { isAdmin, isAuth } from '../utils.js'

const productRouter = express.Router()

productRouter.get(
     '/',
     expressAsyncHandler(async (req,res) => {
          // try {
               const products = await Product.find({})
               // console.log('products ', products);
               res.status(200).json({
                    products: products
               })
          // } catch (error) {
          //      res.status(500).json({
          //           error: error
          //      })
          // }
     })
)

productRouter.post(
     '/seed',
     expressAsyncHandler(async (req,res) => {
          // try {
               console.log('data ', data);
               if (data.products) {
                    const createProducts = await Product.insertMany(data.products)
                    res.status(201).json({
                         products: createProducts
                    })
               } else {
                    res.status(404).json({
                         message: "product not found"
                    })
               }
          // } catch (error) {
          //      res.status(500).json({
          //           error: error
          //      })
          // }
     })
)

productRouter.get(
     '/:_id',
     expressAsyncHandler(async (req,res) => {
          // try {
               const product = await Product.findById(req.params._id)
               if (product) {
                    res.status(200).json({
                         product: product
                    })
               } else {
                    res.status(404).json({
                         message: 'Product not found'
                    })
               }
          // } catch (error) {
          //      res.status(500).json({
          //           error: error
          //      })
          // }
     })
)

productRouter.post(
     '/',
     isAuth,
     isAdmin,
     expressAsyncHandler(async (req,res) => {
          const product = new Product({
               name: 'Muhammad Aji ' + Date.now(),
               image: '/images/p1.jpg',
               price: 0,
               category: 'sample category',
               brand: 'sample brand',
               countInStock: 0,
               rating: 0,
               numReviews: 0,
               description: 'sample description'
          })

          const productCreated = await product.save()
          res.status(201).json({
               message: 'Product Created',
               product: productCreated
          })
     })
)

export default productRouter