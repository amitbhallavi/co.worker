import {
    BadgeCheck,
    CircleAlert,
    Eye,
    EyeOff,
    ImagePlus,
    LockKeyhole,
    Mail,
    Phone,
    UserRound,
    Sparkles,
    CheckCircle2,
    AlertCircle,
} from 'lucide-react'
import AuthButton from './AuthButton'
import AuthInput from './AuthInput'
import AuthLinks from './AuthLinks'
import SocialAuthButtons from './SocialAuthButtons'

const RegisterForm = ({
    formData,
    isLoading,
    showPassword,
    showConfirmPassword,
    fieldErrors,
    serverError,
    passwordStrength,
    termsAccepted,
    onChange,
    onSubmit,
    onTogglePassword,
    onToggleConfirmPassword,
    onToggleTerms,
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
            <div className="relative z-10 w-full max-w-lg">
                {/* Card wrapper */}
                <div className="backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.12] rounded-3xl p-8 shadow-2xl shadow-blue-950/50 hover:border-white/[0.2] transition-all duration-300">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center shadow-lg shadow-blue-500/50 animate-pulse">
                                <Sparkles className="w-5 h-5 text-slate-950" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-100 bg-clip-text text-transparent">
                                Join Now
                            </h1>
                        </div>
                        <p className="text-sm font-medium text-slate-300 mt-3">
                            Start earning and connecting with clients instantly
                        </p>
                    </div>

                    {/* Server error alert */}
                    {serverError && (
                        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-400/30 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-rose-300 shrink-0 mt-0.5" />
                                <p className="text-sm font-medium text-rose-200 leading-relaxed">
                                    {serverError}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Social auth */}
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
                                Or register with email
                            </span>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Name field */}
                        <div>
                            <AuthInput
                                id="register-name"
                                name="name"
                                label="Full name"
                                value={formData.name}
                                onChange={onChange}
                                autoComplete="name"
                                icon={UserRound}
                                placeholder="Your full name"
                                error={fieldErrors.name}
                                hasError={Boolean(fieldErrors.name)}
                                disabled={isLoading}
                                autoFocus
                                required
                            />
                        </div>

                        {/* Email and Phone in grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <AuthInput
                                id="register-email"
                                name="email"
                                type="email"
                                label="Email"
                                value={formData.email}
                                onChange={onChange}
                                autoComplete="email"
                                icon={Mail}
                                placeholder="you@example.com"
                                error={fieldErrors.email}
                                hasError={Boolean(fieldErrors.email)}
                                disabled={isLoading}
                                required
                            />

                            <AuthInput
                                id="register-phone"
                                name="phone"
                                type="tel"
                                label="Phone"
                                value={formData.phone}
                                onChange={onChange}
                                autoComplete="tel"
                                icon={Phone}
                                placeholder="+1 (555) 000-0000"
                                error={fieldErrors.phone}
                                hasError={Boolean(fieldErrors.phone)}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Profile photo */}
                        <div>
                            <AuthInput
                                id="register-profile-pic"
                                name="profilePic"
                                type="url"
                                label="Profile photo (optional)"
                                value={formData.profilePic}
                                onChange={onChange}
                                autoComplete="url"
                                icon={ImagePlus}
                                placeholder="https://example.com/photo.jpg"
                                error={fieldErrors.profilePic}
                                hasError={Boolean(fieldErrors.profilePic)}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Password section */}
                        <div className="space-y-3 pt-2">
                            <AuthInput
                                id="register-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                value={formData.password}
                                onChange={onChange}
                                autoComplete="new-password"
                                icon={LockKeyhole}
                                placeholder="Min. 6 characters"
                                error={fieldErrors.password}
                                hasError={Boolean(fieldErrors.password)}
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

                            {/* Password strength indicator */}
                            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur px-4 py-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-semibold">
                                        <div className={`w-2 h-2 rounded-full transition-all ${passwordStrength.length ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-slate-600'}`} />
                                        <span className={passwordStrength.length ? 'text-emerald-300' : 'text-slate-400'}>
                                            At least 6 characters
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-semibold">
                                        <div className={`w-2 h-2 rounded-full transition-all ${passwordStrength.number ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-slate-600'}`} />
                                        <span className={passwordStrength.number ? 'text-emerald-300' : 'text-slate-400'}>
                                            Include one number
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <AuthInput
                            id="register-confirm-password"
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            label="Confirm password"
                            value={formData.confirmPassword}
                            onChange={onChange}
                            autoComplete="new-password"
                            icon={BadgeCheck}
                            placeholder="Re-enter your password"
                            error={fieldErrors.confirmPassword}
                            hasError={Boolean(fieldErrors.confirmPassword)}
                            disabled={isLoading}
                            required
                            rightElement={(
                                <button
                                    type="button"
                                    onClick={onToggleConfirmPassword}
                                    className="rounded-full p-2 text-slate-400 transition-all duration-200 hover:bg-white/10 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/20"
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            )}
                        />

                        {/* Terms checkbox */}
                        <div className={`rounded-2xl border px-4 py-4 transition-all duration-300 ${
                            fieldErrors.terms
                                ? 'border-rose-400/30 bg-gradient-to-r from-rose-500/20 to-pink-500/20'
                                : 'border-white/10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
                        }`}>
                            <label className="flex items-start gap-3 text-sm font-medium leading-6 text-slate-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={onToggleTerms}
                                    className="mt-0.5 w-4 h-4 rounded border-slate-500 bg-white/5 text-blue-500 focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
                                />
                                <span>
                                    I agree to the <span className="font-bold text-cyan-300 hover:text-cyan-200 transition-colors">Terms of Service</span> and <span className="font-bold text-cyan-300 hover:text-cyan-200 transition-colors">Privacy Policy</span>
                                </span>
                            </label>

                            {fieldErrors.terms && (
                                <p className="mt-2 ml-7 text-xs font-medium text-rose-300 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {fieldErrors.terms}
                                </p>
                            )}
                        </div>

                        {/* Submit button */}
                        <div className="pt-4">
                            <AuthButton 
                                type="submit" 
                                loading={isLoading} 
                                loadingLabel="Creating account..."
                                className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create Account
                                {!isLoading && <Sparkles className="w-4 h-4" />}
                            </AuthButton>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <div className="text-center">
                            <p className="text-sm text-slate-400 mb-3">
                                Already have an account?
                            </p>
                            <AuthLinks
                                prompt=""
                                linkText="Sign in here"
                                to="/login"
                                className="text-purple-300 hover:text-purple-200 font-bold text-base"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>Zero fees for freelancers</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>Instant verification</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                            <span>Start earning today</span>
                        </div>
                    </div>
                </div>

                {/* Bottom text */}
                <div className="mt-8 text-center">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                        Join thousands of successful freelancers
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterForm
