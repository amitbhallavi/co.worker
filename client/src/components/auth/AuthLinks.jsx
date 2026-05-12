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
            <p className="text-center text-sm text-gray-600 dark:text-slate-400">
                {prompt}{' '}
                <Link
                    to={to}
                    className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400 transition-colors duration-200 hover:text-sky-800 dark:hover:text-sky-300"
                >
                    {linkText}
                    <ArrowUpRight className="size-4" />
                </Link>
            </p>

            <div className="rounded-[22px] border border-gray-200 dark:border-slate-200/20 bg-gray-50 dark:bg-slate-800/50 px-4 py-4 shadow-sm dark:shadow-md">
                <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="size-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {cardTitle}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-slate-400">
                            {cardDescription}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthLinks
