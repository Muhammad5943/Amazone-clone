import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import data from '../data.js'
import User from '../models/userModel.js'
import { generateToken, isAdmin, isAuth } from '../utils.js'

const userRouter = express.Router()

userRouter.get(
     '/top-sellers',
     expressAsyncHandler(async (req, res) => {
          const topSellers = await User.find({ isSeller: true })
               .sort({ 'seller.rating': -1 })
               .limit(3);
          res.send(topSellers);
     })
)

userRouter.get(
     '/seed',
     expressAsyncHandler(async (req,res) => {
          // await User.remove({})
          // console.log('inside')
          const Users = await User.find()
          res.status(200).json({ Users: Users }) 
     })
)

userRouter.post(
     '/seed',
     expressAsyncHandler(async (req,res) => {
          // await User.remove({})
          // console.log('inside')
          const createdUsers = await User.insertMany(data.users)
          res.status(200).json({ createdUsers }) 
     })
)

userRouter.post(
     '/signin',
     expressAsyncHandler(async (req,res) => {
          const user = await User.findOne({ email: req.body.email })
          // console.log('user ', user)
          // console.log(bcrypt.compareSync(req.body.password, user.password))
          if (user) {
               if (bcrypt.compareSync(req.body.password, user.password)) {
                    res.status(200).send({
                         _id: user._id,
                         name: user.name,
                         email: user.email,
                         isAdmin: user.isAdmin,
                         isSeller: user.isSeller,
                         token: generateToken(user)
                    })

                    return
               }
          }

          res.status(401).json({
               error: 'Email or Password was invalid'
          })
     })
)

userRouter.post(
     '/register',
     expressAsyncHandler(async (req,res) => {
          const user = new User({
               name: req.body.name,
               email: req.body.email,
               password: bcrypt.hashSync(req.body.password, 8)
          })

          const createdUser = await user.save()
          res.status(200).send({
               _id: createdUser._id,
               name: createdUser.name,
               email: createdUser.email,
               isAdmin: createdUser.isAdmin,
               isSeller: user.isSeller,
               token: generateToken(createdUser)
          })
     })
)

userRouter.get(
     '/:_id',
     isAuth,
     expressAsyncHandler(async (req,res) => {
          const user = await User.findById(req.params._id)
          if (user) {
               res.status(200).json({
                    user: user
               })
          } else {
               res.status(404).json({
                    message: 'User Not Found'
               })
          }
     })
)

userRouter.put(
     '/profile',
     isAuth,
     expressAsyncHandler(async (req,res) => {
          const user = await User.findById(req.user._id)
          // console.log('user ', user)
          if (user) {
               user.name = req.body.name || user.name
               user.email = req.body.email || user.email
               if (user.isSeller) {
                    user.seller.name = req.body.sellerName || user.seller.name
                    user.seller.logo = req.body.sellerLogo || user.seller.logo
                    user.seller.description =
                         req.body.sellerDescription || user.seller.description
               }
               if (req.body.password) {
                    user.password = bcrypt.hashSync(req.body.password, 8)
               }

               Object.assign(user)
               // console.log('save token', Object.assign(user))
               const updateUser = await user.save()
               res.status(200).json({
                    _id: updateUser._id,
                    name: updateUser.name,
                    email: updateUser.email,
                    isAdmin: updateUser.isAdmin,
                    isSeller: user.isSeller,
                    token: generateToken(updateUser)
               })
          }
     })
)

userRouter.get(
     '/',
     isAuth,
     isAdmin,
     expressAsyncHandler(async (req, res) => {
          const users = await User.find({})
          res.status(200).json({
               'users': users
          })
     })
)

userRouter.put(
     '/:_id',
     isAuth,
     isAdmin,
     expressAsyncHandler(async (req, res) => {
          // console.log('inside')
          const user = await User.findById(req.params._id)
          // console.log('user ', user)
          if (user) {
               user.name = req.body.name || user.name
               user.email = req.body.email || user.email
               user.isSeller = req.body.isSeller ? !user.isSeller : user.isSeller
               user.isAdmin = req.body.isAdmin ? !user.isAdmin : user.isAdmin
               
               const updatedUser = await user.save()
               res.status(200).json({ 
                    message: 'User Updated', 
                    user: updatedUser 
               })
          } else {
               res.status(404).json({ 
                    message: 'User Not Found' 
               })
          }
     })
)

userRouter.delete(
     '/:_id',
     isAuth,
     isAdmin,
     expressAsyncHandler(async (req, res) => {
          const user = await User.findById(req.params._id)

          if (user) {
               if (user.isAdmin === true) {
                    res.status(400).json({ 
                         message: 'Can Not Delete Admin User',
                         user: user
                    })

                    return
               }

               const deleteUser = await user.remove()
               res.status(200).json({ 
                    message: 'User Deleted', 
                    user: deleteUser
               })
          } else {
               res.status(404).json({ 
                    message: 'User Not Found' 
               })
          }
     })
)

export default userRouter