import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

// ── Hero category cards data ─────────────────────────────────────────────────
const HERO_CARDS = [
  {
    id: 0,
    title: 'Web Development',
    sub: '5,200+ experts available',
    gradient: 'from-blue-500 to-cyan-500',
    bgLight: 'from-blue-50 to-cyan-50',
    border: 'border-blue-100',
    shadow: 'shadow-blue-200',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 1,
    title: 'Design & Creative',
    sub: '3,800+ experts available',
    gradient: 'from-emerald-500 to-teal-500',
    bgLight: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-200',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    id: 2,
    title: 'Marketing & Sales',
    sub: '2,400+ experts available',
    gradient: 'from-orange-500 to-amber-500',
    bgLight: 'from-orange-50 to-amber-50',
    border: 'border-orange-100',
    shadow: 'shadow-orange-200',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
]

// ── Browse categories ────────────────────────────────────────────────────────
const BROWSE_CATS = [
  { label: 'Development', count: '5,200', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg> },
  { label: 'Design', count: '3,800', gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  { label: 'Writing', count: '1,200', gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-50 to-amber-50', border: 'border-orange-100', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Video', count: '890', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-50 to-rose-50', border: 'border-pink-100', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg> },
  { label: 'Audio', count: '650', gradient: 'from-violet-500 to-purple-500', bg: 'from-violet-50 to-purple-50', border: 'border-violet-100', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> },
  { label: 'Marketing', count: '2,400', gradient: 'from-sky-500 to-blue-500', bg: 'from-sky-50 to-blue-50', border: 'border-sky-100', icon: <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
]

// ── Star rating helper ───────────────────────────────────────────────────────
const Stars = () => (
  <div className="flex items-center space-x-0.5 mb-4">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
  </div>
)

// ════════════════════════════════════════════════════════════════════════════
const Home = () => {
  const [hlIdx, setHlIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const loopRef = useRef(null)
  const progressRef = useRef(null)

  const DURATION = 2000
  const TICK = 40

  // ── Infinity loop on hero cards ─────────────────────────────────────────
  useEffect(() => {
    let idx = 0
    let prog = 0

    progressRef.current = setInterval(() => {
      prog += (TICK / DURATION) * 100
      if (prog >= 100) prog = 100
      setProgress(prog)
    }, TICK)

    loopRef.current = setInterval(() => {
      idx = (idx + 1) % HERO_CARDS.length
      setHlIdx(idx)
      prog = 0
      setProgress(0)
    }, DURATION)

    return () => {
      clearInterval(loopRef.current)
      clearInterval(progressRef.current)
    }
  }, [])

  const handleCardClick = (i) => {
    clearInterval(loopRef.current)
    clearInterval(progressRef.current)
    setHlIdx(i)
    setProgress(0)

    let prog = 0
    progressRef.current = setInterval(() => {
      prog += (TICK / DURATION) * 100
      if (prog >= 100) prog = 100
      setProgress(prog)
    }, TICK)

    let idx = i
    loopRef.current = setInterval(() => {
      idx = (idx + 1) % HERO_CARDS.length
      setHlIdx(idx)
      prog = 0
      setProgress(0)
    }, DURATION)
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; } 50% { opacity: 0.25; }
        }
        @keyframes floatBadge {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes ping-slow {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .fade-up-1 { animation: fadeInUp 0.6s ease both 0.1s; }
        .fade-up-2 { animation: fadeInUp 0.6s ease both 0.25s; }
        .fade-up-3 { animation: fadeInUp 0.6s ease both 0.4s; }
        .fade-up-4 { animation: fadeInUp 0.6s ease both 0.55s; }
        .scale-in  { animation: scaleIn  0.55s ease both 0.3s; }
        .float-badge { animation: floatBadge 3.5s ease-in-out infinite; }
        .float-badge-2 { animation: floatBadge 3.5s ease-in-out infinite 1.7s; }
        .ping-slow::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          animation: ping-slow 1.4s cubic-bezier(0,0,0.2,1) infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div className="space-y-8">
              <div className="fade-up-1">
                <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
                  10,000+ verified experts online now
                </span>
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-tight">
                  Hire Expert{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Freelancers
                  </span>{' '}
                  for Your Next Project
                </h1>
              </div>

              <p className="text-xl text-gray-600 leading-relaxed fade-up-2">
                Connect with top-rated professionals worldwide. Get quality work delivered on time, every time. Start your project today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 fade-up-3">
                <Link to="/talent">
                  <button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200 w-full sm:w-auto">
                    Get Started Free
                  </button>
                </Link>
                <Link to="/talent">
                  <button className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-200 w-full sm:w-auto">
                    Browse Talent
                  </button>
                </Link>
              </div>

              <div className="flex items-center space-x-8 pt-4 fade-up-4">
                {[
                  { val: '50K+', label: 'Active Freelancers' },
                  { val: '100K+', label: 'Projects Completed' },
                  { val: '4.9/5', label: 'Client Rating' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{s.val}</div>
                    <div className="text-sm text-gray-600">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — loop cards */}
            <div className="relative scale-in">
              {/* glow blob */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur-3xl opacity-20 pointer-events-none" />

              {/* floating badges */}
              <div className="absolute -top-4 -right-4 z-10 float-badge">
                <div className="bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" style={{ animation: 'blink 1.4s ease-in-out infinite' }} />
                  <span className="text-xs font-semibold text-gray-700">142 online now</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 z-10 float-badge-2">
                <div className="bg-white rounded-xl shadow-lg px-3 py-2 flex items-center gap-2 border border-gray-100">
                  <span className="text-xs">⚡</span>
                  <span className="text-xs font-semibold text-gray-700">Avg. reply 2 min</span>
                </div>
              </div>

              <div className="relative bg-white rounded-2xl p-6 shadow-2xl">

                {/* loop progress bar */}
                <div className="h-1 bg-gray-100 rounded-full mb-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${HERO_CARDS[hlIdx].gradient} transition-none`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* loop indicator dots */}
                <div className="flex justify-end gap-1.5 mb-4">
                  {HERO_CARDS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleCardClick(i)}
                      className={`rounded-full transition-all duration-300 ${
                        hlIdx === i
                          ? `w-5 h-2 bg-gradient-to-r ${HERO_CARDS[i].gradient}`
                          : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  {HERO_CARDS.map((card, i) => (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(i)}
                      className={`rounded-xl p-5 border cursor-pointer transition-all duration-400 ${
                        hlIdx === i
                          ? `bg-gradient-to-br ${card.bgLight} ${card.border} shadow-lg shadow-${card.shadow} scale-[1.02] ring-2 ring-offset-1 ${
                              i === 0 ? 'ring-blue-300' : i === 1 ? 'ring-emerald-300' : 'ring-orange-300'
                            }`
                          : `bg-gradient-to-br ${card.bgLight} ${card.border} hover:shadow-md opacity-70 hover:opacity-100`
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          hlIdx === i ? 'shadow-lg scale-110' : ''
                        }`}>
                          {card.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-0.5 transition-colors duration-200 ${
                            hlIdx === i ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {card.title}
                          </h3>
                          <p className="text-sm text-gray-500">{card.sub}</p>
                        </div>
                        {hlIdx === i && (
                          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* bottom CTA inside card */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Click any category to explore</p>
                  <Link to="/talent">
                    <button className={`text-xs font-bold bg-gradient-to-r ${HERO_CARDS[hlIdx].gradient} text-white px-4 py-2 rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200`}>
                      View All →
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ BROWSE CATEGORIES ════════════════════════════════════════════ */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse Top Categories</h2>
              <p className="text-xl text-gray-600">Find the perfect freelancer for your project</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {BROWSE_CATS.map((cat) => (
                <Link to="/talent" key={cat.label}>
                  <div className={`bg-gradient-to-br ${cat.bg} rounded-xl p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer border ${cat.border} group`}>
                    <div className={`w-16 h-16 bg-gradient-to-br ${cat.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{cat.label}</h3>
                    <p className="text-sm text-gray-600">{cat.count} skills</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ HOW IT WORKS ═════════════════════════════════════════════════ */}
        <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600">Get started in just a few simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Post Your Project', desc: 'Describe your project requirements and set your budget. It takes less than 5 minutes.', gradient: 'from-blue-500 to-cyan-500', ping: 'bg-cyan-400' },
                { num: '2', title: 'Review Proposals', desc: 'Receive competitive bids from talented freelancers. Compare profiles and ratings.', gradient: 'from-emerald-500 to-teal-500', ping: 'bg-teal-400' },
                { num: '3', title: 'Get It Done', desc: "Work with your chosen freelancer. Pay securely when you're 100% satisfied.", gradient: 'from-orange-500 to-amber-500', ping: 'bg-amber-400' },
              ].map((step) => (
                <div key={step.num} className="text-center group">
                  <div className="relative inline-block mb-6">
                    <div className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                      <span className="text-3xl font-bold text-white">{step.num}</span>
                    </div>
                    <div className={`absolute -top-2 -right-2 w-6 h-6 ${step.ping} rounded-full animate-ping`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TESTIMONIALS ═════════════════════════════════════════════════ */}
        <section className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
              <p className="text-xl text-gray-600">Join thousands of satisfied customers</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: 'Sarah Johnson', role: 'Startup Founder', text: '"Found an amazing developer who delivered my e-commerce site ahead of schedule. The quality exceeded my expectations!"', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-100', avatar: 'from-blue-500 to-cyan-500' },
                { name: 'Michael Chen', role: 'Marketing Director', text: '"The platform made it easy to find the perfect designer. Communication was smooth and the results were fantastic!"', bg: 'from-emerald-50 to-teal-50', border: 'border-emerald-100', avatar: 'from-emerald-500 to-teal-500' },
                { name: 'Emily Rodriguez', role: 'Business Owner', text: '"Best investment for my business. Got a professional mobile app developed at a fraction of traditional costs."', bg: 'from-orange-50 to-amber-50', border: 'border-orange-100', avatar: 'from-orange-500 to-amber-500' },
              ].map((t) => (
                <div key={t.name} className={`bg-gradient-to-br ${t.bg} rounded-2xl p-8 border ${t.border} hover:shadow-xl transition-all duration-200 hover:-translate-y-1`}>
                  <Stars />
                  <p className="text-gray-700 mb-6 leading-relaxed">{t.text}</p>
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${t.avatar} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-sm">{t.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{t.name}</div>
                      <div className="text-sm text-gray-600">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CTA BANNER ═══════════════════════════════════════════════════ */}
        <section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-56 h-56 rounded-full bg-white blur-3xl" />
          </div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">Join thousands of businesses and freelancers working together</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/talent">
                <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                  Post a Project
                </button>
              </Link>
              <Link to="/talent">
                <button className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg border-2 border-white hover:bg-blue-800 transition-all duration-200">
                  Find Work
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FOOTER ═══════════════════════════════════════════════════════ */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {[
                { title: 'For Clients', links: ['How to Hire', 'Talent Marketplace', 'Project Catalog', 'Enterprise'] },
                { title: 'For Freelancers', links: ['How to Find Work', 'Direct Contracts', 'Find Jobs', 'Success Stories'] },
                { title: 'Resources', links: ['Help & Support', 'Blog', 'Community', 'API'] },
                { title: 'Company', links: ['About Us', 'Careers', 'Press', 'Contact'] },
              ].map((col) => (
                <div key={col.title}>
                  <h3 className="text-white font-semibold mb-4">{col.title}</h3>
                  <ul className="space-y-2">
                    {col.links.map((l) => (
                      <li key={l}><a className="hover:text-white transition-colors duration-200 cursor-pointer">{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white font-semibold">FreelanceHub</span>
              </div>
              <div className="text-sm text-gray-400">© 2024 FreelanceHub. All rights reserved.</div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                {['Privacy', 'Terms', 'Security'].map((l) => (
                  <a key={l} className="hover:text-white transition-colors duration-200 cursor-pointer">{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  )
}

export default Home
