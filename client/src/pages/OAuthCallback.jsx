import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { LoaderCircle } from 'lucide-react'
import { completeOAuthLogin } from '../features/auth/authSlice'

const OAuthCallback = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const token = searchParams.get('token')
        const authError = searchParams.get('authError') || searchParams.get('error')

        if (authError) {
            toast.error(authError)
            navigate('/login', { replace: true })
            return
        }

        if (!token) {
            toast.error('Social login failed. Missing session token.')
            navigate('/login', { replace: true })
            return
        }

        dispatch(completeOAuthLogin(token))
            .unwrap()
            .then(() => {
                toast.success('Login successful')
                navigate('/', { replace: true })
            })
            .catch((message) => {
                toast.error(message || 'Unable to complete social login')
                navigate('/login', { replace: true })
            })
    }, [dispatch, navigate, searchParams])

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-slate-950 dark:text-white">
            <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-7 text-center shadow-xl shadow-slate-950/10 dark:border-white/10 dark:bg-slate-900">
                <LoaderCircle className="mx-auto mb-4 size-7 animate-spin text-sky-600" />
                <h1 className="text-lg font-semibold">Completing login</h1>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Please wait while we secure your session.
                </p>
            </div>
        </div>
    )
}

export default OAuthCallback
