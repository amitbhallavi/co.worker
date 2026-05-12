import { Link } from 'react-router-dom'
import { ArrowUpRight, BadgeCheck, MessageCircleMore, ShieldCheck, WalletCards } from 'lucide-react'
import CoworkerIcon from '../CoworkerIcon'

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
    desktopTitle = 'Welcome back',
    desktopDescription = 'Login to continue your journey and keep every project, conversation, and payout moving from one secure command center.',
    desktopCtaText = 'Create a new account',
    desktopCtaTo = '/register',
    mobileBadge = 'Trusted access',
    mobileTitle = 'Welcome back',
    mobileDescription = 'Login to continue with a faster, cleaner, and more secure experience.',
}) => {
    return (
        <div className="auth-sans relative isolate min-h-screen overflow-hidden bg-[linear-gradient(135deg,#eef7ff_0%,#f8fafc_48%,#e8fff8_100%)] text-slate-900 dark:bg-[linear-gradient(180deg,#020617_0%,#071427_54%,#062f35_100%)] dark:text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.16),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_26%),radial-gradient(circle_at_85%_20%,rgba(45,212,191,0.18),transparent_22%)]" />

            <div
                className="pointer-events-none absolute inset-0 opacity-45 dark:opacity-60"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.14) 1px, transparent 1px)',
                    backgroundSize: '88px 88px',
                }}
            />

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-start px-4 py-5 sm:px-6 sm:py-8 lg:items-center lg:px-10">
                <div className="grid w-full overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/80 shadow-2xl shadow-sky-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-black/40 sm:rounded-[34px] lg:grid-cols-[1.04fr_0.96fr]">
                    <div className="relative hidden min-h-[720px] overflow-hidden bg-gradient-to-br from-blue-600 to-slate-900 dark:bg-[linear-gradient(160deg,#0f172a_0%,#082f49_54%,#0f766e_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.24),transparent_26%),radial-gradient(circle_at_85%_20%,rgba(45,212,191,0.18),transparent_22%)]" />

                        <div className="relative">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-3 transition duration-200 hover:bg-white/15"
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

                            <div className="mt-12 max-w-xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                                    {desktopBadge}
                                </span>

                                <h1 className="auth-serif mt-6 text-5xl leading-[1.02] tracking-tight xl:text-6xl">
                                    {desktopTitle}
                                </h1>

                                <p className="mt-6 max-w-lg text-base leading-8 text-slate-300">
                                    {desktopDescription}
                                </p>

                                <div className="mt-8 flex flex-wrap gap-2">
                                    {['10k+ verified talent', 'Protected payouts', 'One clean workspace'].map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>

                                <Link
                                    to={desktopCtaTo}
                                    className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-100 transition-colors hover:text-white"
                                >
                                    {desktopCtaText}
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </div>
                        </div>

                        <div className="relative space-y-4">
                            <div className="grid gap-4 xl:grid-cols-3">
                                {featureHighlights.map((item, index) => {
                                    const Icon = item.icon

                                    return (
                                        <div
                                            key={item.title}
                                            className={`rounded-[28px] border border-white/10 bg-white/10 p-5 ${
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
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="rounded-[30px] border border-white/10 bg-white/10 p-6">
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
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-start justify-center bg-white/90 px-4 py-7 dark:bg-slate-950/90 sm:px-8 sm:py-10 lg:min-h-[720px] lg:items-center lg:px-10 lg:py-12">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.1),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(248,250,252,0.76)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.86)_0%,rgba(2,6,23,0.72)_100%)]" />

                        <div className="relative w-full max-w-xl">
                            <div className="mb-6 lg:hidden">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-3 shadow-lg shadow-slate-950/10 transition-colors hover:border-sky-200 dark:border-white/10 dark:bg-white/10 dark:shadow-black/25 dark:hover:bg-white/15"
                                >
                                    <CoworkerIcon size={38} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            Co.worker
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-slate-400">
                                            Secure freelance workspace
                                        </p>
                                    </div>
                                </Link>

                                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700 dark:text-cyan-300">
                                    {mobileBadge}
                                </p>
                                <h1 className="auth-serif mt-3 text-4xl leading-tight text-slate-950 dark:text-white">
                                    {mobileTitle}
                                </h1>
                                <p className="mt-3 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
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
