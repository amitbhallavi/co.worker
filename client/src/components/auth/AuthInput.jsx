const AuthInput = ({
    id,
    name,
    label,
    type = 'text',
    value,
    onChange,
    autoComplete,
    icon: Icon,
    rightElement,
    placeholder,
    error = '',
    autoFocus = false,
    hasError = false,
    ...props
}) => {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="block text-sm font-semibold text-slate-200"
            >
                {label}
            </label>

            <div
                className={`group relative overflow-hidden rounded-2xl border backdrop-blur transition-all duration-300 ${
                    hasError
                        ? 'border-rose-400/30 bg-gradient-to-r from-rose-500/10 to-pink-500/10 ring-2 ring-rose-500/20'
                        : 'border-white/10 bg-white/[0.08] hover:border-white/20 hover:bg-white/[0.12] focus-within:border-cyan-400/50 focus-within:bg-white/[0.15] focus-within:ring-2 focus-within:ring-cyan-500/20'
                }`}
            >
                {Icon && (
                    <span
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${
                            hasError
                                ? 'text-rose-400'
                                : 'text-slate-300 group-focus-within:text-cyan-300 group-focus-within:scale-110'
                        }`}
                    >
                        <Icon className="size-5" />
                    </span>
                )}

                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    placeholder={placeholder || label}
                    aria-invalid={hasError}
                    className={`h-12 w-full bg-transparent text-base font-medium text-white outline-none placeholder:text-slate-300 transition-colors ${
                        Icon ? 'pl-12' : 'pl-4'
                    } ${
                        rightElement ? 'pr-12' : 'pr-4'
                    }`}
                    {...props}
                />

                {rightElement && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>

            {error && (
                <p className="pl-1 text-xs font-semibold text-rose-300">
                    {error}
                </p>
            )}
        </div>
    )
}

export default AuthInput
