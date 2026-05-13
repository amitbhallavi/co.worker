import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { getApiBaseUrl } from '../../features/api/apiConfig'

const providerConfig = {
    google: {
        label: 'Google',
        icon: FcGoogle,
    },
    github: {
        label: 'GitHub',
        icon: FaGithub,
    },
}

const getOAuthUrl = (provider) => {
    const apiBaseUrl = getApiBaseUrl()
    const path = `/api/auth/${provider}`

    return apiBaseUrl ? `${apiBaseUrl}${path}` : path
}

const SocialAuthButtons = ({ disabled = false }) => {
    const handleProviderClick = (provider) => {
        if (disabled) {
            return
        }

        window.location.assign(getOAuthUrl(provider))
    }

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(providerConfig).map(([provider, config]) => {
                const Icon = config.icon

                return (
                    <button
                        key={provider}
                        type="button"
                        onClick={() => handleProviderClick(provider)}
                        disabled={disabled}
                        className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-white/[0.02] px-4 text-sm font-semibold text-slate-200 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white hover:shadow-lg hover:shadow-white/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Icon className="size-5" />
                        <span>{config.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default SocialAuthButtons
