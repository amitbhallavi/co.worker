import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, BadgeCheck, MessageCircleMore, ShieldCheck, WalletCards } from 'lucide-react'
import CoworkerIcon from '../CoworkerIcon'

const MotionDiv = motion.div

const featureHighlights = [
    {
        icon: ShieldCheck,
        title: 'Secure payouts',
        description: 'Escrow-backed workflows and protected account sessions keep trust high from first message to final release.',
        color: 'from-sky-500 to-blue-600',
    },
    {
        icon: MessageCircleMore,
        title: 'Realtime conversations',
        description: 'Jump straight back into project chats and stay synced with every update that matters.',
        color: 'from-cyan-500 to-emerald-500',
    },
    {
        icon: WalletCards,
        title: 'Everything in one dashboard',
        description: 'Projects, bids, payments, and profiles stay organized inside one workspace built for clients and freelancers.',
        color: 'from-blue-600 to-cyan-500',
    },
]

const LoginLayout = ({
    children,
    desktopBadge = 'Trusted workspace',
    desktopTitle = 'Welcome back 👋',
    desktopDescription = 'Login to continue your journey and keep every project, conversation, and payout moving from one secure command center.',
    desktopCtaText = 'Create a new account',
    desktopCtaTo = '/register',
    mobileBadge = 'Trusted access',
    mobileTitle = 'Welcome back 👋',
    mobileDescription = 'Login to continue your journey with a faster, cleaner, and more secure experience.',
}) => {
    return (
        <div className="auth-sans relative isolate min-h-screen overflow-hidden bg-slate-950 text-slate-900">
            <div className="absolute inset-0 bg-gradient-to-b from-[#f7fbff] via-[#edf6ff] to-[#f7fbff]" />

            <MotionDiv
                className="absolute left-[-7rem] top-[-5rem] h-80 w-80 rounded-full bg-sky-400/25 blur-3xl"
                animate={{ x: [0, 42, 0], y: [0, 24, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
            />

            <MotionDiv
                className="absolute bottom-[-8rem] right-[-6rem] h-96 w-96 rounded-full bg-cyan-300/30 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, -28, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            />

            <div
                className="absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(148,163,184,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.16) 1px, transparent 1px)',
                    backgroundSize: '88px 88px',
                }}
            />

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 py-6 sm:px-6 lg:px-10">
                <div className="grid w-full overflow-hidden rounded-[36px] border border-white/70 bg-white/55 shadow-[0_45px_140px_-60px_rgba(15,23,42,0.7)] backdrop-blur-2xl lg:grid-cols-[1.06fr_0.94fr]">
                    <div className="relative hidden min-h-[720px] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
                        <div className="absolute inset-0">
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        'radial-gradient(circle at top, rgba(56, 189, 248, 0.26), transparent 38%), radial-gradient(circle at 80% 24%, rgba(45, 212, 191, 0.18), transparent 28%)',
                                }}
                            />
                            <div className="absolute right-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
                            <div className="absolute bottom-[-7rem] left-[-6rem] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
                        </div>

                        <div className="relative">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm transition duration-200 hover:bg-white/15"
                            >
                                <CoworkerIcon size={40} />
                                <div>
                                    <p className="text-sm font-semibold tracking-wide text-white">
                                        Co.worker
                                    </p>
                                    <p className="text-xs text-slate-300">
                                        Premium freelance marketplace
                                    </p>
                                </div>
                            </Link>

                            <MotionDiv
                                initial={{ opacity: 0, y: 22 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                                className="mt-12 max-w-xl"
                            >
                                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                                    {desktopBadge}
                                </span>

                                <h1 className="auth-serif mt-6 text-5xl leading-[1.02] tracking-tight xl:text-6xl">
                                    {desktopTitle}
                                </h1>

                                <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
                                    {desktopDescription}
                                </p>

                                <Link
                                    to={desktopCtaTo}
                                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition-colors hover:text-white"
                                >
                                    {desktopCtaText}
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </MotionDiv>
                        </div>

                        <div className="relative space-y-4">
                            <div className="grid gap-4 xl:grid-cols-3">
                                {featureHighlights.map((item, index) => {
                                    const Icon = item.icon

                                    return (
                                        <MotionDiv
                                            key={item.title}
                                            initial={{ opacity: 0, y: 18 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.45, delay: 0.16 + index * 0.08 }}
                                            className={`rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur-sm ${
                                                index === 2 ? 'xl:col-span-3' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`rounded-2xl bg-gradient-to-br ${item.color} p-3 shadow-lg shadow-black/10`}>
                                                    <Icon className="size-5" />
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        {item.title}
                                                    </p>
                                                    <p className="mt-1 text-sm leading-6 text-slate-300">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </MotionDiv>
                                    )
                                })}
                            </div>

                            <MotionDiv
                                initial={{ opacity: 0, y: 18 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.4 }}
                                className="rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur-sm"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-200">
                                        <BadgeCheck className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Made for trustworthy collaboration
                                        </p>
                                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                                            Clear messaging, protected payments, and organized hiring workflows help clients and freelancers move faster with confidence.
                                        </p>
                                    </div>
                                </div>
                            </MotionDiv>
                        </div>
                    </div>

                    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:min-h-[720px] lg:px-10 lg:py-12">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/15 to-white/65" />

                        <MotionDiv
                            className="absolute right-6 top-10 hidden h-28 w-28 rounded-full bg-sky-300/30 blur-3xl sm:block"
                            animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
                            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <MotionDiv
                            className="absolute bottom-10 left-4 hidden h-32 w-32 rounded-full bg-cyan-300/30 blur-3xl sm:block"
                            animate={{ y: [0, -14, 0], x: [0, 10, 0] }}
                            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        <div className="relative w-full max-w-xl">
                            <div className="mb-8 lg:hidden">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/80 px-4 py-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.4)] backdrop-blur-sm"
                                >
                                    <CoworkerIcon size={38} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 ">
                                            Co.worker
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            Secure freelance workspace
                                        </p>
                                    </div>
                                </Link>

                                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                                    {mobileBadge}
                                </p>
                                <h1 className="auth-serif mt-3 text-4xl leading-tight text-slate-950">
                                    {mobileTitle}
                                </h1>
                                <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
                                    {mobileDescription}
                                </p>
                            </div>

                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginLayout
