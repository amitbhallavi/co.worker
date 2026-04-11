import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { IoCallOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { TbLockPassword, } from "react-icons/tb";
import { FaRegCheckCircle } from "react-icons/fa";
import { ImFilePicture } from "react-icons/im";
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { registerUser } from '../features/auth/authSlice';
import LoaderGradient from '../components/LoaderGradient';



const Register = () => {

    
    const { user, isLoading, isError, message } = useSelector(state => state.auth)
    
    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    useEffect(() => {
        if (user) {
            navigate("/")

        }
        if (isError && message) {
            toast.error(message)

        }

    }, [isError, message, user]);

    if (isLoading) return (
        <div>
            <LoaderGradient />
        </div>
    );





    const [formData, setformData] = useState({

        name: "",
        email: "",
        phone: "",
        profilePic: "",
        password: "",
        confirmPassword: ""

    })

    const { name, email, phone, profilePic, password, confirmPassword } = formData

    const handelChange = (e) => {

        setformData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }


    const handelSumit = (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error(" Password Do Not Match")

        } else {
            dispatch(registerUser(formData))
        }
    }











    return (

        <>





            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full opacity-20 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
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




                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                            <p className="text-gray-600">Join thousands of professionals worldwide</p>
                        </div>


                        <form onSubmit={handelSumit} >

                            <div className="space-y-6">

                                {/*                             
                            <div>


                                <label className="block text-sm font-medium text-gray-700 mb-3">I want to</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <input type="radio" name="role" className="peer sr-only" />
                                        <label className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 transition-all duration-200">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-2">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-gray-900">Hire</span>
                                            <span className="text-xs text-gray-600 text-center mt-1">Post projects</span>
                                        </label>
                                    </div>


                                    <div className="relative">
                                        <input type="radio" name="role" className="peer sr-only" />
                                        <label className="flex flex-col items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 peer-checked:border-emerald-600 peer-checked:bg-emerald-50 transition-all duration-200">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-2">
                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                            </div>
                                            <span className="font-semibold text-gray-900">Work</span>
                                            <span className="text-xs text-gray-600 text-center mt-1">Find projects</span>
                                        </label>
                                    </div>
                                </div>



                            </div> */}

                                <div>


                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <CgProfile />

                                        </div>
                                        <input
                                            name='name'
                                            value={name}
                                            onChange={handelChange}
                                            type="text"
                                            placeholder="John Doe"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-white"
                                        />
                                    </div>



                                </div>



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
                                            autoComplete='on'
                                            placeholder="you@example.com"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none  bg-white"
                                        />
                                    </div>


                                </div>

                                <div>


                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <IoCallOutline />


                                        </div>

                                        <input
                                            name='phone'
                                            value={phone}
                                            onChange={handelChange}
                                            type="phone"
                                            autoComplete='on'
                                            placeholder="Phone Number"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none  bg-white"
                                        />


                                    </div>


                                </div>
                                <div>


                                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <ImFilePicture />



                                        </div>

                                        <input
                                            name='profilePic'
                                            value={profilePic}
                                            onChange={handelChange}
                                            autoComplete='on'
                                            type="url"
                                            placeholder="Profile Picture Link "
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none  bg-white"
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
                                            autoComplete='current-password'
                                            type="password"
                                            placeholder="Create a strong password"
                                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none   bg-white"
                                        />
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center text-xs text-gray-600">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                                            <span>At least 8 characters</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                                            <span>Mix of letters, numbers and symbols</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <FaRegCheckCircle />

                                        </div>
                                        <input

                                            name='confirmPassword'
                                            value={confirmPassword}
                                            onChange={handelChange}

                                            autoComplete='current-password  '
                                            type="password"
                                            placeholder="Confirm your password"
                                            className="w-full pl-12 pr-4 py-3 outline-none border border-gray-300 rounded-lg  bg-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <input type="checkbox" className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                    <label className="ml-2 text-sm text-gray-600">
                                        I agree to the{' '}
                                        <a className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                                            Terms of Service
                                        </a>
                                        {' '}and{' '}
                                        <a className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                                            Privacy Policy
                                        </a>
                                    </label>
                                </div>

                                <button type='submit' className="w-full bg-gradient-to-r cursor-pointer from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl ">
                                    Create Account
                                </button>




                                {/* <div className="relative">
                                                  <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                                                  </div>
                            <div className="relative flex justify-center text-sm">
                                                      <span className="px-4 bg-white text-gray-500">Or sign up with</span>
                            </div>
                                              </div>

                                              <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                                                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                                      <span className="text-sm font-medium text-gray-700">Google</span>
                            </button>
                            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
                                                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                                </svg>
                                                      <span className="text-sm font-medium text-gray-700">GitHub</span>
                            </button>
                                              </div> */}




                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link to={"/login"} className="font-semibold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors duration-200">
                                    Log In

                                </Link>
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>By signing up, you agree to our terms and privacy policy</p>
                    </div>


                </div>


            </div>

        </>


    )



}

export default Register
