import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import Order from '../models/orderModel.js'
import { isAuth } from '../utils.js'

const orderRouter = express.Router()

orderRouter.post(
     '/',
     isAuth,
     expressAsyncHandler(async (req, res) => {
          if (req.body.orderItems.length === 0) {
               res.status(400).json({
                    message: 'Cart is empty'
               })
          } else {
               const order = new Order({
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
          const order = await Order.findById(req.params._id)
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

export default orderRouter