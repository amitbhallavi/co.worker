import { Link } from 'react-router-dom'
import CoworkerIcon from '../CoworkerIcon'

const LoginLayout = ({
    children,
    desktopTitle,
    desktopDescription,
    mobileTitle = 'Welcome back!',
    mobileDescription = 'Sign in to continue your Co.worker workspace',
}) => {
    const title = desktopTitle || mobileTitle
    const description = desktopDescription || mobileDescription

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/[0.03] rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/[0.03] rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Header/Logo */}
                <div className="px-6 pt-8 sm:px-8 sm:pt-12">
                    <Link to="/" className="inline-flex items-center gap-3 group hover:opacity-80 transition-opacity">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/70 transition-shadow">
                            <CoworkerIcon size={28} />
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tight text-white group-hover:text-blue-100 transition-colors">
                                Co.worker
                            </p>
                            <p className="text-xs font-bold uppercase tracking-[0.08em] text-cyan-300 group-hover:text-cyan-200 transition-colors">
                                Secure Workspace
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Center content */}
                <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:px-6">
                    {/* Title section */}
                    <div className="text-center mb-12 max-w-2xl">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-100 bg-clip-text text-transparent leading-tight">
                            {title}
                        </h1>
                        <p className="text-base sm:text-lg font-medium text-slate-300 leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Form container */}
                    <div className="w-full">
                        {children}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-8 sm:px-8 text-center">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">
                        Enterprise Grade • Trusted Globally
                    </p>
                </div>
            </div>
        </main>
    )
}

export default LoginLayout
