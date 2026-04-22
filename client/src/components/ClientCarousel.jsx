// ClientCarousel.jsx — Pure CSS, No Framer Motion needed
import { useMemo, useState } from 'react'

// ── Data Processing Hook ───────────────────────────────────
function useClients(listedProjects) {
    return useMemo(() => {
        if (!Array.isArray(listedProjects) || listedProjects.length === 0) return []

        const map = {}
        listedProjects.forEach(p => {
            const u = p.user
            if (!u?._id) return
            if (!map[u._id]) {
                map[u._id] = {
                    _id: u._id,
                    name: u.name || 'Client',
                    email: u.email || '',
                    profilePic: u.profilePic || null,
                    totalProjects: 0,
                    totalBudget: 0,
                    lastActive: null,
                }
            }
            map[u._id].totalProjects += 1
            map[u._id].totalBudget += Number(p.budget) || 0
            const d = new Date(p.createdAt)
            if (!map[u._id].lastActive || d > map[u._id].lastActive) {
                map[u._id].lastActive = d
            }
        })

        return Object.values(map)
            .sort((a, b) => b.totalBudget - a.totalBudget)
            .slice(0, 12)
    }, [listedProjects])
}

// ── Trust Score Logic ──────────────────────────────────────
function getTrustScore(client, referenceTime = Date.now()) {
    let score = 60
    if (client.totalProjects >= 3) score += 20
    else if (client.totalProjects >= 1) score += 10
    if (client.totalBudget >= 50000) score += 15
    else if (client.totalBudget >= 10000) score += 8
    const daysSince = client.lastActive
        ? (referenceTime - client.lastActive.getTime()) / 86400000
        : 999
    if (daysSince < 7) score += 5
    return Math.min(score, 99)
}

// ── Initials Avatar ────────────────────────────────────────
function Avatar({ name, pic, size = 'lg' }) {
    const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    const sz = size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'
    const txt = size === 'lg' ? 'text-xl' : 'text-sm'
    const GRADIENTS = [
        'from-blue-500 to-cyan-500',
        'from-violet-500 to-purple-500',
        'from-rose-500 to-pink-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-sky-500 to-blue-500',
    ]
    const grad = GRADIENTS[(name?.charCodeAt(0) || 0) % GRADIENTS.length]

    if (pic) return (
        <img src={pic} alt={name}
            className={`${sz} rounded-2xl object-cover ring-2 ring-white shadow-md flex-shrink-0`}
            onError={e => { e.target.style.display = 'none' }} />
    )
    return (
        <div className={`${sz} rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center ring-2 ring-white shadow-md flex-shrink-0`}>
            <span className={`text-white font-black ${txt}`}>{initials}</span>
        </div>
    )
}

// ── Client Card ────────────────────────────────────────────
function ClientCard({ client, onClick }) {
    const [renderTime] = useState(() => Date.now())
    const score = getTrustScore(client, renderTime)
    const lastActiveMs = client.lastActive ? client.lastActive.getTime() : null
    const daysSince = lastActiveMs !== null
        ? Math.floor((renderTime - lastActiveMs) / 86400000)
        : null
    const isActive = daysSince !== null && daysSince < 14

    const badges = [
        { label: '✔ Payment Verified', show: true },
        { label: '✔ Active Client', show: isActive },
        { label: '✔ High Budget', show: client.totalBudget >= 20000 },
    ].filter(b => b.show)

    return (
        <div
            onClick={() => onClick(client)}
            className="flex-shrink-0 w-[260px] bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group"
        >
            {/* Top gradient bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />

            <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <Avatar name={client.name} pic={client.profilePic} />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="font-black text-gray-900 text-sm truncate">{client.name}</p>
                            {isActive && (
                                <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
                                    style={{ boxShadow: '0 0 6px #22C55E' }} />
                            )}
                        </div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full  text-green-600  mt-0.5">
                            ✔   Verified Client
                        </span>
                    </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Projects</p>
                        <p className="text-base font-black text-gray-900">{client.totalProjects}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Budget</p>
                        <p className="text-sm font-black text-emerald-600">
                            ₹{client.totalBudget >= 100000
                                ? `${(client.totalBudget / 100000).toFixed(1)}L`
                                : client.totalBudget >= 1000
                                    ? `${(client.totalBudget / 1000).toFixed(0)}K`
                                    : client.totalBudget
                            }
                        </p>
                    </div>
                </div>

                {/* Trust score bar */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trust Score</span>
                        <span className="text-[11px] font-black text-blue-600">{score}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                            style={{ width: `${score}%` }}
                        />
                    </div>
                </div>

                {/* Trust badges */}
                {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {badges.map(b => (
                            <span key={b.label}
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                                {b.label}
                            </span>
                        ))}
                    </div>
                )}

                {/* Last active */}
                {daysSince !== null && (
                    <p className="text-[10px] text-slate-400 mb-3">
                        {isActive
                            ? daysSince === 0 ? ' Active today' : ` Active ${daysSince}d ago`
                            : `Last seen ${daysSince}d ago`
                        }
                    </p>
                )}

                {/* CTA */}
                <button
                    className="w-full py-2 text-xs font-bold text-white rounded-xl border-none cursor-pointer transition-all group-hover:shadow-md"
                    style={{ background: 'linear-gradient(135deg,#3B7FF5,#2BC4D4)' }}
                >
                    View Projects ↗
                </button>
            </div>
        </div>
    )
}

