import { CircleAlert, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import AuthButton from './AuthButton'
import AuthInput from './AuthInput'
import AuthLinks from './AuthLinks'

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
        <section className="rounded-[30px] border border-slate-200/80 bg-white/95 px-5 py-6 shadow-2xl shadow-slate-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/35 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
            <div className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-900/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                    <Sparkles className="size-3.5" />
                    Secure workspace access
                </span>

                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[2rem]">
                    Sign in to your workspace
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Access projects, chats, payouts, and the tools you use every day from one faster and cleaner login flow.
                </p>
            </div>

            {serverError && (
                <div className="mb-5 flex items-start gap-3 rounded-[22px] border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    <p className="leading-6">{serverError}</p>
                </div>
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
                            className="rounded-full p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
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

                <div className="flex flex-col gap-3 text-sm text-slate-600 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-3 font-medium text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={onRememberChange}
                            className="size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-950"
                        />
                        <span>Remember me on this device</span>
                    </label>

                    <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-left font-semibold text-sky-700 transition-colors duration-200 hover:text-sky-800 dark:text-cyan-300 dark:hover:text-cyan-200 sm:text-right"
                    >
                        Forgot password?
                    </button>
                </div>

                <AuthButton type="submit" loading={isLoading} loadingLabel="Logging in...">
                    Log in
                </AuthButton>
            </form>

            <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span>Trusted access</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <div className="mb-6 grid gap-2 sm:grid-cols-3">
                {trustItems.map((item) => (
                    <span
                        key={item}
                        className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3 text-center text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    >
                        {item}
                    </span>
                ))}
            </div>

            <AuthLinks />
        </section>
    )
}

export default LoginForm
