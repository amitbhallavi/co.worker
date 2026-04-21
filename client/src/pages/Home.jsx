import React, { useState, useEffect, useRef, useCallback, memo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"

const AnimatedBackground = memo(function AnimatedBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px]" />
            <div className="absolute top-1/3 right-0 w-[480px] h-[480px] bg-blue-500/20 rounded-full blur-[128px]" />
            <div className="absolute bottom-0 left-1/3 w-[640px] h-[640px] bg-emerald-500/10 rounded-full blur-[128px]" />
            <div className="absolute -bottom-20 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-[128px]" />
        </div>
    )
})

const ACTIVITIES = [
    { text: "Sarah hired a Web Developer", color: "text-emerald-400" },
    { text: "Project completed", color: "text-blue-400" },
    { text: "New freelancer joined", color: "text-violet-400" },
    { text: "Payment released", color: "text-amber-400" },
    { text: "Found a designer quickly", color: "text-cyan-400" },
    { text: "Received a 5-star rating", color: "text-yellow-400" },
    { text: "Escrow protection enabled", color: "text-emerald-400" },
    { text: "Real-time chat launched", color: "text-blue-400" },
]

const LiveActivityFeed = memo(function LiveActivityFeed() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [activities, setActivities] = useState(ACTIVITIES)

    useEffect(() => {
        const interval = setInterval(() => {
            setActivities((prev) => {
                const newActivities = [...prev]
                const randomIdx = Math.floor(Math.random() * ACTIVITIES.length)
                const newActivity = ACTIVITIES[randomIdx]
                newActivities.splice(0, 1, newActivity)
                return newActivities
            })
            setCurrentIndex(0)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <span className="relative flex w-2 h-2">
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                    <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                </span>
                <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Live Activity</span>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-3"
                >
                    <p className={`text-sm font-medium ${activities[currentIndex]?.color}`}>{activities[currentIndex]?.text}</p>
                </motion.div>
            </AnimatePresence>
            <div className="flex gap-1 mt-3">
                {activities.slice(0, 5).map((_, i) => (
                    <div key={i} className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                        <motion.div className="h-full bg-emerald-400" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 4, ease: "linear" }} />
                    </div>
                ))}
            </div>
        </div>
    )
})

const TrustBar = memo(function TrustBar({ stats }) {
    const statItems = [
        { value: stats?.freelancers || "50K+", label: "Active Freelancers" },
        { value: stats?.projects || "100K+", label: "Projects Done" },
        { value: stats?.earnings || "50Cr+", label: "Earnings Released" },
        { value: stats?.rating || "4.9/5", label: "Client Rating" },
    ]

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {statItems.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-center hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
                >
                    <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-[11px] text-white/40">{stat.label}</div>
                </motion.div>
            ))}
        </div>
    )
})

