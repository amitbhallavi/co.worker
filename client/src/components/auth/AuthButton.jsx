import { LoaderCircle } from 'lucide-react'

const AuthButton = ({
    children,
    loading = false,
    loadingLabel = 'Please wait',
    disabled = false,
    className = '',
    ...props
}) => {
    const isDisabled = disabled || loading

    const defaultClass = "group flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-6 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"

    return (
        <button
            className={className || defaultClass}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <>
                    <LoaderCircle className="size-5 animate-spin" />
                    <span>{loadingLabel}</span>
                </>
            ) : (
                <>{children}</>
            )}
        </button>
    )
}

export default AuthButton
