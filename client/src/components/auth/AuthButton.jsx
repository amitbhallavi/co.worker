import { motion } from 'framer-motion'
import { ArrowRight, LoaderCircle } from 'lucide-react'

const MotionButton = motion.button

const AuthButton = ({
    children,
    loading = false,
    loadingLabel = 'Please wait',
    disabled = false,
    ...props
}) => {
    const isDisabled = disabled || loading

    return (
        <MotionButton
            whileHover={!isDisabled ? { y: -2, scale: 1.01 } : undefined}
            whileTap={!isDisabled ? { scale: 0.985 } : undefined}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            className="group flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-500 px-6 text-sm font-semibold text-white shadow-[0_24px_45px_-20px_rgba(14,116,144,0.58)] transition-all duration-300 hover:shadow-[0_28px_55px_-18px_rgba(14,116,144,0.7)] disabled:cursor-not-allowed disabled:opacity-70"
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
        </MotionButton>
    )
}

export default AuthButton