const CategoryCard = memo(function CategoryCard({ category, index, onClick }) {
    const colors = {
        web: { gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/20", hover: "hover:shadow-blue-500/40" },
        design: { gradient: "from-violet-500 to-purple-500", glow: "shadow-violet-500/20", hover: "hover:shadow-violet-500/40" },
        ai: { gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20", hover: "hover:shadow-emerald-500/40" },
        mobile: { gradient: "from-orange-500 to-amber-500", glow: "shadow-orange-500/20", hover: "hover:shadow-orange-500/40" },
        data: { gradient: "from-pink-500 to-rose-500", glow: "shadow-pink-500/20", hover: "hover:shadow-pink-500/40" },
        writing: { gradient: "from-slate-500 to-gray-500", glow: "shadow-slate-500/20", hover: "hover:shadow-slate-500/40" },
    }
    const color = colors[category.key] || colors.web

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.05, y: -4 }}
            onClick={onClick}
            className={`group relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-2xl ${color.glow} ${color.hover}`}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
            <div
                className={`w-14 h-14 bg-gradient-to-br ${color.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
            >
                <span className="text-2xl">{category.icon}</span>
            </div>
            <h3 className="font-bold text-white text-center mb-1">{category.label}</h3>
            <p className="text-xs text-white/40 text-center">{category.count} experts</p>
            <div
                className={`mt-3 inline-flex items-center gap-1 bg-gradient-to-r ${color.gradient} text-white text-[10px] font-bold px-3 py-1 rounded-full mx-auto opacity-0 group-hover:opacity-100 transition-all duration-300`}
            >
                Explore
            </div>
        </motion.div>
    )
})

const FreelancerCard = memo(function FreelancerCard({ freelancer, index }) {
    const skills = Array.isArray(freelancer.skills)
        ? freelancer.skills
        : (freelancer.skills || "").split(",").slice(0, 3)
    const colorIndex = index % 5
    const gradients = [
        "from-blue-500 to-cyan-500",
        "from-violet-500 to-purple-500",
        "from-emerald-500 to-teal-500",
        "from-orange-500 to-amber-500",
        "from-pink-500 to-rose-500",
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-2xl transition-all duration-300"
        >
            <div className="flex items-start gap-3 mb-4">
                <div className="relative">
                    {freelancer.user?.profilePic ? (
                        <img
                            src={freelancer.user.profilePic}
                            alt={freelancer.user?.name}
                            className="w-14 h-14 rounded-xl object-cover ring-2 ring-white/20"
                        />
                    ) : (
                        <div
                            className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradients[colorIndex]} flex items-center justify-center`}
                        >
                            <span className="text-white font-bold text-lg">
                                {(freelancer.user?.name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0f172a]" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm truncate">{freelancer.user?.name || "Unknown"}</h3>
                    <p className="text-xs text-white/40 truncate">{freelancer.category || "Freelancer"}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-amber-400 text-xs">*</span>
                        <span className="text-xs text-white/70 font-semibold">{(freelancer.rating || 0).toFixed(1)}</span>
                        <span className="text-xs text-white/30">({freelancer.totalRatings || 0})</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
                {skills.map((sk, i) => (
                    <span key={i} className="bg-white/5 border border-white/10 text-white/50 text-[10px] px-2 py-0.5 rounded-md">
                        {sk}
                    </span>
                ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div>
                    <span className="text-sm font-bold text-white">{freelancer.hourlyRate ? `Rs.${freelancer.hourlyRate}` : "Open"}</span>
                    <span className="text-[10px] text-white/30">/hr</span>
                </div>
                <Link
                    to={`/profile/${freelancer.user?._id}`}
                    className={`bg-gradient-to-r ${gradients[colorIndex]} text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:shadow-lg transition-all duration-200`}
                >
                    Hire
                </Link>
            </div>
        </motion.div>
    )
})

const HowItWorksStep = memo(function HowItWorksStep({ step, index, isActive }) {
    const colors = ["from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-amber-500"]
    const icons = [
        <svg key="1" className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>,
        <svg key="2" className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 017.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>,
        <svg key="3" className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>,
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
            className={`relative flex flex-col items-center text-center p-6 rounded-2xl transition-all duration-300 ${isActive ? "bg-white/[0.06] border border-white/20 shadow-xl" : "hover:bg-white/[0.03]"}`}
        >
            <motion.div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors[index]} flex items-center justify-center mb-4 shadow-lg transition-all duration-300 ${isActive ? "scale-110 shadow-xl" : ""}`}
                animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
            >
                {icons[index]}
            </motion.div>
            <span className={`text-xs font-bold uppercase tracking-wider mb-2 ${isActive ? "text-blue-400" : "text-white/40"}`}>
                Step {index + 1}
            </span>
            <h3 className={`text-lg font-bold mb-2 ${isActive ? "text-white" : "text-white/60"}`}>{step.title}</h3>
            <p className={`text-sm leading-relaxed ${isActive ? "text-white/70" : "text-white/40"}`}>{step.desc}</p>
            {isActive && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 h-1 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" />}
        </motion.div>
    )
})

const FeatureCard = memo(function FeatureCard({ feature, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -2 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/20 hover:shadow-xl transition-all duration-300 group"
        >
            <div
                className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300`}
            >
                <span className="text-2xl">{feature.icon}</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{feature.desc}</p>
        </motion.div>
    )
})

const TestimonialCard = memo(function TestimonialCard({ testimonial, index }) {
    const [isActive, setIsActive] = useState(false)
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onMouseEnter={() => setIsActive(true)}
            onMouseLeave={() => setIsActive(false)}
            className={`bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all duration-300 ${isActive ? "bg-white/[0.06] border-white/20 shadow-xl" : ""}`}
        >
            <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                ))}
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5">"{testimonial.text}"</p>
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${testimonial.gradient} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{testimonial.name.split(" ").map((n) => n[0]).join("")}</span>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-xs text-white/40">{testimonial.role}</p>
                </div>
            </div>
        </motion.div>
    )
})

