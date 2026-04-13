import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { IoCallOutline } from "react-icons/io5"
import { CgProfile } from "react-icons/cg"
import { MdOutlineAlternateEmail } from "react-icons/md"
import { TbLockPassword } from "react-icons/tb"
import { FaRegCheckCircle } from "react-icons/fa"
import { ImFilePicture } from "react-icons/im"
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { registerUser } from '../features/auth/authSlice'
import LoaderGradient from '../components/LoaderGradient'

const Register = () => {

    // ── ✅ SAARE HOOKS UPAR — koi bhi return se pehle ──────────────────────────
    const { user, isLoading, isError, message } = useSelector(s => s.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    // ✅ useState bhi upar — early return se pehle
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        profilePic: "",
        password: "",
        confirmPassword: "",
    })

    const { name, email, phone, profilePic, password, confirmPassword } = formData

    // ── Effects ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (user) navigate("/")
        if (isError && message) toast.error(message)
    }, [user, isError, message, navigate])

    // ── ✅ Early return HOOKS KE BAAD ─────────────────────────────────────────
    if (isLoading) return <LoaderGradient />

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleChange = e => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = e => {
        e.preventDefault()
        if (!name || !email || !password) {
            toast.error("Please fill all required fields")
            return
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }
        dispatch(registerUser(formData))
    }

    // ── JSX ────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-400 rounded-full opacity-20 blur-3xl" />
                <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-blue-400 rounded-full opacity-20 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400 rounded-full opacity-20 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white">

                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center space-x-2 mb-6">
                            <Link to="/">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </Link>
                            <Link to="/">
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                    Co.worker
                                </span>
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-600">Join thousands of professionals worldwide</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5">

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <CgProfile className="text-gray-400" />
                                    </div>
                                    <input
                                        name="name"
                                        value={name}
                                        onChange={handleChange}
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <MdOutlineAlternateEmail className="text-gray-400" />
                                    </div>
                                    <input
                                        name="email"
                                        value={email}
                                        onChange={handleChange}
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <IoCallOutline className="text-gray-400" />
                                    </div>
                                    <input
                                        name="phone"
                                        value={phone}
                                        onChange={handleChange}
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Profile Pic */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture URL</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <ImFilePicture className="text-gray-400" />
                                    </div>
                                    <input
                                        name="profilePic"
                                        value={profilePic}
                                        onChange={handleChange}
                                        type="url"
                                        placeholder="https://example.com/photo.jpg"
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <TbLockPassword className="text-gray-400" />
                                    </div>
                                    <input
                                        name="password"
                                        value={password}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="Create a strong password"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                                    />
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="flex items-center text-xs text-gray-500">
                                        <span className={`w-2 h-2 rounded-full mr-2 ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`} />
                                        At least 8 characters
                                    </p>
                                    <p className="flex items-center text-xs text-gray-500">
                                        <span className={`w-2 h-2 rounded-full mr-2 ${/[0-9]/.test(password) ? "bg-green-500" : "bg-gray-300"}`} />
                                        Include a number
                                    </p>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <FaRegCheckCircle className={`${confirmPassword && confirmPassword === password ? "text-green-500" : "text-gray-400"}`} />
                                    </div>
                                    <input
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={handleChange}
                                        type="password"
                                        placeholder="Confirm your password"
                                        required
                                        className={`w-full pl-12 pr-4 py-3 border rounded-lg outline-none bg-white transition
                      ${confirmPassword && confirmPassword !== password
                                                ? "border-red-400 focus:ring-red-400"
                                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                            } focus:ring-1`}
                                    />
                                    {confirmPassword && confirmPassword !== password && (
                                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                    )}
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start">
                                <input
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm text-gray-600">
                                    I agree to the{" "}
                                    <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">Terms of Service</span>
                                    {" "}and{" "}
                                    <span className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">Privacy Policy</span>
                                </label>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Creating Account...
                                    </span>
                                ) : "Create Account"}
                            </button>

                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account?{" "}
                            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition">
                                Log In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-500">
                    By signing up, you agree to our terms and privacy policy
                </p>
            </div>
        </div>
    )
}

export default Register