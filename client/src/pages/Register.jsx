import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import LoginLayout from '../components/auth/LoginLayout'
import RegisterForm from '../components/auth/RegisterForm'
import { registerUser } from '../features/auth/authSlice'

const EMPTY_ERRORS = {
    name: '',
    email: '',
    phone: '',
    profilePic: '',
    password: '',
    confirmPassword: '',
    terms: '',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[0-9+\-\s()]{8,20}$/

const formatRegisterMessage = (message = '') => {
    if (/user already exists/i.test(message)) {
        return 'An account with this email or phone number already exists.'
    }

    if (/all fields are required/i.test(message)) {
        return 'Please complete every required field before continuing.'
    }

    return message
}

const isValidUrl = (value) => {
    try {
        new URL(value)
        return true
    } catch {
        return false
    }
}

const validateFields = ({ name, email, phone, profilePic, password, confirmPassword, termsAccepted }) => {
    const errors = { ...EMPTY_ERRORS }

    if (!name.trim()) {
        errors.name = 'Full name is required'
    }

    if (!email.trim()) {
        errors.email = 'Email is required'
    } else if (!EMAIL_PATTERN.test(email.trim())) {
        errors.email = 'Enter a valid email address'
    }

    if (!phone.trim()) {
        errors.phone = 'Phone number is required'
    } else if (!PHONE_PATTERN.test(phone.trim())) {
        errors.phone = 'Enter a valid phone number'
    }

    if (profilePic.trim() && !isValidUrl(profilePic.trim())) {
        errors.profilePic = 'Enter a valid image URL'
    }

    if (!password) {
        errors.password = 'Password is required'
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
    }

    if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your password'
    } else if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match'
    }

    if (!termsAccepted) {
        errors.terms = 'Please accept the terms to continue'
    }

    return errors
}

const Register = () => {
    const { user, isLoading, isError, message } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        profilePic: '',
        password: '',
        confirmPassword: '',
    })
    const [termsAccepted, setTermsAccepted] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [showServerFeedback, setShowServerFeedback] = useState(false)

    const serverError = showServerFeedback && isError ? formatRegisterMessage(message) : ''

    const passwordStrength = {
        length: formData.password.length >= 6,
        number: /\d/.test(formData.password),
    }

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

    const handleToggleTerms = (event) => {
        setTermsAccepted(event.target.checked)
        setFieldErrors((current) => ({
            ...current,
            terms: '',
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        setHasSubmitted(true)

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            profilePic: formData.profilePic.trim(),
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            termsAccepted,
        }

        const nextErrors = validateFields(payload)
        setFieldErrors(nextErrors)

        if (Object.values(nextErrors).some(Boolean)) {
            toast.error('Please fix the highlighted fields')
            setShowServerFeedback(false)
            return
        }

        setShowServerFeedback(true)
        dispatch(registerUser({
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            profilePic: payload.profilePic,
            password: payload.password,
        }))
    }

    useEffect(() => {
        if (user) {
            if (hasSubmitted) {
                toast.success('Account created successfully 🎉')
            }

            navigate('/')
        }
    }, [user, hasSubmitted, navigate])

    useEffect(() => {
        if (serverError) {
            toast.error(serverError)
        }
    }, [serverError])

    return (
        <LoginLayout
            mobileTitle="Create your account"
            mobileDescription="Start working with clients and freelancers in one secure workspace"
        >
            <RegisterForm
                formData={formData}
                isLoading={isLoading}
                showPassword={showPassword}
                showConfirmPassword={showConfirmPassword}
                fieldErrors={fieldErrors}
                serverError={serverError}
                passwordStrength={passwordStrength}
                termsAccepted={termsAccepted}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onTogglePassword={() => setShowPassword((current) => !current)}
                onToggleConfirmPassword={() => setShowConfirmPassword((current) => !current)}
                onToggleTerms={handleToggleTerms}
            />
        </LoginLayout>
    )
}

export default Register
