import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'
import {
     isAdmin,
     isAuth,
     isSellerOrAdmin,
     mailgun,
     payOrderEmailTemplate,
} from '../utils.js'

const orderRouter = express.Router()

orderRouter.get(
     '/',
     isAuth,
     isSellerOrAdmin,
     expressAsyncHandler(async (req, res) => {
          const seller = req.query.seller || ''
          const sellerFilter = seller ? { seller } : {}

          const orders = await Order.find({ ...sellerFilter })
          .populate(
               'user',
               'name'
          )
          res.status(200).json({
               orders: orders
          })
     })
)

orderRouter.get(
     '/mine',
     isAuth,
     expressAsyncHandler(async (req,res) => {
          try {
               const orders = await Order.find({
                    user: req.user._id
               })

               if (!orders) {
                    res.status(404).json({
                         message: 'Order not found'
                    })
               }
     
               // console.log('user Auth ', req.user._id)
     
               // console.log('orders data ', orders)
     
               res.status(200).json({
                    orders: orders
               })
          } catch (error) {
               res.status(500).json({
                    message: "server error",
                    error: error
               })              
          }
     })
)

orderRouter.post(
     '/',
     isAuth,
     expressAsyncHandler(async (req, res) => {
          try {
               if (req.body.orderItems.length === 0) {
                    res.status(400).json({
                         message: 'Cart is empty'
                    })
               } else {
                    const order = new Order({
                         seller: req.body.orderItems[0].seller,
                         orderItems: req.body.orderItems,
                         shippingAddress: req.body.shippingAddress,
                         paymentMethod: req.body.paymentMethod,
                         itemsPrice: req.body.itemsPrice,
                         shippingPrice: req.body.shippingPrice,
                         taxPrice: req.body.taxPrice,
                         totalPrice: req.body.totalPrice,
                         user: req.user._id
                    })
     
                    const createdOrder = await order.save()
                    res.status(201).json({
                         message: 'New Order Created', 
                         order: createdOrder
                    })
               }
          } catch (error) {
               res.status(500).json({
                    message: "server error",
                    error: error
               })
          }
     })
)

orderRouter.get(
     '/:_id',
     isAuth,
     expressAsyncHandler(async (req, res) => {
          const order = await Order.findById(req.params._id)
          if (order) {
               res.status(200).json({
                    order: order
               })
          } else {
               res.status(404).json({
                    message: 'Order Not Found'
               })
          }
     })
)

orderRouter.put(
     '/:_id/pay',
     isAuth,
     expressAsyncHandler(async (req,res) => {
          const order = await Order.findById(req.params.id).populate(
               'user',
               'email name'
          )
          if (order) {
               order.isPaid = true
               order.paidAt = Date.now()
               order.paymentResult = {
                    _id: req.body._id,
                    status: req.body.status,
                    update_time: req.body.update_time,
                    email_address: req.body.email_address
               }

               const updatedOrder = await order.save()
               res.status(200).json({
                    order: updatedOrder,
                    message: 'Order was paid'
               })
          } else {
               res.status(404).json({
                    message: 'Order not found'
               })
          } 
     })
)

orderRouter.delete(
     '/:_id',
     isAuth,
     isAdmin,
     expressAsyncHandler(async (req, res) => {
          const order = await Order.findById(req.params._id)
          if (order) {
               const deleteOrder = await order.remove()
               res.status(200).json({ 
                    message: 'Order Deleted', 
                    order: deleteOrder 
               })
          } else {
               res.status(404).json({ 
                    message: 'Order Not Found' 
               })
          }
     })
)

orderRouter.put(
     '/:_id/deliver',
     isAuth,
     isAdmin,
     expressAsyncHandler(async (req, res) => {
          const order = await Order.findById(req.params._id)
          if (order) {
               order.isDelivered = true
               order.deliveredAt = Date.now()
          
               const updatedOrder = await order.save()
               res.status(200).json({ 
                    message: 'Order Delivered', 
                    order: updatedOrder 
               })
          } else {
               res.status(404).json({ 
                    message: 'Order Not Found'
               })
          }
     })
)

export default orderRouter