const PricingCard = memo(function PricingCard({ plan, index, isHighlighted }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            className={`relative bg-white/[0.03] backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
                isHighlighted ? "border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-transparent" : "border-white/10 hover:bg-white/[0.06] hover:border-white/20"
            }`}
        >
            {isHighlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                </div>
            )}
            <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <span className="text-2xl">{plan.icon}</span>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-1">{plan.title}</h3>
            <p className="text-xs text-white/40 text-center mb-4">{plan.subtitle}</p>
            <div className="text-center mb-4">
                <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                {plan.period && <span className="text-sm text-white/40 ml-1">{plan.period}</span>}
            </div>
            <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                        <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                    </li>
                ))}
            </ul>
            <Link
                to="/register"
                className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
                    isHighlighted
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30"
                        : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}
            >
                {plan.cta}
            </Link>
        </motion.div>
    )
})

const Skeleton = ({ className }) => <div className={`bg-white/5 animate-pulse rounded-xl ${className}`} />

const FreelancerSkeleton = () => (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-4">
            <Skeleton className="w-14 h-14 rounded-xl" />
            <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
            </div>
        </div>
        <div className="flex gap-1.5 mb-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex justify-between pt-3 border-t border-white/5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
    </div>
)

const Home = () => {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState("")
    const [searchType, setSearchType] = useState("freelancers")
    const [stats, setStats] = useState({})
    const [freelancers, setFreelancers] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeStep, setActiveStep] = useState(0)

    const categories = [
        { key: "web", label: "Web Dev", icon: "W", count: "5,200+" },
        { key: "design", label: "UI/UX Design", icon: "D", count: "3,800+" },
        { key: "ai", label: "AI / ML", icon: "AI", count: "1,500+" },
        { key: "mobile", label: "Mobile Dev", icon: "M", count: "2,200+" },
        { key: "data", label: "Data Science", icon: "DS", count: "1,100+" },
        { key: "writing", label: "Content", icon: "C", count: "890+" },
    ]

    const howItWorksSteps = [
        { title: "Post Your Project", desc: "Describe your requirements and set your budget. Takes less than 5 minutes." },
        { title: "Hire the Best", desc: "Review proposals from top freelancers. Compare ratings and past work." },
        { title: "Pay Securely", desc: "Release payment only when you are 100% satisfied with the work." },
    ]

    const features = [
        { icon: "S", title: "Secure Escrow Payments", desc: "Your money is protected until you approve the work. Fully refundable if unsatisfied.", gradient: "from-emerald-500 to-teal-500" },
        { icon: "C", title: "Real-time Chat", desc: "Communicate instantly with freelancers. Share files, track progress, and get updates.", gradient: "from-blue-500 to-cyan-500" },
        { icon: "F", title: "Fast Delivery", desc: "Get quality work delivered on time. Our freelancers are vetted for professionalism.", gradient: "from-amber-500 to-orange-500" },
        { icon: "V", title: "Verified Freelancers", desc: "All freelancers are identity-verified. Read reviews and hire with confidence.", gradient: "from-violet-500 to-purple-500" },
    ]

    const testimonials = [
        { name: "Sarah Johnson", role: "Startup Founder", text: "Found an amazing developer who delivered my e-commerce site ahead of schedule. The quality exceeded my expectations!", gradient: "from-blue-500 to-cyan-500" },
        { name: "Michael Chen", role: "Marketing Director", text: "The platform made it easy to find the perfect designer. Communication was smooth and the results were fantastic!", gradient: "from-emerald-500 to-teal-500" },
        { name: "Emily Rodriguez", role: "Business Owner", text: "Best investment for my business. Got a professional mobile app developed at a fraction of traditional costs.", gradient: "from-orange-500 to-amber-500" },
    ]

    const pricingPlans = [
        {
            icon: "C",
            title: "Client",
            subtitle: "For clients hiring freelancers",
            price: "FREE",
            period: "",
            gradient: "from-slate-500 to-gray-500",
            features: ["Post unlimited projects", "Browse all freelancers", "Real-time chat", "Secure escrow payments", "24/7 support"],
            cta: "Get Started",
        },
        {
            icon: "F",
            title: "Starter",
            subtitle: "For new freelancers",
            price: "Rs.299",
            period: "/month",
            gradient: "from-blue-500 to-cyan-500",
            features: ["5 project proposals/month", "Featured profile", "Priority support", "Basic analytics", "Email notifications"],
            cta: "Start Freelancing",
        },
        {
            icon: "P",
            title: "Pro",
            subtitle: "For serious freelancers",
            price: "Rs.499",
            period: "/month",
            gradient: "from-violet-500 to-purple-500",
            features: ["Unlimited proposals", "Top placement in search", "Advanced analytics", "Dedicated support", "Skill certifications"],
            cta: "Go Pro",
        },
    ]

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [freelancersRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5050"}/api/freelancer?limit=8`),
                ])
                setFreelancers(freelancersRes.data?.freelancers || freelancersRes.data || [])
            } catch (err) {
                console.error("Failed to fetch data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % howItWorksSteps.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleSearch = useCallback(
        (e) => {
            e.preventDefault()
            if (searchType === "freelancers") {
                navigate(`/talent?q=${encodeURIComponent(searchQuery)}`)
            } else {
                navigate(`/find/work?q=${encodeURIComponent(searchQuery)}`)
            }
        },
        [searchQuery, searchType, navigate]
    )

    const handleCategoryClick = useCallback(
        (category) => {
            navigate(`/talent?category=${encodeURIComponent(category.label)}`)
        },
        [navigate]
    )

    return (
        <div className="min-h-screen bg-[#020617]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
                @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
                .animate-fade-in-up { animation: fadeInUp 0.6s ease both }
                .gradient-shimmer { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent); background-size: 200% 100%; animation: shimmer 1.5s infinite }
            `}</style>

            <section className="relative min-h-[90vh] flex items-center overflow-hidden">
                <AnimatedBackground />
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-2"
                            >
                                <span className="relative flex w-2 h-2">
                                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                                    <span className="relative rounded-full bg-emerald-400 w-2 h-2" />
                                </span>
                                <span className="text-xs sm:text-sm text-white/70 font-medium">Verified experts online now</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
                            >
                                Hire Top Freelancers.
                                <br />
                                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">Get Work Done Faster.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg sm:text-xl text-white/50 max-w-lg"
                            >
                                Connect with world-class freelancers. Secure payments. Real-time collaboration. Start your project today.
                            </motion.p>

                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                onSubmit={handleSearch}
                                className="flex flex-col sm:flex-row gap-3 max-w-xl"
                            >
                                <div className="flex-1 relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">search</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={searchType === "freelancers" ? "Search freelancers by skill..." : "Search projects..."}
                                        className="w-full pl-11 pr-4 py-4 text-sm text-white placeholder-white/30 bg-white/[0.05] border border-white/10 rounded-xl outline-none transition-all focus:bg-white/[0.08] focus:border-white/20 focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value)}
                                        className="px-4 py-4 text-sm font-medium text-white bg-white/[0.05] border border-white/10 rounded-xl outline-none cursor-pointer"
                                    >
                                        <option value="freelancers">Find Talent</option>
                                        <option value="projects">Find Work</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm rounded-xl hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200 whitespace-nowrap"
                                    >
                                        Search
                                    </button>
                                </div>
                            </motion.form>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="flex flex-wrap gap-3"
                            >
                                <Link
                                    to="/talent"
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-200"
                                >
                                    Find Talent
                                </Link>
                                <Link
                                    to="/find/work"
                                    className="bg-white/[0.05] text-white px-6 py-3 rounded-xl font-semibold text-sm border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200"
                                >
                                    Find Work
                                </Link>
                            </motion.div>

                            <TrustBar stats={stats} />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="hidden lg:block"
                        >
                            <LiveActivityFeed />
                        </motion.div>
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-20 bg-[#0f172a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Browse Top Categories</h2>
                        <p className="text-white/50 text-lg">Find the perfect freelancer for any project</p>
                    </motion.div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat, i) => (
                            <CategoryCard key={cat.label} category={cat} index={i} onClick={() => handleCategoryClick(cat)} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-extrabold text-white mb-2">Top Freelancers</h2>
                            <p className="text-white/50">Highly rated professionals ready to help</p>
                        </div>
                        <Link to="/talent" className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {loading ? (
                            [...Array(4)].map((_, i) => <FreelancerSkeleton key={i} />)
                        ) : freelancers.length > 0 ? (
                            freelancers.slice(0, 8).map((freelancer, i) => <FreelancerCard key={freelancer._id} freelancer={freelancer} index={i} />)
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-white/40">No freelancers found</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-20 bg-[#0f172a]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">How It Works</h2>
                        <p className="text-white/50 text-lg">Get started in just a few simple steps</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {howItWorksSteps.map((step, i) => (
                            <HowItWorksStep key={step.title} step={step} index={i} isActive={activeStep === i} />
                        ))}
                    </div>
                    <div className="flex justify-center gap-2 mt-8">
                        {howItWorksSteps.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveStep(i)}
                                className={`rounded-full transition-all duration-300 ${activeStep === i ? "w-6 h-2.5 bg-gradient-to-r from-blue-500 to-cyan-500" : "w-2.5 h-2.5 bg-white/20 hover:bg-white/30"}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Why Choose Co.Worker?</h2>
                        <p className="text-white/50 text-lg">Everything you need for successful collaboration</p>
                    </motion.div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map((feature, i) => (
                            <FeatureCard key={feature.title} feature={feature} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-20 bg-[#0f172a]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Simple, Transparent Pricing</h2>
                        <p className="text-white/50 text-lg">Start free. Scale as you grow.</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {pricingPlans.map((plan, i) => (
                            <PricingCard key={plan.title} plan={plan} index={i} isHighlighted={i === 1} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">What Our Clients Say</h2>
                        <p className="text-white/50 text-lg">Join thousands of satisfied customers</p>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, i) => (
                            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative z-10 py-20 bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-white rounded-full blur-3xl" />
                </div>
                <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">Ready to Get Started?</h2>
                    <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">Join businesses and freelancers working together on Co.Worker.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-base hover:shadow-2xl hover:scale-105 transition-all duration-200"
                        >
                            Post a Project
                        </Link>
                        <Link
                            to="/find/work"
                            className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-base border-2 border-white/30 hover:bg-white/20 transition-all duration-200"
                        >
                            Find Work
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="relative z-10 bg-[#0a0f1a] py-12 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                        {[
                            { title: "For Clients", links: ["How to Hire", "Talent Marketplace", "Project Catalog", "Enterprise"] },
                            { title: "For Freelancers", links: ["How to Find Work", "Direct Contracts", "Find Jobs", "Success Stories"] },
                            { title: "Resources", links: ["Help & Support", "Blog", "Community", "API"] },
                            { title: "Company", links: ["About Us", "Careers", "Press", "Contact"] },
                        ].map((col) => (
                            <div key={col.title}>
                                <h3 className="text-white font-semibold mb-4">{col.title}</h3>
                                <ul className="space-y-2">
                                    {col.links.map((l) => (
                                        <li key={l}>
                                            <a className="text-white/40 hover:text-white text-sm transition-colors duration-200 cursor-pointer">{l}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center rounded-lg">
                                <span className="text-white font-bold text-xs">Co</span>
                            </div>
                            <span className="text-white font-semibold">Co.Worker</span>
                        </div>
                        <div className="text-sm text-white/30 mb-4 md:mb-0">
                            {new Date().getFullYear()} Co.Worker. All rights reserved.
                        </div>
                        <div className="flex gap-6">
                            {["Privacy", "Terms", "Security"].map((l) => (
                                <a key={l} className="text-white/30 hover:text-white text-sm transition-colors duration-200 cursor-pointer">
                                    {l}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home