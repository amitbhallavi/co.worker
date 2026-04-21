import User from "../models/userModel.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"



const registerUser = async (req, res) => {


   const { name, email, phone, password, profilePic } = req.body


   if (!name || !email || !phone || !password) {

      res.status(409)
      throw new Error(" Please Fill all the Fields ")


   }

   // check if user already exists 

   const phoneExist = await User.findOne({ phone: phone })
   const emailExist = await User.findOne({ email: email })

   if (phoneExist || emailExist) {

      res.status(401)
      throw new Error(" User Already Exists !")
   }
   // Hash Password
   const salt = bcrypt.genSaltSync(10);
   const hashPassword = bcrypt.hashSync(password, salt);




   const user = await User.create({
      name, email, phone, password: hashPassword, profilePic
   })


   if (!user) {

      res.status(409)
      throw new Error(" User Not Resistered !")
   }
   res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePic: user.profilePic,
      isAdmin: user.isAdmin,
      isFreelancer: user.isFreelancer,
      credits: user.credits,
      token: gerenateToken(user._id)
   })

}


const loginUser = async (req, res) => {

   const { email, password } = req.body


   if (!email || !password) {

      res.status(409)
      throw new Error(" Please Fill all the Fields ")

   }

   let user = await User.findOne({ email: email })
   if (!user) {
      res.status(400)
      throw new Error("Invalid Credentials")
   }

   if (bcrypt.compareSync(password, user.password)) {
      res.status(200).json({
         _id: user.id,
         name: user.name,
         email: user.email,
         phone: user.phone,
         profilePic: user.profilePic,
         isAdmin: user.isAdmin,
         isFreelancer: user.isFreelancer,
         credits: user.credits,
         token: gerenateToken(user._id)
      })

   } else {
      res.status(400)
      throw new Error("Invalid Credentials")
   }

}

const privateController = (req, res) => {

   res.send(" Request Made By : " + req.user.name)
}


const gerenateToken = (id) => {

   let token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '50d' })
   return token;
}


const getMe = async (req, res) => {
   try {
      const user = await require('../models/userModel').findById(req.user._id).select('-password')
      if (!user) return res.status(404).json({ message: 'User not found' })
      res.json(user)
   } catch (err) {
      res.status(500).json({ message: err.message })
   }
}

const authController = { registerUser, loginUser, privateController, gerenateToken, getMe }

export default authController;
