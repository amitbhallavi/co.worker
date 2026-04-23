import { ArrowRight, LoaderCircle } from 'lucide-react'

const AuthButton = ({
    children,
    loading = false,
    loadingLabel = 'Please wait',
    disabled = false,
    ...props
}) => {
    const isDisabled = disabled || loading

    return (
        <button
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-[0_22px_42px_-20px_rgba(14,116,144,0.58)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_48px_-18px_rgba(14,116,144,0.66)] active:translate-y-0 active:scale-[0.995] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <>
                    <LoaderCircle className="size-4 animate-spin" />
                    <span>{loadingLabel}</span>
                </>
            ) : (
                <>
                    <span>{children}</span>
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
            )}
        </button>
    )
}

export default AuthButton
