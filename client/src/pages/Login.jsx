import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdOutlineAlternateEmail } from "react-icons/md";
import { TbLockPassword } from "react-icons/tb";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { loginUser } from '../features/auth/authSlice';
import LoaderGradient from '../components/LoaderGradient';

const Login = () => {

    const { user, isLoading, isError, message } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [formData, setformData] = useState({
        email: "",
        password: "",
    })

    const { email, password } = formData

    const handelChange = (e) => {
        setformData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handelSubmit = (e) => {
        e.preventDefault()
        dispatch(loginUser(formData))
    }

    // ✅ FIX 1: user navigate alag useEffect mein
    useEffect(() => {
        if (user) {
            navigate("/")
        }
    }, [user, navigate])

    // ✅ FIX 2: error alag useEffect mein - loop band!
    useEffect(() => {
        if (isError && message) {
            toast.error(message)
        }
    }, [isError, message])

    if (isLoading) return (
        <div>
            <LoaderGradient />
        </div>
    );

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex flex-col items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full opacity-20 blur-3xl"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center space-x-2 mb-6">
                                <Link to={"/"}>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                </Link>
                                <Link to={"/"}>
                                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">FreelanceHub</span>
                                </Link>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                            <p className="text-gray-600">Login in to continue to your account</p>
                        </div>

                        <form onSubmit={handelSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <MdOutlineAlternateEmail />
                                        </div>
                                        <input
                                            name='email'
                                            value={email}
                                            onChange={handelChange}
                                            type="email"
                                            placeholder="you@example.com"
                                            autoComplete="email"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 outline-none rounded-lg bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <TbLockPassword />
                                        </div>
                                        <input
                                            name='password'
                                            value={password}
                                            onChange={handelChange}
                                            type="password"
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                        <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                    </label>
                                    <Link to={" "} className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-700 transition-colors duration-200">
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type='submit'
                                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl cursor-pointer">
                                    Log In
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to={"/register"} className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
                                    Create an Account
                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>Protected by enterprise-grade security</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login