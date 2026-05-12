import {
    BadgeCheck,
    CircleAlert,
    Eye,
    EyeOff,
    ImagePlus,
    LockKeyhole,
    Mail,
    Phone,
    Sparkles,
    UserRound,
} from 'lucide-react'
import AuthButton from './AuthButton'
import AuthInput from './AuthInput'
import AuthLinks from './AuthLinks'

const onboardingPillars = ['Escrow-protected projects', 'Realtime collaboration', 'Verified marketplace trust']

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
        <section className="rounded-[30px] border border-slate-200/80 bg-white/95 px-5 py-6 shadow-2xl shadow-slate-950/10 backdrop-blur dark:border-white/10 dark:bg-slate-900/90 dark:shadow-black/35 sm:px-8 sm:py-8 lg:px-10 lg:py-9">
            <div className="mb-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-cyan-300">
                    <Sparkles className="size-3.5" />
                    Premium onboarding
                </span>

                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-[2rem]">
                    Create your Co.worker account
                </h2>

                <p className="mt-3 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                    Join the marketplace with a clean, secure setup flow built for both clients and freelancers.
                </p>
            </div>

            {serverError && (
                <div className="mb-5 flex items-start gap-3 rounded-[22px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-950/35 dark:text-rose-200">
                    <CircleAlert className="mt-0.5 size-4 shrink-0" />
                    <p className="leading-6">{serverError}</p>
                </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <AuthInput
                        id="register-name"
                        name="name"
                        label="Full name"
                        value={formData.name}
                        onChange={onChange}
                        autoComplete="name"
                        icon={UserRound}
                        error={fieldErrors.name}
                        hasError={Boolean(fieldErrors.name)}
                        disabled={isLoading}
                        autoFocus
                        required
                    />

                    <AuthInput
                        id="register-phone"
                        name="phone"
                        type="tel"
                        label="Phone number"
                        value={formData.phone}
                        onChange={onChange}
                        autoComplete="tel"
                        icon={Phone}
                        error={fieldErrors.phone}
                        hasError={Boolean(fieldErrors.phone)}
                        disabled={isLoading}
                        required
                    />
                </div>

                <AuthInput
                    id="register-email"
                    name="email"
                    type="email"
                    label="Email address"
                    value={formData.email}
                    onChange={onChange}
                    autoComplete="email"
                    icon={Mail}
                    error={fieldErrors.email}
                    hasError={Boolean(fieldErrors.email)}
                    disabled={isLoading}
                    required
                />

                <AuthInput
                    id="register-profile-pic"
                    name="profilePic"
                    type="url"
                    label="Profile photo URL (optional)"
                    value={formData.profilePic}
                    onChange={onChange}
                    autoComplete="url"
                    icon={ImagePlus}
                    error={fieldErrors.profilePic}
                    hasError={Boolean(fieldErrors.profilePic)}
                    disabled={isLoading}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-3">
                        <AuthInput
                            id="register-password"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            label="Password"
                            value={formData.password}
                            onChange={onChange}
                            autoComplete="new-password"
                            icon={LockKeyhole}
                            error={fieldErrors.password}
                            hasError={Boolean(fieldErrors.password)}
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

                        <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/85 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                                <div className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${passwordStrength.length ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                    <span>At least 6 characters</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`size-2 rounded-full ${passwordStrength.number ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                                    <span>Include at least one number</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <AuthInput
                        id="register-confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm password"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        autoComplete="new-password"
                        icon={BadgeCheck}
                        error={fieldErrors.confirmPassword}
                        hasError={Boolean(fieldErrors.confirmPassword)}
                        disabled={isLoading}
                        required
                        rightElement={(
                            <button
                                type="button"
                                onClick={onToggleConfirmPassword}
                                className="rounded-full p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
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
                </div>

                <div className={`rounded-[22px] border px-4 py-4 transition-colors ${
                    fieldErrors.terms
                        ? 'border-rose-200 bg-rose-50/80 dark:border-rose-400/20 dark:bg-rose-950/35'
                        : 'border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.04]'
                }`}>
                    <label className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        <input
                            type="checkbox"
                            checked={termsAccepted}
                            onChange={onToggleTerms}
                            className="mt-1 size-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 dark:border-slate-600 dark:bg-slate-950"
                        />
                        <span>
                            I agree to the <span className="font-semibold text-sky-700 dark:text-cyan-300">Terms of Service</span> and <span className="font-semibold text-sky-700 dark:text-cyan-300">Privacy Policy</span>.
                        </span>
                    </label>

                    {fieldErrors.terms && (
                        <p className="mt-2 pl-7 text-sm font-medium text-rose-600 dark:text-rose-200">
                            {fieldErrors.terms}
                        </p>
                    )}
                </div>

                <AuthButton type="submit" loading={isLoading} loadingLabel="Creating account...">
                    Create account
                </AuthButton>
            </form>

            <div className="my-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
                <span>Built for trust</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            <div className="mb-6 grid gap-2 sm:grid-cols-3">
                {onboardingPillars.map((item) => (
                    <span
                        key={item}
                        className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3 text-center text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
                    >
                        {item}
                    </span>
                ))}
            </div>

            <AuthLinks
                prompt="Already have an account?"
                linkText="Log in"
                to="/login"
                cardTitle="Secure onboarding"
                cardDescription="Create your account with the same trusted security and protected workflow foundation used across Co.worker."
            />
        </section>
    )
}

export default RegisterForm
