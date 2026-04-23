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
        <div className="auth-sans relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_46%,#edf7ff_100%)] text-slate-900">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_30%)]" />

            <div
                className="pointer-events-none absolute inset-0 opacity-45"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(148,163,184,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.14) 1px, transparent 1px)',
                    backgroundSize: '88px 88px',
                }}
            />

            <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 py-6 sm:px-6 lg:px-10">
                <div className="grid w-full overflow-hidden rounded-[34px] border border-white/80 bg-white/80 shadow-[0_36px_120px_-60px_rgba(15,23,42,0.55)] lg:grid-cols-[1.04fr_0.96fr]">
                    <div className="relative hidden min-h-[720px] overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#082f49_54%,#0f766e_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
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

                    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:min-h-[720px] lg:px-10 lg:py-12">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.82)_100%)]" />

                        <div className="relative w-full max-w-xl">
                            <div className="mb-8 lg:hidden">
                                <Link
                                    to="/"
                                    className="inline-flex items-center gap-3 rounded-full border border-white/80 bg-white px-4 py-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.28)]"
                                >
                                    <CoworkerIcon size={38} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
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
