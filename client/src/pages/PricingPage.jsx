import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { activateClientPlan } from '../features/client/clientSlice'
import { fetchUserPlan } from '../features/subscription/planSlice'
import { getSocket } from '../utils/socketManager'
import SubscriptionCheckout from '../components/SubscriptionCheckout'

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

// ── Social Proof Counter ────────────────────────────────────
const SocialCounter = ({ inView }) => {
  const users = useCounter(50000, 2500, inView)
  const projects = useCounter(120000, 2500, inView)
  const rating = useCounter(48, 1500, inView) / 10

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-8">
      {[
        { value: `${(users / 1000).toFixed(0)}K+`, label: 'Active Users' },
        { value: `${(projects / 1000).toFixed(0)}K+`, label: 'Projects Done' },
        { value: `${rating.toFixed(1)}★`, label: 'Average Rating' },
      ].map((item, i) => (
        <div key={i} className="text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{inView ? item.value : '0'}</div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// CLIENT PLANS — FREE FOREVER, ZERO FRICTION
// ══════════════════════════════════════════════════════════
const CLIENT_PLANS = [
  {
    name: 'Starter',
    badge: '🔥 Best for Getting Started',
    icon: '🌱',
    price: { monthly: 0, yearly: 0 },
    isFree: true,
    desc: 'Everything you need to start hiring. No credit card, no commitment.',
    color: 'from-emerald-400 to-teal-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    btnStyle: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-[1.02]',
    popular: false,
    features: [
      { text: 'Unlimited project postings', included: true },
      { text: 'Unlimited hiring', included: true },
      { text: 'Real-time chat & messaging', included: true },
      { text: 'Escrow payment protection', included: true },
      { text: 'Ratings & reviews system', included: true },
      { text: 'AI-powered freelancer matching', included: true },
      { text: 'Project analytics dashboard', included: true },
      { text: 'Priority support', included: false },
    ],
    cta: 'Start Hiring Free',
  },
  {
    name: 'Growth',
    badge: '⚡ Most Popular',
    icon: '🚀',
    price: { monthly: 0, yearly: 0 },
    isFree: true,
    desc: 'For serious hirers who want the best talent matched fast.',
    color: 'from-blue-500 to-cyan-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-400',
    btnStyle: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-xl hover:shadow-blue-500/25 hover:scale-[1.02]',
    popular: true,
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Priority freelancer matching', included: true },
      { text: 'Featured project visibility', included: true },
      { text: 'Direct shortlist & invite', included: true },
      { text: 'Advanced project analytics', included: true },
      { text: 'Team collaboration tools', included: true },
      { text: 'Dedicated account manager', included: false },
      { text: 'White-label dashboard', included: false },
    ],
    cta: 'Start Hiring Free',
  },
  {
    name: 'Business',
    badge: '🏢 For Agencies & Teams',
    icon: '🏢',
    price: { monthly: 0, yearly: 0 },
    isFree: true,
    desc: 'For agencies and companies hiring at scale with full control.',
    color: 'from-violet-500 to-purple-500',
    lightColor: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    btnStyle: 'bg-gradient-to-r from-violet-600 to-purple-500 text-white hover:shadow-xl hover:shadow-violet-500/25 hover:scale-[1.02]',
    popular: false,
    features: [
      { text: 'Everything in Growth', included: true },
      { text: 'Multi-user team access', included: true },
      { text: 'Custom workflows & integrations', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'White-label client portal', included: true },
      { text: 'API access & webhooks', included: true },
      { text: 'SLA-backed uptime guarantee', included: true },
      { text: 'Custom billing & invoicing', included: true },
    ],
    cta: 'Start Hiring Free',
  },
]

// ══════════════════════════════════════════════════════════
// FREELANCER PLANS — 3-TIER UPGRADE SYSTEM
// ══════════════════════════════════════════════════════════
const FREELANCER_PLANS = [
  {
    name: 'Free',
    badge: null,
    icon: '🌱',
    price: { monthly: 0, yearly: 0 },
    desc: 'Start your freelancing journey at zero cost. No credit card required.',
    color: 'from-gray-400 to-slate-500',
    lightColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    btnStyle: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200',
    popular: false,
    features: [
      { text: '5 bids per month', detail: 'Apply to 5 projects', included: true },
      { text: 'Basic profile listing', detail: 'Get discovered', included: true },
      { text: 'Standard search visibility', detail: 'Lower ranking', included: true },
      { text: 'Portfolio (5 projects)', detail: 'Showcase your work', included: true },
      { text: '0% platform fee', detail: 'Keep all you earn', included: true },
      { text: 'Featured profile', detail: null, included: false },
      { text: 'Priority support', detail: null, included: false },
      { text: 'Pro badge', detail: null, included: false },
    ],
    cta: 'Join Free',
    savings: null,
  },
  {
    name: 'Pro',
    badge: '⭐ Best Value',
    icon: '⚡',
    price: { monthly: 199, yearly: 159 },
    desc: 'For serious freelancers who want more clients and more earnings.',
    color: 'from-blue-500 to-cyan-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-400',
    btnStyle: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02]',
    popular: true,
    features: [
      { text: '50 bids per month', detail: '10x more chances', included: true },
      { text: 'Enhanced profile + video', detail: 'Stand out more', included: true },
      { text: 'Priority search placement', detail: 'Top 20% ranking', included: true },
      { text: 'Portfolio (15 projects)', detail: 'More work shown', included: true },
      { text: '0% platform fee', detail: 'Keep all you earn', included: true },
      { text: 'Featured profile listing', detail: 'Get highlighted', included: true },
      { text: 'Priority support', detail: 'Faster responses', included: true },
      { text: 'Pro badge on profile', detail: 'Builds trust', included: true },
    ],
    cta: 'Upgrade to Pro',
    savings: 'Save 33%',
  },
  {
    name: 'Elite',
    badge: '👑 Top Tier',
    icon: '👑',
    price: { monthly: 399, yearly: 319 },
    desc: 'Maximum visibility and unlimited opportunities. Top-tier talent gets top-tier results.',
    color: 'from-amber-500 to-orange-500',
    lightColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-300',
    btnStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.02]',
    popular: false,
    features: [
      { text: 'Unlimited bids', detail: 'No limits, no ceiling', included: true },
      { text: 'Top of search results', detail: 'Always first', included: true },
      { text: 'Homepage showcase', detail: 'Maximum exposure', included: true },
      { text: 'Unlimited portfolio', detail: 'Showcase everything', included: true },
      { text: '0% platform fee', detail: 'Keep all you earn', included: true },
      { text: 'Featured + highlighted', detail: 'Double visibility', included: true },
      { text: 'Dedicated account manager', detail: 'Personal support', included: true },
      { text: 'Elite badge', detail: 'Premium credibility', included: true },
    ],
    cta: 'Go Elite',
    savings: 'Save 33%',
  },
]

// ══════════════════════════════════════════════════════════
// COMPARISON TABLE DATA
// ══════════════════════════════════════════════════════════
const COMPARISON_FEATURES = [
  { label: 'Monthly bids', free: '5', pro: '50', elite: 'Unlimited' },
  { label: 'Profile type', free: 'Basic', pro: 'Enhanced + Video', elite: 'Premium + Video' },
  { label: 'Search ranking', free: 'Standard', pro: 'Top 20%', elite: 'Top 3 Results' },
  { label: 'Portfolio projects', free: '5', pro: '15', elite: 'Unlimited' },
  { label: 'Platform fee', free: '0%', pro: '0%', elite: '0%' },
  { label: 'Featured listing', free: false, pro: true, elite: true },
  { label: 'Homepage showcase', free: false, pro: false, elite: true },
  { label: 'Support', free: 'Standard', pro: 'Priority', elite: 'Dedicated Manager' },
  { label: 'Profile badge', free: false, pro: 'Pro Badge', elite: 'Elite Badge' },
  { label: 'Direct invite', free: false, pro: true, elite: true },
]

// ══════════════════════════════════════════════════════════
// TRUST & SOCIAL PROOF DATA
// ══════════════════════════════════════════════════════════
const TRUST_ITEMS = [
  { icon: '🔒', title: 'Escrow Protected', desc: 'Payments held safely until you approve work' },
  { icon: '⚡', title: 'Instant Payouts', desc: 'Withdraw earnings to bank or UPI within 24 hours' },
  { icon: '🛡️', title: 'Dispute Resolution', desc: 'Fair mediation by our dedicated team' },
  { icon: '📊', title: '100% Transparent', desc: 'Track every rupee — no hidden fees ever' },
  { icon: '✓', title: 'Verified Freelancers', desc: 'Every talent is identity-verified' },
  { icon: '💬', title: '24/7 Support', desc: 'Round-the-clock help via chat & email' },
]

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Startup Founder',
    avatar: 'PS',
    text: 'Found an amazing React developer within 48 hours. The FREE client plan is incredible — no hidden costs, just results.',
    rating: 5,
    plan: 'Growth',
  },
  {
    name: 'Rahul Verma',
    role: 'Full-Stack Developer',
    avatar: 'RV',
    text: 'Upgraded to Pro and doubled my project inquiries within a month. The featured profile placement really works.',
    rating: 5,
    plan: 'Pro',
  },
  {
    name: 'Anita Desai',
    role: 'Marketing Agency',
    avatar: 'AD',
    text: 'Managing 12 freelancers through the platform. The escrow system gives both sides peace of mind.',
    rating: 5,
    plan: 'Business',
  },
]

