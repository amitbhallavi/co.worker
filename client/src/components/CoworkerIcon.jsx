const CoworkerIcon = ({ size = 36 }) => {
    return (
        <span
            aria-hidden="true"
            className="inline-flex shrink-0 items-center justify-center rounded-full text-white ring-1 ring-white/35 shadow-[0_18px_40px_-20px_rgba(43,196,212,0.95)]"
            style={{
                width: size,
                height: size,
                background: 'linear-gradient(135deg, #3B7FF5 0%, #2BC4D4 100%)',
            }}
        >
            <span
                className="auth-serif select-none font-semibold leading-none tracking-[-0.08em]"
                style={{
                    fontSize: `${Math.max(15, size * 0.28)}px`,
                    transform: 'translateY(1px)',
                }}
            >
                Co.
            </span>
        </span>
    )
}

export default CoworkerIcon