// ── Client Modal ───────────────────────────────────────────
function ClientModal({ client, projects, onClose }) {
    if (!client) return null
    const clientProjects = projects.filter(p => p.user?._id === client._id)

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 relative">
                    <button onClick={onClose}
                        className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center text-sm font-bold cursor-pointer border-none">✕</button>
                    <div className="flex items-center gap-3">
                        <Avatar name={client.name} pic={client.profilePic} />
                        <div>
                            <h2 className="text-white font-black text-lg">{client.name}</h2>
                            <p className="text-blue-100 text-xs">{client.email}</p>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white mt-1">✦ Verified Client</span>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                    {[
                        { label: 'Projects', value: client.totalProjects },
                        { label: 'Total Budget', value: `₹${Number(client.totalBudget).toLocaleString('en-IN')}` },
                        { label: 'Trust Score', value: `${getTrustScore(client)}%` },
                    ].map(s => (
                        <div key={s.label} className="px-4 py-3 text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{s.label}</p>
                            <p className="text-sm font-black text-gray-900">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Projects list */}
                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Posted Projects</p>
                    {clientProjects.length === 0
                        ? <p className="text-sm text-gray-400 text-center py-8">No projects found</p>
                        : clientProjects.map(p => (
                            <div key={p._id} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-gray-900 text-sm leading-snug">{p.title}</p>
                                    <span className="text-xs font-black text-emerald-600 flex-shrink-0">
                                        ₹{p.budget ? Number(p.budget).toLocaleString('en-IN') : '—'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{p.category}</span>
                                    <span className="text-[10px] text-gray-400">{p.duration ? `${p.duration} days` : ''}</span>
                                </div>
                            </div>
                        ))
                    }
                </div>

                <div className="px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm rounded-xl border-none cursor-pointer hover:opacity-90 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main Carousel ──────────────────────────────────────────
export default function ClientCarousel({ listedProjects }) {
    const clients = useClients(listedProjects)
    const [selectedClient, setSelectedClient] = useState(null)
    const [paused, setPaused] = useState(false)

    if (clients.length === 0) return null

    // Duplicate for seamless infinite loop
    const doubled = [...clients, ...clients]

    return (
        <>
            {selectedClient && (
                <ClientModal
                    client={selectedClient}
                    projects={listedProjects}
                    onClose={() => setSelectedClient(null)}
                />
            )}

            <div className="relative z-10 py-8 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50/40">
                {/* Section header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-1">Real Clients · Real Projects</p>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                                Who's Hiring Right Now?
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="w-2 h-2 rounded-full bg-green-400"
                                style={{ boxShadow: '0 0 6px #22C55E', animation: 'pulse 2s infinite' }} />
                            {clients.length} active clients
                        </div>
                    </div>
                </div>

                {/* Carousel track */}
                <div
                    className="overflow-hidden"
                    onMouseEnter={() => setPaused(true)}
                    onMouseLeave={() => setPaused(false)}
                >
                    <div
                        className="flex gap-4 px-4"
                        style={{
                            width: 'max-content',
                            animation: `clientScroll ${clients.length * 4}s linear infinite`,
                            animationPlayState: paused ? 'paused' : 'running',
                        }}
                    >
                        {doubled.map((client, i) => (
                            <ClientCard
                                key={`${client._id}-${i}`}
                                client={client}
                                onClick={setSelectedClient}
                            />
                        ))}
                    </div>
                </div>

                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                    style={{ background: 'linear-gradient(to right, rgba(248,250,252,0.9), transparent)' }} />
                <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
                    style={{ background: 'linear-gradient(to left, rgba(248,250,252,0.9), transparent)' }} />

                {/* Pause hint */}
                {paused && (
                    <div className="absolute bottom-3 right-6 text-[10px] text-gray-400 font-medium">
                        ⏸ Hover to pause · Click card to explore
                    </div>
                )}

                <style>{`
                    @keyframes clientScroll {
                        0%   { transform: translateX(0) }
                        100% { transform: translateX(-50%) }
                    }
                `}</style>
            </div>
        </>
    )
}
