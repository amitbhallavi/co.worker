import { Link } from 'react-router-dom'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'

const AuthLinks = ({
    prompt = 'New to Co.worker?',
    linkText = 'Create account',
    to = '/register',
    cardTitle = 'Secure login',
    cardDescription = 'Protected sessions, role-aware access, and trusted payment workflows for both clients and freelancers.',
}) => {
    return (
        <div className="space-y-5">
            <p className="text-center text-sm text-slate-500">
                {prompt}{' '}
                <Link
                    to={to}
                    className="inline-flex items-center gap-1 font-semibold text-sky-700 transition-colors duration-200 hover:text-sky-800"
                >
                    {linkText}
                    <ArrowUpRight className="size-4" />
                </Link>
            </p>

            <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/90 px-4 py-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)]">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-emerald-100 p-2 text-emerald-600">
                        <ShieldCheck className="size-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            {cardTitle}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                            {cardDescription}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLinks
