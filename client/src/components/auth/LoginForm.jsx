import { motion } from 'framer-motion'
import { CircleAlert, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import AuthButton from './AuthButton'
import AuthInput from './AuthInput'
import AuthLinks from './AuthLinks'

const MotionSection = motion.section
const MotionDiv = motion.div

const trustItems = ['Protected sessions', 'Verified workflows', 'Client + freelancer ready']

const LoginForm = ({
    email,
    password,
    rememberMe,
    showPassword,
    isLoading,
    fieldErrors,
    serverError,
    credentialError,
    onChange,
    onSubmit,
    onRememberChange,
    onTogglePassword,
    onForgotPassword,
}) => {
    return (
        <MotionSection
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[32px] border border-white/80 bg-white/78 p-6 shadow-[0_40px_120px_-48px_rgba(15,23,42,0.4)] backdrop-blur-2xl sm:p-8 lg:p-10"
        >
            <div className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                    <Sparkles className="size-3.5" />
                    Secure workspace access
                </span>

                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                    Sign in to your workspace
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500">
                    Access projects, chats, payouts, and the tools you use every day from one calm, secure login flow.
                </p>
            </div>

            {serverError && (
                <MotionDiv
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 flex items-start gap-3 rounded-[22px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700"
                >
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    <p className="leading-6">{serverError}</p>
                </MotionDiv>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
                <AuthInput
                    id="login-email"
                    name="email"
                    type="email"
                    label="Email address"
                    value={email}
                    onChange={onChange}
                    autoComplete="email"
                    icon={Mail}
                    error={fieldErrors.email}
                    hasError={Boolean(fieldErrors.email) || credentialError}
                    autoFocus
                    disabled={isLoading}
                    required
                />

                <AuthInput
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    value={password}
                    onChange={onChange}
                    autoComplete="current-password"
                    icon={LockKeyhole}
                    error={fieldErrors.password}
                    hasError={Boolean(fieldErrors.password) || credentialError}
                    disabled={isLoading}
                    required
                    rightElement={(
                        <button
                            type="button"
                            onClick={onTogglePassword}
                            className="rounded-full p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <EyeOff className="size-4" />
                            ) : (
                                <Eye className="size-4" />
                            )}
                        </button>
                    )}
                />

                <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-3 font-medium text-slate-600">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={onRememberChange}
                            className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span>Remember me on this device</span>
                    </label>

                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-left font-semibold text-sky-700 transition-colors duration-200 hover:text-sky-800 sm:text-right"
                    >
                        Forgot password?
                    </button>
                </div>

                <AuthButton type="submit" loading={isLoading} loadingLabel="Logging in...">
                    Log in
                </AuthButton>
            </form>

            <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                <div className="h-px flex-1 bg-slate-200" />
                <span>Trusted access</span>
                <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
                {trustItems.map((item) => (
                    <span
                        key={item}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.32)]"
                    >
                        {item}
                    </span>
                ))}
            </div>

            <AuthLinks />
        </MotionSection>
    )
}

export default LoginForm
