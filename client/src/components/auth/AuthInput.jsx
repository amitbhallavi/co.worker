import { useState } from 'react'

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
    error = '',
    autoFocus = false,
    hasError = false,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false)
    const isFloating = isFocused || Boolean(value)

    return (
        <div className="space-y-2">
            <div
                className={`group relative overflow-hidden rounded-[22px] border bg-white/85 shadow-[0_12px_40px_-24px_rgba(15,23,42,0.32)] transition-all duration-200 ${
                    hasError
                        ? 'border-rose-200 ring-4 ring-rose-100/70'
                        : isFocused
                            ? 'border-sky-400 ring-4 ring-sky-100/80'
                            : 'border-slate-200/80 hover:border-slate-300'
                }`}
            >
                {Icon && (
                    <span
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                            hasError
                                ? 'text-rose-400'
                                : isFocused
                                    ? 'text-sky-600'
                                    : 'text-slate-400'
                        }`}
                    >
                        <Icon className="size-5" />
                    </span>
                )}

                <label
                    htmlFor={id}
                    className={`pointer-events-none absolute left-14 z-10 rounded-full px-2 transition-all duration-200 ${
                        isFloating
                            ? 'top-2.5 translate-y-0 bg-white/90 text-[11px] font-semibold tracking-[0.08em] text-slate-500'
                            : 'top-1/2 -translate-y-1/2 bg-transparent text-sm text-slate-400'
                    }`}
                >
                    {label}
                </label>

                <input
                    id={id}
                    name={name}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    placeholder=" "
                    aria-invalid={hasError}
                    className={`h-16 w-full bg-transparent px-14 pb-3 pt-7 text-sm font-medium text-slate-900 outline-none placeholder:text-transparent ${
                        rightElement ? 'pr-14' : 'pr-5'
                    }`}
                    {...props}
                />

                {rightElement && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </div>

            {error && (
                <p className="pl-2 text-sm font-medium text-rose-600">
                    {error}
                </p>
            )}
        </div>
    )
}

export default AuthInput
