import { CircleAlert, Eye, EyeOff, LockKeyhole, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import AuthButton from './AuthButton'
import AuthInput from './AuthInput'
import AuthLinks from './AuthLinks'
import SocialAuthButtons from './SocialAuthButtons'

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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center px-4 py-8 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
            </div>

            {/* Main content container */}
            <div className="relative z-10 w-full max-w-md">
                {/* Animated card container */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-blue-950/50 hover:border-white/[0.2] transition-all duration-300">
                    {/* Header section */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center shadow-lg shadow-blue-500/50">
                                <LockKeyhole className="w-5 h-5 text-slate-950" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-100 bg-clip-text text-transparent">
                                Welcome Back
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-300 mt-3">
                            Sign in to your account and continue your journey
                        </p>
                    </div>

                    {/* Server error alert */}
                    {serverError && (
                        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-400/30 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="flex items-start gap-3">
                                <CircleAlert className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-rose-200 leading-relaxed">
                                    {serverError}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Social auth section */}
                    <div className="mb-8">
                        <SocialAuthButtons disabled={isLoading} />
                    </div>

                    {/* Divider */}
                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900 text-slate-400 font-semibold uppercase tracking-widest">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Email input */}
                        <div className="relative group">
                            <AuthInput
                                id="login-email"
                                name="email"
                                type="email"
                                label="Email address"
                                value={email}
                                onChange={onChange}
                                autoComplete="email"
                                icon={Mail}
                                placeholder="you@example.com"
                                error={fieldErrors.email}
                                hasError={Boolean(fieldErrors.email) || credentialError}
                                autoFocus
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Password input */}
                        <div className="relative group">
                            <AuthInput
                                id="login-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                value={password}
                                onChange={onChange}
                                autoComplete="current-password"
                                icon={LockKeyhole}
                                placeholder="Enter your password"
                                error={fieldErrors.password}
                                hasError={Boolean(fieldErrors.password) || credentialError}
                                disabled={isLoading}
                                required
                                rightElement={(
                                    <button
                                        type="button"
                                        onClick={onTogglePassword}
                                        className="rounded-full p-2 text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20"
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
                        </div>

                        {/* Remember and forgot password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="inline-flex items-center gap-2.5 font-medium text-slate-300 hover:text-slate-200 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={onRememberChange}
                                    className="w-4 h-4 rounded border-slate-500 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
                                />
                                <span>Remember me</span>
                            </label>

                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors duration-200 hover:shadow-lg hover:shadow-cyan-500/20 rounded-lg px-3 py-1"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit button */}
                        <div className="pt-2">
                            <AuthButton 
                                type="submit" 
                                loading={isLoading} 
                                loadingLabel="Signing in..."
                                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sign In
                                {!isLoading && <ArrowRight className="w-4 h-4" />}
                            </AuthButton>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="text-center">
                            <p className="text-sm text-slate-400 mb-3">
                                Don't have an account?
                            </p>
                            <AuthLinks 
                                prompt="" 
                                linkText="Create account now"
                                className="text-cyan-300 hover:text-cyan-200 font-bold text-base"
                            />
                        </div>
                    </div>

                    {/* Benefits section */}
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>Secure encryption</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>2FA protection</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>24/7 support</span>
                        </div>
                    </div>
                </div>

                {/* Bottom decorative element */}
                <div className="mt-8 text-center">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                        Trusted by 10,000+ freelancers
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginForm
