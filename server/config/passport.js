import passport from "passport"
import GoogleOAuth from "passport-google-oauth20"
import GitHubStrategy from "passport-github2"
import User from "../models/userModel.js"

const GoogleStrategy = GoogleOAuth.Strategy

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "")

const firstEnvValue = (value = "") => value.split(",")[0]?.trim() || ""

export const getClientBaseUrl = () => (
    trimTrailingSlash(firstEnvValue(process.env.CLIENT_URL)) || "http://localhost:5173"
)

const getServerBaseUrl = () => (
    trimTrailingSlash(process.env.API_PUBLIC_URL || process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5050}`)
)

export const isOAuthProviderConfigured = (provider) => {
    if (provider === "google") {
        return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    }

    if (provider === "github") {
        return Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
    }

    return false
}

export const getOAuthRedirectUrl = (pathname, params = {}) => {
    const redirectUrl = new URL(pathname, getClientBaseUrl())

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            redirectUrl.searchParams.set(key, value)
        }
    })

    return redirectUrl.toString()
}

const getCallbackUrl = (provider) => (
    process.env[`${provider.toUpperCase()}_CALLBACK_URL`] ||
    `${getServerBaseUrl()}/api/auth/${provider}/callback`
)

const normalizeEmail = (email = "") => email.trim().toLowerCase()

const getProfilePhoto = (profile) => profile.photos?.[0]?.value || ""

const findOrCreateOAuthUser = async ({ provider, providerId, email, name, profilePic }) => {
    const normalizedEmail = normalizeEmail(email)
    const providerIdField = `${provider}Id`

    let user = await User.findOne({
        $or: [
            { [providerIdField]: providerId },
            { email: normalizedEmail },
        ],
    })

    if (user) {
        let changed = false

        if (!user[providerIdField]) {
            user[providerIdField] = providerId
            changed = true
        }

        if (!user.profilePic && profilePic) {
            user.profilePic = profilePic
            changed = true
        }

        if (user.authProvider === "local") {
            user.authProvider = provider
            changed = true
        }

        if (changed) {
            await user.save()
        }

        return user
    }

    return User.create({
        name: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        profilePic,
        authProvider: provider,
        [providerIdField]: providerId,
    })
}

const fetchGithubPrimaryEmail = async (accessToken) => {
    const response = await fetch("https://api.github.com/user/emails", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "co-worker-oauth",
        },
    })

    if (!response.ok) {
        return ""
    }

    const emails = await response.json()
    const primaryEmail = emails.find((item) => item.primary && item.verified) ||
        emails.find((item) => item.verified)

    return normalizeEmail(primaryEmail?.email)
}

const registerGoogleStrategy = () => {
    if (!isOAuthProviderConfigured("google")) {
        return
    }

    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: getCallbackUrl("google"),
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = normalizeEmail(profile.emails?.[0]?.value)

                if (!email || profile._json?.email_verified === false) {
                    return done(new Error("Google account must have a verified email."))
                }

                const user = await findOrCreateOAuthUser({
                    provider: "google",
                    providerId: profile.id,
                    email,
                    name: profile.displayName,
                    profilePic: getProfilePhoto(profile),
                })

                done(null, user)
            } catch (error) {
                done(error)
            }
        }
    ))
}

const registerGithubStrategy = () => {
    if (!isOAuthProviderConfigured("github")) {
        return
    }

    passport.use(new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: getCallbackUrl("github"),
            scope: ["user:email"],
        },
        async (accessToken, _refreshToken, profile, done) => {
            try {
                const email = normalizeEmail(profile.emails?.[0]?.value) ||
                    await fetchGithubPrimaryEmail(accessToken)

                if (!email) {
                    return done(new Error("GitHub account must have a verified public or primary email."))
                }

                const user = await findOrCreateOAuthUser({
                    provider: "github",
                    providerId: profile.id,
                    email,
                    name: profile.displayName || profile.username,
                    profilePic: getProfilePhoto(profile),
                })

                done(null, user)
            } catch (error) {
                done(error)
            }
        }
    ))
}

registerGoogleStrategy()
registerGithubStrategy()

export default passport
