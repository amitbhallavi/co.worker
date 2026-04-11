import { configureStore } from '@reduxjs/toolkit'
import auth from './auth/authSlice'
import admin from './admin/adminSlice'
import freelancer from './Freelancer/freelancerSlice'
import project from './project/projectSlice'

const store = configureStore({
    reducer: {auth , admin , freelancer , project}
})


export default store;
