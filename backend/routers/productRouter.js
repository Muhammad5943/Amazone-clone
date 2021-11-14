import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import data from '../data.js'
import Product from '../models/productModel.js'
import { isAdmin, isAuth, isSellerOrAdmin } from '../utils.js'

const productRouter = express.Router()

productRouter.get(
     '/',
     expressAsyncHandler(async (req,res) => {
          // try {
               const name = req.query.name || ''
               const category = req.query.category || ''
               const seller = req.query.seller || ''
               const sellerFilter = seller ? { seller } : {}
               const nameFilter = name ? { name: { $regex: name, $options: 'i' } } : {}
               const categoryFilter = category ? { category } : {}
               const products = await Product.find({ 
                    ...sellerFilter,
                    ...nameFilter,
                    ...categoryFilter
               }).populate(
                    'seller',
                    'seller.name seller.logo'
               )

               res.status(200).json({
                    products: products
               })

               // console.log('productAPI ', products[0].seller._id)
          // } catch (error) {
          //      res.status(500).json({
          //           error: error
          //      })
          // }
     })
)

productRouter.get(
     '/categories',
     expressAsyncHandler(async (req, res) => {
          const categories = await Product.find().distinct('category')

          // console.log('categories ', categories)
          res.status(200).json({
               categories: categories
          })
     })
)

productRouter.post(
     '/seed',
     expressAsyncHandler(async (req,res) => {
          // try {
               console.log('data ', data)
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
               .populate(
                    'seller',
                    'seller.name seller.logo seller.rating seller.numReviews'
               )

               // console.log('productId ', product)
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
     isSellerOrAdmin,
     expressAsyncHandler(async (req,res) => {
          // try {
               const product = new Product({
                    name: 'Muhammad Aji ' + Date.now(),
                    seller: req.user._id,
                    image: '/images/p1.png',
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
          // } catch (error) {
          //      res.status(500).json({
          //           error: error
          //      })
          // }
     })
)

productRouter.put(
     '/:_id',
     isAuth,
     isSellerOrAdmin,
     expressAsyncHandler(async (req,res) => {
          const productId = req.params._id
          const product = await Product.findById(productId)

          if (product) {
               product.name = req.body.name
               product.price = req.body.price
               product.image = req.body.image
               product.category = req.body.category
               product.brand = req.body.brand
               product.countInStock = req.body.countInStock
               product.description = req.body.description
               
               const updatedProduct = await product.save()
               res.status(200).json({ 
                    message: 'Product Updated', 
                    product: updatedProduct 
               })
          } else {
               res.status(404).json({ 
                    message: 'Product Not Found' 
               })
          }
     })
)

productRouter.delete(
     '/:_id',
     isAuth,
     isAdmin,
     expressAsyncHandler(async (req, res) => {
          const product = await Product.findById(req.params._id)
          if (product) {
               const deleteProduct = await product.remove()
               res.status(200).json({ 
                    message: 'Product Deleted', 
                    product: deleteProduct 
               })
          } else {
               res.status(404).json({ 
                    message: 'Product Not Found' 
               })
          }
     })
)

export default productRouter