import { Link } from 'react-router-dom'

const AuthLinks = ({
    prompt = 'New to Co.worker?',
    linkText = 'Create account',
    to = '/register',
    className = '',
}) => {
    return (
        <p className="text-center text-sm font-medium text-slate-400">
            {prompt}{' '}
            <Link
                to={to}
                className={className || "font-bold text-cyan-300 transition-all duration-200 hover:text-cyan-200 hover:shadow-lg hover:shadow-cyan-500/30 rounded px-1 py-0.5"}
            >
                {linkText}
            </Link>
        </p>
    )
}

export default AuthLinks