const FAQS = [
  { q: 'Is it really 100% free for clients?', a: 'Yes! Clients pay absolutely nothing to post unlimited projects, hire freelancers, and manage work. We believe in aligning incentives — we only succeed when you succeed.' },
  { q: 'How do freelancers get paid?', a: 'Once you accept completed work, funds are released from escrow to the freelancer\'s wallet instantly. They can withdraw to their bank or UPI within 24 hours.' },
  { q: 'Is my payment safe?', a: 'Absolutely. All payments are held in escrow — a neutral third-party account — until you explicitly approve the completed work. If there\'s a dispute, our team mediates fairly.' },
  { q: 'Can I cancel or change plans anytime?', a: 'Yes. Upgrade immediately with prorated billing. Downgrade takes effect at your next billing cycle. Cancel anytime with no cancellation fees.' },
  { q: 'What happens if a freelancer doesn\'t deliver?', a: 'You can request revisions, escalate to our dispute resolution team, or cancel the project. Funds remain in escrow until a fair resolution is reached.' },
  { q: 'How does the freelancer matching work?', a: 'Our AI analyzes your project requirements, budget, and timeline — then matches you with the most relevant available freelancers. The better your project description, the better the matches.' },
]

// ══════════════════════════════════════════════════════════
// PLAN CARD COMPONENT
// ══════════════════════════════════════════════════════════
const PlanCard = ({ plan, billing, onCTA, index }) => {
  const [ref, inView] = useInView(0.1)
  const [hovered, setHovered] = useState(false)
  const isPopular = !!plan.popular
  const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex flex-col rounded-2xl p-6 sm:p-7 transition-all duration-500
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        ${isPopular
          ? `bg-gradient-to-br from-white to-slate-50 border-2 ${plan.borderColor} shadow-2xl shadow-blue-500/10 ${hovered ? 'scale-[1.03]' : 'scale-[1.01]'}`
          : `bg-white border border-gray-200 ${hovered ? 'shadow-xl -translate-y-1 border-gray-300' : 'shadow-sm'}`
        }
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Popular glow effect */}
      {isPopular && (
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-purple-500/20 -z-10 blur-xl opacity-60" />
      )}

      {/* Top gradient bar for popular */}
      {isPopular && (
        <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${plan.color} rounded-t-2xl`} />
      )}

      {/* Badge */}
      {plan.badge && (
        <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-extrabold text-white bg-gradient-to-r ${plan.color} shadow-lg whitespace-nowrap`}>
          {plan.badge}
        </div>
      )}

      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-12 h-12 rounded-2xl ${plan.lightColor} flex items-center justify-center text-2xl shadow-sm`}>
            {plan.icon}
          </div>
          {plan.savings && billing === 'yearly' && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">
              {plan.savings}
            </span>
          )}
        </div>

        <h3 className="text-lg font-extrabold text-gray-900 mb-1">{plan.name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{plan.desc}</p>

        {/* Price */}
        <div className="flex items-end gap-1.5 mt-4 mb-1">
          {price === 0 ? (
            <>
              <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">FREE</span>
              <span className="text-sm text-gray-400 mb-2 font-medium">forever</span>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-400 mb-2 font-medium">₹</span>
              <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                {price.toLocaleString('en-IN')}
              </span>
              <span className="text-sm text-gray-400 mb-2 font-medium">/mo</span>
            </>
          )}
        </div>
        {billing === 'yearly' && price > 0 && (
          <p className={`text-xs font-semibold ${plan.textColor}`}>
            ₹{(price * 12).toLocaleString('en-IN')}/year · Billed annually
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5" />

      {/* Features */}
      <ul className="space-y-3 mb-7 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`
              flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5
              ${f.included
                ? `bg-gradient-to-r ${plan.color} text-white shadow-sm`
                : 'bg-gray-100 text-gray-300'
              }
            `}>
              {f.included ? '✓' : '✕'}
            </span>
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${f.included ? 'text-gray-700 font-medium' : 'text-gray-300'}`}>
                {f.text}
              </span>
              {f.detail && f.included && (
                <span className="text-xs text-gray-400 block">{f.detail}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => onCTA(plan)}
        className={`
          w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer border-none
          ${isPopular ? 'shadow-lg shadow-blue-500/20' : ''}
          ${plan.btnStyle}
        `}
      >
        {plan.cta}
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// COMPARISON TABLE COMPONENT
// ══════════════════════════════════════════════════════════
const ComparisonTable = () => {
  const [ref, inView] = useInView(0.1)

  return (
    <div ref={ref} className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
              <th className="text-left px-6 py-4 text-sm font-bold text-gray-700">Features</th>
              {['Free', 'Pro', 'Elite'].map((plan, i) => (
                <th key={plan} className="text-center px-4 py-4">
                  <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold
                    ${i === 0 ? 'bg-gray-100 text-gray-600' : i === 1 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}
                  `}>
                    {plan}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARISON_FEATURES.map((row, i) => (
              <tr key={i} className={`border-b border-gray-100 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                <td className="px-6 py-3.5 text-sm font-medium text-gray-700">{row.label}</td>
                {[row.free, row.pro, row.elite].map((val, j) => (
                  <td key={j} className="text-center px-4 py-3.5">
                    {typeof val === 'boolean' ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                        ${val ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-300'}
                      `}>
                        {val ? '✓' : '—'}
                      </span>
                    ) : (
                      <span className={`text-sm font-semibold ${j === 0 ? 'text-gray-600' : j === 1 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {val}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TESTIMONIAL CARD
// ══════════════════════════════════════════════════════════
const TestimonialCard = ({ t, index }) => {
  const [ref, inView] = useInView(0.2)

  return (
    <div
      ref={ref}
      className={`
        bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-500
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-3">
        {Array.from({ length: t.rating }).map((_, i) => (
          <span key={i} className="text-amber-400 text-sm">★</span>
        ))}
      </div>

      {/* Quote */}
      <p className="text-sm text-gray-700 leading-relaxed mb-4 italic">"{t.text}"</p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
          {t.avatar}
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">{t.name}</div>
          <div className="text-xs text-gray-500">{t.role}</div>
        </div>
        {t.plan !== 'Free' && (
          <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-full
            ${t.plan === 'Pro' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}
          `}>
            {t.plan}
          </span>
        )}
      </div>
    </div>
  )
}

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
        ${isOpen ? 'border-blue-200 shadow-md bg-gradient-to-br from-white to-blue-50/30' : 'border-gray-200 hover:border-gray-300 bg-white'}
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer bg-transparent border-none"
      >
        <span className="text-sm sm:text-base font-semibold text-gray-800 pr-4 leading-snug">{faq.q}</span>
        <span className={`
          flex-shrink-0 w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-sm font-bold transition-all duration-300
          ${isOpen ? 'bg-blue-500 border-blue-500 text-white rotate-45' : 'border-gray-300 text-gray-500 bg-white'}
        `}>
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-5">
          <div className="h-px bg-gradient-to-r from-blue-100 via-cyan-100 to-transparent mb-4" />
          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// TRUST BADGES ROW
// ══════════════════════════════════════════════════════════
const TrustBadge = ({ item, index }) => {
  const [ref, inView] = useInView(0.2)

  return (
    <div
      ref={ref}
      className={`
        flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-400
        ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
      `}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <span className="text-2xl">{item.icon}</span>
      <div>
        <div className="text-sm font-bold text-gray-800">{item.title}</div>
        <div className="text-xs text-gray-400 leading-relaxed">{item.desc}</div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN PRICING PAGE
// ══════════════════════════════════════════════════════════
const PricingPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  const [tab, setTab] = useState('client') // 'client' | 'freelancer'
  const [billing, setBilling] = useState('monthly')
  const [heroRef, heroInView] = useInView(0.1)
  const [socialRef, socialInView] = useInView(0.3)
  const [faqOpen, setFaqOpen] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState(null)
  const [checkoutPlanType, setCheckoutPlanType] = useState('monthly')

  const plans = tab === 'client' ? CLIENT_PLANS : FREELANCER_PLANS

  // ── Socket.io real-time plan update listener ──────────────
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const onPlanActivated = (data) => {
      dispatch(fetchUserPlan())
      toast.success(`🎉 Your ${data.plan} plan is now active!`, {
        position: 'top-right',
        autoClose: 5000,
      })
    }

    const onPlanRenewed = (data) => {
      dispatch(fetchUserPlan())
      toast.success(`✅ ${data.plan} plan renewed successfully!`, {
        position: 'top-right',
        autoClose: 5000,
      })
    }

    const onPlanCancelled = (data) => {
      dispatch(fetchUserPlan())
      toast.info(`📌 ${data.message}`, {
        position: 'top-right',
        autoClose: 4000,
      })
    }

    socket.on('planActivated', onPlanActivated)
    socket.on('planRenewed', onPlanRenewed)
    socket.on('planCancelled', onPlanCancelled)

    return () => {
      socket.off('planActivated', onPlanActivated)
      socket.off('planRenewed', onPlanRenewed)
      socket.off('planCancelled', onPlanCancelled)
    }
  }, [dispatch])

  const handleCTA = async (plan) => {
    if (tab === 'client') {
      // Client FREE plan — zero friction activation
      if (!user) {
        navigate('/register')
        return
      }

      try {
        await dispatch(activateClientPlan()).unwrap()

        toast.success('🎉 Free Client Plan activated! Start hiring freelancers instantly.', {
          position: 'top-right',
          autoClose: 6000,
        })

        setTimeout(() => navigate('/browse-projects'), 1800)
      } catch (error) {
        toast.error(error || 'Failed to activate plan. Please try again.')
      }
      return
    }

    // Freelancer plan flow — requires payment
    if (!user) {
      navigate('/login')
      return
    }

    if (plan.name === 'Free') {
      navigate('/register')
      return
    }

    // Map plan names to IDs
    const planIdMap = { 'Free': 'free', 'Pro': 'pro', 'Elite': 'elite' }
    const planId = planIdMap[plan.name]

    setCheckoutPlan(planId)
    setCheckoutPlanType(billing)
    setShowCheckout(true)
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ping2    { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
        @keyframes floatY    { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-16px)} }
        @keyframes cursor   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulseGlow{ 0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.15)} 50%{box-shadow:0 0 40px rgba(59,130,246,0.3)} }
        .cursor-blink        { display:inline-block; width:2px; height:1em; background:currentColor; margin-left:2px; vertical-align:middle; animation:cursor 0.9s ease infinite }
        .plans-grid          { display:grid; gap:1.25rem; }
        @media(min-width:768px) { .plans-grid { grid-template-columns: repeat(3,1fr) } }
        .glow-border         { animation: pulseGlow 3s ease-in-out infinite }
      `}</style>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-[600px] h-[600px] rounded-full -top-60 -right-40 opacity-30"
            style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)', animation: 'floatY 10s ease-in-out infinite' }} />
          <div className="absolute w-96 h-96 rounded-full bottom-0 -left-40 opacity-20"
            style={{ background: 'radial-gradient(circle,rgba(34,211,238,0.15) 0%,transparent 70%)', animation: 'floatY 14s ease-in-out infinite reverse' }} />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDR2LTRoMzJ2NGgtNHYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        </div>

        <div ref={heroRef} className="relative max-w-4xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-14 sm:pb-20 text-center">

          {/* Live badge */}
          <div className={`
            inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-8 shadow-lg transition-all duration-700
            ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <span className="relative flex w-2.5 h-2.5 flex-shrink-0">
              <span className="absolute inset-0 rounded-full bg-emerald-400" style={{ animation: 'ping2 2s ease infinite' }} />
              <span className="relative rounded-full bg-emerald-400 w-2.5 h-2.5" />
            </span>
            <span className="text-xs sm:text-sm text-white/80 font-semibold">
              {tab === 'client' ? '💰 100% Free for Clients — No hidden fees' : '⚡ Upgrade Your Freelance Career'}
            </span>
          </div>

          {/* Headline */}
          <h1 className={`
            text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-5 transition-all duration-700 delay-100
            ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            {tab === 'client' ? (
              <>
                Hire Top Freelancers
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  100% Free, Forever
                </span>
              </>
            ) : (
              <>
                Earn More.
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Level Up Your Career
                </span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className={`
            text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-8 leading-relaxed transition-all duration-700 delay-200
            ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            {tab === 'client'
              ? 'Post unlimited projects, hire the best talent, and pay nothing. Ever. Escrow-protected payments included.'
              : 'From free to elite — choose the plan that matches your ambition. More bids, more visibility, more earnings.'
            }
          </p>

          {/* Tab Switcher */}
          <div className={`
            flex justify-center mb-8 transition-all duration-700 delay-300
            ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1 flex gap-1 shadow-xl">
              {[
                { key: 'client', label: '👔 Hire Talent', sub: '100% Free' },
                { key: 'freelancer', label: '💻 Work as Freelancer', sub: 'Upgrade plans' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`
                    px-6 sm:px-8 py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer border-none flex flex-col items-center gap-0.5 min-w-[160px]
                    ${tab === t.key
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                    }
                  `}>
                  <span>{t.label}</span>
                  <span className={`text-[10px] font-medium ${tab === t.key ? 'text-blue-100' : 'text-white/40'}`}>{t.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Billing Toggle — Freelancer only */}
          {tab === 'freelancer' && (
            <div className={`
              flex justify-center mb-4 transition-all duration-700 delay-300
              ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-1 flex gap-1 shadow-lg">
                {[
                  { key: 'monthly', label: 'Monthly' },
                  { key: 'yearly', label: 'Yearly', badge: 'Save 33%' },
                ].map(b => (
                  <button
                    key={b.key}
                    onClick={() => setBilling(b.key)}
                    className={`
                      px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer border-none flex items-center gap-2
                      ${billing === b.key
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-white/60 hover:text-white'
                      }
                    `}>
                    {b.label}
                    {b.badge && billing === 'yearly' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {b.badge}
                      </span>
                    )}
                    {b.badge && billing === 'monthly' && (
                      <span className="text-[10px] font-medium text-gray-400">{b.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Client trust signals */}
          {tab === 'client' && (
            <div className={`
              flex flex-wrap justify-center gap-4 sm:gap-6 mt-2 transition-all duration-700 delay-300
              ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              {['✓ No credit card required', '✓ Escrow protected', '✓ Cancel anytime', '✓ 24/7 support'].map(t => (
                <span key={t} className="text-xs sm:text-sm text-white/50 font-medium">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60V0C240 40 480 60 720 40C960 20 1200 40 1440 0V60H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </div>

      {/* ══ MAIN CONTENT ═══════════════════════════════════════ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20">

        {/* Social Proof Counter */}
        <div ref={socialRef} className={`text-center mb-16 transition-all duration-700 ${socialInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Trusted by 50,000+ professionals worldwide</p>
          <SocialCounter inView={socialInView} />
        </div>

        {/* Section Header */}
        <div className="text-center mb-10">
          {tab === 'client' ? (
            <>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                Everything You Need to Hire
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent"> — 100% Free</span>
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">Choose the plan that fits your hiring needs. All client plans are permanently free — no trials, no hidden fees.</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
                Choose Your Path to
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent"> Higher Earnings</span>
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">More bids. Better ranking. Faster growth. Pick the plan that matches your ambition and start earning more today.</p>
            </>
          )}
        </div>

        {/* Plans Grid */}
        <div className="plans-grid mb-16">
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.name}
              plan={plan}
              billing={billing}
              onCTA={handleCTA}
              index={i}
              isFreelancer={tab === 'freelancer'}
            />
          ))}
        </div>

        {/* Comparison Table — Freelancer only */}
        {tab === 'freelancer' && (
          <div className="mb-16">
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Compare Plans Side by Side</h3>
              <p className="text-sm text-gray-500">See exactly what you get at every tier</p>
            </div>
            <ComparisonTable />
          </div>
        )}

        {/* Trust Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Built on Trust & Safety</h3>
            <p className="text-sm text-gray-500">Every transaction is protected by our escrow and dispute resolution system</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {TRUST_ITEMS.map((item, i) => (
              <TrustBadge key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Testimonials — Freelancer only */}
        {tab === 'freelancer' && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h3 className="text-xl font-extrabold text-gray-900 mb-1">Hear From Top Earners</h3>
              <p className="text-sm text-gray-500">Join thousands of freelancers who are already growing their careers</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <TestimonialCard key={t.name} t={t} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h3 className="text-xl font-extrabold text-gray-900 mb-1">Frequently Asked Questions</h3>
            <p className="text-sm text-gray-500">Everything you need to know before you start</p>
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
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 py-16 sm:py-24 px-4 relative overflow-hidden">
        {/* Glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.3) 0%,transparent 70%)' }} />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            {tab === 'client'
              ? <>Ready to Hire<br /><span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"> for Free?</span></>
              : <>Ready to Level Up<br /><span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent"> Your Career?</span></>
            }
          </h2>
          <p className="text-white/50 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            {tab === 'client'
              ? 'Join 50,000+ clients who\'ve hired top freelancers without paying a single rupee.'
              : 'Start free today — upgrade when you\'re ready to scale. No pressure, no hidden costs.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate(user ? (tab === 'client' ? '/browse-projects' : '/find-work') : '/register')}
              className="px-8 py-4 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer border-none
                bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105"
            >
              {tab === 'client' ? (user ? 'Browse Freelancers ↗' : 'Get Started Free ↗') : (user ? 'Find Work Now ↗' : 'Join Free ↗')}
            </button>
            <button
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-4 rounded-2xl font-bold text-sm border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              See How It Works
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-5 mt-8">
            {['No credit card required', 'Free forever for clients', 'Cancel anytime'].map(t => (
              <span key={t} className="text-xs text-white/40 font-medium">{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Checkout Modal */}
      <SubscriptionCheckout
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        planId={checkoutPlan}
        planType={checkoutPlanType}
      />
    </div>
  )
}

export default PricingPage
