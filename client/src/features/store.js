import { configureStore } from '@reduxjs/toolkit'
import auth from './auth/authSlice'
import admin from './admin/adminSlice'
import freelancer from './Freelancer/freelancerSlice'
import project from './project/projectSlice'
import wallet from './wallet/walletSlice'
import payment from './payment/paymentSlice'
import chat from './ChatsAndMessages/chatSlice'
import rating from './rating/ratingSlice'
import subscription from './subscription/planSlice'
import client from './client/clientSlice'

const store = configureStore({
    reducer: {
        auth,
        admin,
        freelancer,
        project,
        wallet,
        payment,
        chat,
        rating,
        subscription,
        client,
    },
})

export default store
