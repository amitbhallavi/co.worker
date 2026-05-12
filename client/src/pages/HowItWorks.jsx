import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

// ── Intersection Observer Hook ─────────────────────────────
const useInView = (threshold = 0.15) => {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true)
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// ── Animated Counter ────────────────────────────────────────
const useCounter = (end, duration = 2000, inView = false) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    let start = 0
    const increment = end / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, inView])
  return count
}

// ── Animated Stats Row ──────────────────────────────────────
const AnimatedStats = ({ inView }) => {
  const freelancers = useCounter(50000, 2500, inView)
  const projects = useCounter(120000, 2500, inView)
  const paid = useCounter(200, 2000, inView) // in lakhs
  const rating = useCounter(49, 1500, inView) / 10

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mt-10">
      {[
        { value: `${(freelancers / 1000).toFixed(0)}K+`, label: 'Active Freelancers', icon: '👨‍💻' },
        { value: `${(projects / 1000).toFixed(0)}K+`, label: 'Projects Done', icon: '📋' },
        { value: `₹${(paid).toFixed(0)}L+`, label: 'Paid to Freelancers', icon: '💰' },
        { value: `${(rating).toFixed(1)}★`, label: 'Average Rating', icon: '⭐' },
      ].map((s, i) => (
        <div
          key={s.label}
          className={`
            bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-center shadow-sm
            hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5
            dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10 dark:shadow-none dark:hover:bg-white/10 dark:hover:border-white/20
            transition-all duration-400
            ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="text-base">{s.icon}</span>
            <span className="text-lg sm:text-xl font-extrabold text-slate-950 dark:text-white">
              {inView ? s.value : '0'}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-white/50 font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// STEP DATA
// ══════════════════════════════════════════════════════════
const CLIENT_STEPS = [
  {
    number: '01',
    icon: '📋',
    title: 'Post Your Project',
    subtitle: 'Describe what you need',
    desc: 'Fill in your project title, description, budget, duration, and required skills. Takes less than 5 minutes. The more details you provide, the better matches you get.',
    color: 'from-blue-400 to-cyan-400',
    tips: ['Be specific about deliverables', 'Set a realistic budget', 'Mention tech stack required'],
    emoji: '✍️',
  },
  {
    number: '02',
    icon: '🔍',
    title: 'Browse & Match',
    subtitle: 'AI-powered freelancer matching',
    desc: 'Our AI analyzes your requirements and matches you with the most relevant available freelancers. You can also browse and invite directly.',
    color: 'from-violet-400 to-purple-400',
    tips: ['AI matches based on skills', 'View verified portfolios', 'Shortlist favorites'],
    emoji: '🤖',
  },
  {
    number: '03',
    icon: '💳',
    title: 'Fund Escrow',
    subtitle: 'Secure payment via Razorpay',
    desc: 'Once you accept a freelancer, pay securely via Razorpay. Your money goes into escrow — the freelancer only gets paid when you approve.',
    color: 'from-emerald-400 to-teal-400',
    tips: ['100% money-back guarantee', 'Razorpay secured payment', 'Funds held in escrow'],
    emoji: '🔒',
  },
  {
    number: '04',
    icon: '✅',
    title: 'Approve & Release',
    subtitle: 'Pay when fully satisfied',
    desc: 'Review the completed work. Happy? Mark it complete and payment releases automatically. Not satisfied? Request revisions or raise a dispute.',
    color: 'from-orange-400 to-amber-400',
    tips: ['Unlimited revisions', 'Fair dispute resolution', 'Auto payment release'],
    emoji: '🎉',
  },
]

const FREELANCER_STEPS = [
  {
    number: '01',
    icon: '👤',
    title: 'Build Your Profile',
    subtitle: 'Showcase your skills & work',
    desc: 'Create a compelling profile with your skills, experience, portfolio projects, and hourly rate. A complete profile gets 3x more project invites.',
    color: 'from-blue-400 to-cyan-400',
    tips: ['Add portfolio projects', 'Highlight key skills', 'Set competitive rate'],
    emoji: '✨',
  },
  {
    number: '02',
    icon: '🔎',
    title: 'Browse & Bid',
    subtitle: 'Find matching projects',
    desc: 'Browse projects filtered by category, budget, and skills. Place a competitive bid with a personalised message. Stand out from other bidders.',
    color: 'from-violet-400 to-purple-400',
    tips: ['Write a personalised pitch', 'Highlight relevant experience', 'Set competitive pricing'],
    emoji: '📨',
  },
  {
    number: '03',
    icon: '🚀',
    title: 'Deliver Excellence',
    subtitle: 'Complete on time, every time',
    desc: 'Once accepted, deliver quality work on time. Communicate regularly, submit updates, and meet deadlines to ensure 5-star reviews.',
    color: 'from-emerald-400 to-teal-400',
    tips: ['Communicate proactively', 'Submit milestones', 'Handle feedback gracefully'],
    emoji: '💪',
  },
  {
    number: '04',
    icon: '💰',
    title: 'Get Paid Securely',
    subtitle: 'Withdraw to bank or UPI',
    desc: 'Once the client approves, payment releases from escrow to your wallet within 24 hours. Withdraw anytime to your bank account or UPI.',
    color: 'from-orange-400 to-amber-400',
    tips: ['Instant escrow release', '24-hour withdrawal', 'Zero platform fees'],
    emoji: '🤑',
  },
]

const ESCROW_FLOW = [
  { icon: '👤', title: 'Client Posts Project', sub: 'And funds escrow via Razorpay' },
  { icon: '🤝', title: 'Freelancer Accepts', sub: 'And starts working' },
  { icon: '📦', title: 'Work Delivered', sub: 'Client reviews the submission' },
  { icon: '✅', title: 'Client Approves', sub: 'Funds released in 24 hours' },
]

const TRUST_POINTS = [
  { icon: '🔒', title: 'Escrow Protected', desc: 'All payments held safely until approval' },
  { icon: '⚡', title: 'Instant Payouts', desc: 'Withdraw earnings within 24 hours' },
  { icon: '🛡️', title: 'Dispute Resolution', desc: 'Fair mediation by our expert team' },
  { icon: '✓', title: 'Verified Freelancers', desc: 'Identity-verified talent pool' },
  { icon: '💬', title: '24/7 Support', desc: 'Round-the-clock help via chat & email' },
  { icon: '📊', title: 'Zero Hidden Fees', desc: 'Complete transparency, always' },
]

const FAQS = [
  { q: 'How does the escrow payment system work?', a: 'When a client accepts a bid, they pay via Razorpay into a secure escrow account. The money is held safely until the project is marked complete. This protects both parties — clients only pay for approved work, and freelancers are guaranteed payment for completed deliverables.' },
  { q: 'Is it really free to post a project or place a bid?', a: 'Yes! Posting projects and bidding is completely free for everyone. Platform fees only apply when a project is successfully completed. For freelancers, Pro and Elite plans offer lower fees and better visibility.' },
  { q: 'How do freelancers get paid after project completion?', a: 'Once the client marks the project as complete, funds are released from escrow to the freelancer\'s wallet within 24 hours. They can withdraw to their bank account or UPI anytime — no minimum balance required.' },
  { q: 'What if I\'m not satisfied with the delivered work?', a: 'You can request unlimited revisions before approving. If you cannot resolve the issue directly with the freelancer, you can raise a dispute. Our dedicated team will review the case and mediate a fair resolution, including a full refund if the work was not delivered as agreed.' },
  { q: 'How does the AI freelancer matching work?', a: 'Our AI analyzes your project requirements — including title, description, skills, budget, and timeline — then matches you with freelancers whose profiles, portfolio, and reviews indicate the best fit. You always have the final say in who you hire.' },
  { q: 'How do I know a freelancer is trustworthy?', a: 'Every freelancer goes through an identity verification process. Additionally, our rating and review system, project completion history, and verified badges help you make informed decisions. Pro and Elite freelancers have been vetted through higher platform activity.' },
]

// ══════════════════════════════════════════════════════════
// STEP CARD COMPONENT
// ══════════════════════════════════════════════════════════
const StepCard = ({ step, index }) => {
  const [ref, inView] = useInView(0.1)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col rounded-2xl p-6 transition-all duration-500
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        ${hovered
          ? 'bg-white border border-slate-300 shadow-2xl -translate-y-2 dark:bg-white/10 dark:backdrop-blur-sm dark:border-white/20'
          : 'bg-white border border-slate-200 shadow-sm dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10 dark:shadow-none'
        }
      `}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Emoji badge */}
      <div className="absolute -top-4 right-4 text-3xl">{step.emoji}</div>

      {/* Step number */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-xl shadow-lg`}>
          {step.icon}
        </div>
        <span className="text-3xl font-black text-slate-200 dark:text-white/10">{step.number}</span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-extrabold text-slate-950 dark:text-white mb-0.5">{step.title}</h3>
      <p className={`text-xs font-semibold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-3`}>
        {step.subtitle}
      </p>
      <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed mb-4 flex-1">{step.desc}</p>

      {/* Tips */}
      <ul className="space-y-1.5">
        {step.tips.map((tip) => (
          <li key={tip} className="text-xs text-slate-500 dark:text-white/50 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${step.color} flex-shrink-0`} />
            {tip}
          </li>
        ))}
      </ul>

      {/* Connector arrow */}
      {index < 3 && (
        <div className="hidden lg:flex absolute -right-8 top-1/2 -translate-y-1/2 z-20 items-center">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full bg-gradient-to-r ${step.color} transition-all`}
                style={{ opacity: 0.3 + i * 0.2 }}
              />
            ))}
            <span className={`text-lg ml-1 bg-gradient-to-r ${step.color} bg-clip-text text-transparent font-bold`}>›</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// ESCROW FLOW COMPONENT
// ══════════════════════════════════════════════════════════
const EscrowFlow = ({ inView }) => (
  <div className={`
    escrow-flow-panel border border-emerald-200 rounded-3xl p-8 sm:p-10 shadow-sm
    dark:border-emerald-300/20 dark:shadow-none
    transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
  `}>
    {/* Header */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 mb-4 dark:bg-emerald-400/10 dark:border-emerald-300/20">
        <span className="text-emerald-600 dark:text-emerald-300 text-sm">🔒</span>
        <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold">How Escrow Works</span>
      </div>
      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mb-2">
        Your Money is Always
        <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"> Safe & Secure</span>
      </h3>
      <p className="text-slate-600 dark:text-white/50 text-sm max-w-lg mx-auto">
        We hold your payment in escrow until you approve the completed work. No risk, no surprises — guaranteed.
      </p>
    </div>

    {/* Flow */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {ESCROW_FLOW.map((item, i) => (
        <div
          key={i}
          className={`
            relative bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center
            hover:bg-white hover:border-emerald-200 hover:shadow-sm
            dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 dark:hover:shadow-none
            transition-all duration-300
            ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
          `}
          style={{ transitionDelay: `${400 + i * 100}ms` }}
        >
          {/* Step dot */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
            <span className="text-[8px] font-bold text-white">{i + 1}</span>
          </div>

          <div className="text-3xl mb-2">{item.icon}</div>
          <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</div>
          <div className="text-xs text-slate-500 dark:text-white/40">{item.sub}</div>

          {/* Connector */}
          {i < 3 && (
            <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2">
              <span className="text-emerald-400/40 text-xl">›</span>
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Bottom trust strip */}
    <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-emerald-100 dark:border-white/10">
      {['✓ Razorpay Secured', '✓ Funds in Escrow', '✓ 100% Refund Policy', '✓ Instant Release'].map(t => (
        <span key={t} className="text-xs text-emerald-600 dark:text-emerald-300/70 font-medium">{t}</span>
      ))}
    </div>
  </div>
)

// ══════════════════════════════════════════════════════════
// TRUST GRID COMPONENT
// ══════════════════════════════════════════════════════════
const TrustGrid = ({ inView }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    {TRUST_POINTS.map((item, i) => (
      <div
        key={item.title}
        className={`
          bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm
          hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5
          dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10 dark:shadow-none dark:hover:bg-white/10 dark:hover:border-white/20
          transition-all duration-300
          ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
        `}
        style={{ transitionDelay: `${i * 80}ms` }}
      >
        <div className="text-2xl mb-2">{item.icon}</div>
        <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">{item.title}</div>
        <div className="text-[10px] text-slate-500 dark:text-white/40 leading-relaxed">{item.desc}</div>
      </div>
    ))}
  </div>
)

// ══════════════════════════════════════════════════════════
// FAQ ACCORDION
// ══════════════════════════════════════════════════════════
const FAQItem = ({ faq, index, isOpen, onToggle }) => {
  const [ref, inView] = useInView(0.2)

  return (
    <div
      ref={ref}
      className={`
        border rounded-xl overflow-hidden transition-all duration-300
        ${isOpen
          ? 'bg-white border-slate-300 shadow-lg dark:bg-white/10 dark:backdrop-blur-sm dark:border-white/20'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10 dark:hover:border-white/20 dark:shadow-none'
        }
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer bg-transparent border-none"
      >
        <span className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white pr-4 leading-snug">{faq.q}</span>
        <span className={`
          flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold transition-all duration-300
          ${isOpen
            ? 'bg-blue-50 border-blue-200 text-blue-600 rotate-45 dark:bg-white/20 dark:border-white/20 dark:text-white'
            : 'bg-slate-50 border-slate-200 text-slate-500 dark:text-white/60 dark:bg-white/5 dark:border-white/20'
          }
        `}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent dark:from-white/10 dark:via-white/5 mb-4" />
          <p className="text-sm text-slate-600 dark:text-white/60 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TESTIMONIAL / SUCCESS STORY
// ══════════════════════════════════════════════════════════
const SuccessStory = ({ inView }) => {
  const stories = [
    {
      avatar: 'PS',
      name: 'Priya Sharma',
      role: 'Tech Startup Founder',
      gradient: 'from-blue-500 to-cyan-500',
      text: 'Found an incredible React developer within 48 hours. The escrow system gave me confidence to pay upfront. Best hiring decision I made for my MVP.',
      project: '₹45,000 MVP Development',
      rating: 5,
    },
    {
      avatar: 'RV',
      name: 'Rahul Verma',
      role: 'Full-Stack Developer',
      gradient: 'from-violet-500 to-purple-500',
      text: 'Started with the free plan, got my first 3 clients in week one. Upgraded to Pro after month two — my project inquiries tripled within 30 days.',
      project: '₹1.2L earned in 60 days',
      rating: 5,
    },
  ]

  return (
    <div className={`
      grid grid-cols-1 sm:grid-cols-2 gap-5
      transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
    `}>
      {stories.map((s, i) => (
        <div
          key={s.name}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:bg-slate-50 hover:border-slate-300 dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10 dark:shadow-none dark:hover:bg-white/10 dark:hover:border-white/20 transition-all duration-300"
          style={{ transitionDelay: `${i * 150}ms` }}
        >
          {/* Quote */}
          <div className="text-3xl text-slate-300 dark:text-white/20 mb-3">"</div>
          <p className="text-sm text-slate-600 dark:text-white/70 leading-relaxed italic mb-5">{s.text}</p>

          {/* Project badge */}
          <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${s.gradient} border border-transparent rounded-full px-3 py-1 mb-4`}>
            <span className="text-xs font-bold text-white">{s.project}</span>
          </div>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xs font-bold text-white`}>
              {s.avatar}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</div>
              <div className="text-xs text-slate-500 dark:text-white/40">{s.role}</div>
            </div>
            <div className="ml-auto flex gap-0.5">
              {Array.from({ length: s.rating }).map((_, i) => (
                <span key={i} className="text-amber-400 text-sm">★</span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════
const HowItWorks = () => {
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  const [activeTab, setActiveTab] = useState('client')
  const [heroRef, heroInView] = useInView(0.1)
  const [escrowRef, escrowInView] = useInView(0.2)
  const [faqOpen, setFaqOpen] = useState(null)

  const steps = activeTab === 'client' ? CLIENT_STEPS : FREELANCER_STEPS

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900 dark:bg-slate-950 dark:text-white" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ping2    { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
        @keyframes floatY   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
        @keyframes cursor   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulseGlow{ 0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.15)} 50%{box-shadow:0 0 40px rgba(59,130,246,0.3)} }
        .cursor-blink       { display:inline-block; width:2px; height:1.1em; background:currentColor; margin-left:2px; vertical-align:text-bottom; animation:cursor 0.9s ease infinite }
        .step-grid          { display:grid; gap:1.5rem; }
        @media(min-width:768px)  { .step-grid { grid-template-columns: repeat(2,1fr) } }
        @media(min-width:1024px) { .step-grid { grid-template-columns: repeat(4,1fr) } }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="relative bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-[600px] h-[600px] rounded-full -top-60 -right-40 opacity-20"
            style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.3) 0%,transparent 70%)', animation: 'floatY 12s ease-in-out infinite' }} />
          <div className="absolute w-96 h-96 rounded-full bottom-0 -left-40 opacity-15"
            style={{ background: 'radial-gradient(circle,rgba(34,211,238,0.2) 0%,transparent 70%)', animation: 'floatY 16s ease-in-out infinite reverse' }} />
          <div className="absolute w-[400px] h-[400px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"
            style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.2) 0%,transparent 70%)', animation: 'floatY 10s ease-in-out infinite' }} />
        </div>

        <div ref={heroRef} className="relative max-w-5xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">

          {/* Live badge */}
          <div className={`
            inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2 mb-8 shadow-sm
            dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-lg
            transition-all duration-700 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <span className="relative flex w-2.5 h-2.5 flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400" style={{ animation: 'ping2 2s ease infinite' }} />
              <span className="relative rounded-full bg-emerald-400 w-2.5 h-2.5" />
            </span>
            <span className="text-xs sm:text-sm text-slate-600 dark:text-white/70 font-semibold">
              Trusted by 50,000+ professionals worldwide
            </span>
          </div>

          {/* Headline */}
          <h1 className={`
            text-4xl sm:text-6xl font-extrabold text-slate-950 dark:text-white leading-tight mb-5 transition-all duration-700 delay-100
            ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            {activeTab === 'client' ? (
              <>
                Hire Top Freelancers
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  in 4 Simple Steps
                </span>
              </>
            ) : (
              <>
                Start Earning
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  in 4 Simple Steps
                </span>
              </>
            )}
          </h1>

          {/* Sub */}
          <p className={`
            text-base sm:text-lg text-slate-600 dark:text-white/50 max-w-xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-200
            ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            {activeTab === 'client'
              ? 'Post your project, match with talent, pay securely via escrow, and get work done. No complexity, no hidden fees.'
              : 'Build your profile, bid on projects, deliver great work, and get paid. Simple, safe, and rewarding.'
            }
          </p>

          {/* Tab Switcher */}
          <div className={`
            flex justify-center mb-8 transition-all duration-700 delay-300
            ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="bg-white border border-slate-200 rounded-2xl p-1 flex gap-1 shadow-xl dark:bg-white/5 dark:backdrop-blur-sm dark:border-white/10">
              {[
                { key: 'client', label: '👔 Hire Talent', sub: 'I\'m a client' },
                { key: 'freelancer', label: '💻 Find Work', sub: 'I\'m a freelancer' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`
                    px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-none
                    flex flex-col items-center gap-0.5 min-w-[140px]
                    ${activeTab === t.key
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5'
                    }
                  `}>
                  <span>{t.label}</span>
                  <span className={`text-[10px] font-medium ${activeTab === t.key ? 'text-blue-100' : 'text-slate-400 dark:text-white/30'}`}>
                    {t.sub}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Animated Stats */}
          <AnimatedStats inView={heroInView} />
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path className="fill-[#f5f7fb] dark:fill-[#020617]" d="M0 60V0C240 40 480 60 720 40C960 20 1200 40 1440 0V60H0Z" />
          </svg>
        </div>
      </div>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">

        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Step-by-Step Guide</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white mb-3">
            {activeTab === 'client' ? (
              <>How <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Clients</span> Hire</>
            ) : (
              <>How <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Freelancers</span> Earn</>
            )}
          </h2>
          <p className="text-slate-600 dark:text-white/40 text-sm max-w-lg mx-auto">
            {activeTab === 'client'
              ? 'From posting to payment — every step designed to be simple, safe, and fast.'
              : 'From profile to payout — every step built to help you earn more, faster.'
            }
          </p>
        </div>

        {/* Steps Grid */}
        <div className="step-grid mb-20">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* Escrow Flow Section */}
        <div className="mb-20">
          <div ref={escrowRef}>
            <EscrowFlow inView={escrowInView} />
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-violet-400 text-xs font-bold uppercase tracking-wider">Success Stories</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mb-2">
              Real People.
              <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent"> Real Results.</span>
            </h3>
            <p className="text-slate-600 dark:text-white/40 text-sm">Hear from freelancers and clients who made it happen</p>
          </div>
          <SuccessStory inView={escrowInView} />
        </div>

        {/* Trust Grid */}
        <div className="mb-20">
          <div className="text-center mb-8">
            <h3 className="text-xl font-extrabold text-slate-950 dark:text-white mb-1">Built on Trust & Safety</h3>
            <p className="text-sm text-slate-600 dark:text-white/40">Every transaction protected by escrow and our dedicated team</p>
          </div>
          <TrustGrid inView={escrowInView} />
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">FAQ</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white mb-2">
              Frequently Asked
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> Questions</span>
            </h3>
            <p className="text-slate-600 dark:text-white/40 text-sm">Everything you need to know before getting started</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem
                key={i}
                faq={faq}
                index={i}
                isOpen={faqOpen === i}
                onToggle={() => setFaqOpen(faqOpen === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══ BOTTOM CTA ════════════════════════════════════════ */}
      <div className="bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] dark:bg-gradient-to-r dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 py-16 sm:py-24 px-4 relative overflow-hidden border-t border-slate-200 dark:border-white/5">
        {/* Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.3) 0%,transparent 70%)' }} />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white mb-4 leading-tight">
            {activeTab === 'client' ? (
              <>Ready to Hire<br /><span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> for Free?</span></>
            ) : (
              <>Ready to Start<br /><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> Your Journey?</span></>
            )}
          </h2>
          <p className="text-slate-600 dark:text-white/50 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            {activeTab === 'client'
              ? 'Join 50,000+ clients who\'ve hired top freelancers without paying a single rupee upfront.'
              : 'Start free today. Build your profile, win your first project, and see where it takes you.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(user ? (activeTab === 'client' ? '/browse-projects' : '/find-work') : '/register')}
              className="px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer border-none
                bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105"
            >
              {activeTab === 'client' ? (user ? 'Browse Freelancers ↗' : 'Get Started Free ↗') : (user ? 'Find Work Now ↗' : 'Join Free ↗')}
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-8 py-4 rounded-2xl font-bold text-sm border-2 border-slate-200 text-slate-700 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 cursor-pointer dark:border-white/20 dark:text-white dark:bg-transparent dark:hover:bg-white/10"
            >
              View Pricing
            </button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-5 mt-8">
            {['✓ Free to join', '✓ Escrow protected', '✓ Zero upfront fees', '✓ Cancel anytime'].map(t => (
              <span key={t} className="text-xs text-slate-500 dark:text-white/30 font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HowItWorks
