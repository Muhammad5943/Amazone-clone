import express from 'express'
import expressAsyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import data from '../data.js'
import User from '../models/userModel.js'
import { generateToken, isAuth } from '../utils.js'

const userRouter = express.Router()

userRouter.get(
     '/seed',
     expressAsyncHandler(async (req,res) => {
          // await User.remove({})
          // console.log('inside');
          const Users = await User.find()
          res.status(200).json({ Users: Users }) 
     })
)

userRouter.post(
     '/seed',
     expressAsyncHandler(async (req,res) => {
          // await User.remove({})
          // console.log('inside');
          const createdUsers = await User.insertMany(data.users)
          res.status(200).json({ createdUsers }) 
     })
)

userRouter.post(
     '/signin',
     expressAsyncHandler(async (req,res) => {
          const user = await User.findOne({ email: req.body.email })
          // console.log('user ', user);
          // console.log(bcrypt.compareSync(req.body.password, user.password))
          if (user) {
               if (bcrypt.compareSync(req.body.password, user.password)) {
                    res.status(200).send({
                         _id: user._id,
                         name: user.name,
                         email: user.email,
                         isAdmin: user.isAdmin,
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
               token: generateToken(createdUser)
          })
     })
)

userRouter.get(
     '/:_id',
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
          // console.log('user ', user);
          if (user) {
               user.name = req.body.name || user.name
               user.email = req.body.email || user.email
               if (req.body.password) {
                    user.password = bcrypt.hashSync(req.body.password, 8)
               }

               Object.assign(user)
               // console.log('save token', Object.assign(user));
               const updateUser = await user.save()
               res.status(201).json({
                    _id: updateUser._id,
                    name: updateUser.name,
                    email: updateUser.email,
                    isAdmin: updateUser.isAdmin,
                    token: generateToken(updateUser)
               })
          }
     })
)

export default userRouter