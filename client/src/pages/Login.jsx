import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import LoginForm from '../components/auth/LoginForm'
import LoginLayout from '../components/auth/LoginLayout'
import { loginUser } from '../features/auth/authSlice'

const EMPTY_ERRORS = {
    email: '',
    password: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const formatAuthMessage = (message = '') => {
    if (/invalid credentials/i.test(message)) {
        return 'Invalid credentials. Double-check your email and password and try again.'
    }

    if (/required/i.test(message)) {
        return 'Email and password are required.'
    }

    return message
}

const validateFields = ({ email, password }) => {
    const errors = { ...EMPTY_ERRORS }

    if (!email) {
        errors.email = 'Email is required'
    } else if (!EMAIL_PATTERN.test(email)) {
        errors.email = 'Enter a valid email address'
    }

    if (!password) {
        errors.password = 'Password is required'
    }

    return errors
}

const Login = () => {
    const { user, isLoading, isError, message } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [rememberMe, setRememberMe] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [showServerFeedback, setShowServerFeedback] = useState(false)

    const { email, password } = formData

    const serverError = showServerFeedback && isError ? formatAuthMessage(message) : ''
    const credentialError = /invalid credentials/i.test(serverError)

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))

        setFieldErrors((current) => ({
            ...current,
            [name]: '',
        }))

        setShowServerFeedback(false)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setHasSubmitted(true)

        const payload = {
            email: formData.email.trim(),
            password: formData.password,
        }

        const nextErrors = validateFields(payload)
        setFieldErrors(nextErrors)

        if (Object.values(nextErrors).some(Boolean)) {
            setShowServerFeedback(false)
            return
        }

        setShowServerFeedback(true)
        dispatch(loginUser(payload))
    }

    useEffect(() => {
        if (user) {
            if (hasSubmitted) {
                toast.success('Login successful 🎉')
            }

            navigate('/')
        }
    }, [user, hasSubmitted, navigate])

    useEffect(() => {
        if (serverError) {
            toast.error(serverError)
        }
    }, [serverError])

    const handleForgotPassword = () => {
        toast.info("Password recovery isn't available yet. Please contact support for help.")
    }

    return (
        <LoginLayout>
            <LoginForm
                email={email}
                password={password}
                rememberMe={rememberMe}
                showPassword={showPassword}
                isLoading={isLoading}
                fieldErrors={fieldErrors}
                serverError={serverError}
                credentialError={credentialError}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onRememberChange={(event) => setRememberMe(event.target.checked)}
                onTogglePassword={() => setShowPassword((current) => !current)}
                onForgotPassword={handleForgotPassword}
            />
        </LoginLayout>
    )
}

export default Login
