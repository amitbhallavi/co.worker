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
                className={`group relative overflow-hidden rounded-[22px] border bg-white shadow-lg transition-all duration-200 dark:bg-slate-800/90 dark:shadow-md ${
                    hasError
                        ? 'border-rose-200 dark:border-rose-900/30 ring-4 ring-rose-100 dark:ring-rose-900/20'
                        : isFocused
                            ? 'border-sky-400 dark:border-sky-500 ring-4 ring-sky-100 dark:ring-sky-900/30'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
            >
                {Icon && (
                    <span
                        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                            hasError
                                ? 'text-rose-400 dark:text-rose-500'
                                : isFocused
                                    ? 'text-sky-600 dark:text-sky-400'
                                    : 'text-gray-400 dark:text-slate-500'
                        }`}
                    >
                        <Icon className="size-5" />
                    </span>
                )}

                <label
                    htmlFor={id}
                    className={`pointer-events-none absolute left-14 z-10 rounded-full px-2 transition-all duration-200 ${
                        isFloating
                            ? 'top-2.5 translate-y-0 bg-white text-[11px] font-semibold tracking-[0.08em] text-gray-500 dark:bg-slate-800 dark:text-slate-300'
                            : 'top-1/2 -translate-y-1/2 bg-transparent text-sm text-gray-400 dark:text-slate-500'
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
                    className={`h-16 w-full bg-transparent px-14 pb-3 pt-7 text-sm font-medium text-slate-900 dark:text-white outline-none placeholder:text-transparent ${
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
                <p className="pl-2 text-sm font-medium text-rose-600 dark:text-rose-300">
                    {error}
                </p>
            )}
        </div>
    )
}

export default AuthInput
