// ===== FILE: client/src/pages/admin/AdminDashboard.jsx =====

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useDeferredValue,
  useRef,
  startTransition,
  createContext,
  useContext,
} from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import {
  getDashboardStats,
  getMonthlyAnalytics,
  refreshAdminDashboard,
  updatePlatformSettingsThunk,
  adminUpdateUser,
  adminDeleteUser,
  adminUpdateProject,
  adminUpdateBid,
  localUpdateUser,
  localDeleteUser,
  localUpdateBid,
  localUpdateProject,
  resetAdminState,
  updateMonthlyAnalytics,
  addPaymentToList,
} from "../../features/admin/adminSlice"
import AdminPayments from "../AdminPayments"
import { getSocket, initSocket } from "../../utils/socketManager"
import { toggleTheme } from "../../features/theme/themeSlice"

// ─── THEME ────────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    name: "dark",
    bg: "#0b0f1a",
    bgSub: "#0d1220",
    card: "#111827",
    border: "#1f2d42",
    navBg: "rgba(11,15,26,0.97)",
    text: "#e2e8f0",
    textSub: "#8899b4",
    textMuted: "#3d526b",
    inputBg: "#192032",
    inputBorder: "#2a3f5f",
    inputText: "#cbd5e1",
    selectBg: "#192032",
    rowHover: "rgba(30,41,59,0.6)",
    activeNav:
      "linear-gradient(135deg,rgba(99,102,241,0.28),rgba(167,139,250,0.14))",
    progressBg: "#1e293b",
    notifBg: "#111827",
    notifHover: "#1a2540",
    modalOverlay: "rgba(0,0,0,0.76)",
    cancelBtn: "#1e293b",
    cancelText: "#94a3b8",
    summaryRow: "rgba(30,41,59,0.45)",
    fraudRow: "rgba(249,115,22,0.07)",
    skillTag: "#1e293b",
  },
  light: {
    name: "light",
    bg: "#f0f4f9",
    bgSub: "#e4ecf5",
    card: "#ffffff",
    border: "#d5e0ed",
    navBg: "rgba(255,255,255,0.97)",
    text: "#0f172a",
    textSub: "#475569",
    textMuted: "#94a3b8",
    inputBg: "#f8fafc",
    inputBorder: "#dce6f0",
    inputText: "#1e293b",
    selectBg: "#f8fafc",
    rowHover: "rgba(226,232,240,0.65)",
    activeNav:
      "linear-gradient(135deg,rgba(99,102,241,0.11),rgba(167,139,250,0.07))",
    progressBg: "#e2e8f0",
    notifBg: "#ffffff",
    notifHover: "#f5f8fc",
    modalOverlay: "rgba(15,23,42,0.48)",
    cancelBtn: "#f1f5f9",
    cancelText: "#475569",
    summaryRow: "rgba(241,245,249,0.9)",
    fraudRow: "rgba(249,115,22,0.05)",
    skillTag: "#eef2f8",
  },
}
const ThemeCtx = createContext(THEMES.dark)

const DEFAULT_PLATFORM_TOGGLES = {
  "Maintenance Mode": false,
  "New Registrations": true,
  "Bid System": true,
  "Payment Gateway": true,
}

// ─── MONTHS (for chart labels) ────────────────────────────────────────────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const normalizeStatus = (status) => String(status || "").trim().toLowerCase()
const statusIs = (status, ...matches) => matches.map(normalizeStatus).includes(normalizeStatus(status))

const getEntityName = (entity, fallback = "—") => {
  if (!entity) return fallback
  if (typeof entity === "string") return entity
  return entity.name || entity.user?.name || entity.email || entity.user?.email || fallback
}

const getProjectOwnerName = (project) => getEntityName(project?.user || project?.client)
const getBidFreelancerName = (bid) => getEntityName(bid?.freelancer)
const getBidProjectTitle = (bid) => (
  typeof bid?.project === "object" ? bid.project?.title : bid?.project
) || "—"

const getPaymentAmount = (payment) => Number(payment?.totalAmount ?? payment?.amount ?? payment?.freelancerAmount ?? 0)
const getPaymentRevenue = (payment) => Number(payment?.platformFee ?? payment?.fee ?? 0)

const formatCompactMoney = (amount) => {
  const value = Number(amount || 0)
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${value.toLocaleString("en-IN")}`
}

const getGrowthPercent = (data = []) => {
  if (data.length < 2) return 0
  const current = Number(data[data.length - 1] || 0)
  const previous = Number(data[data.length - 2] || 0)
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// ══════════════════════════════════════════════════════════════════════════════
// SMALL UI COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ─── SPARKLINE ────────────────────────────────────────────────────────────────
function SparkLine({ data, color = "#6366f1", height = 40 }) {
  const safeData = Array.isArray(data) && data.length > 1 ? data : [0, 0]
  const max = Math.max(...safeData), min = Math.min(...safeData), range = max - min || 1
  const w = 260, h = height
  const pts = safeData.map((v, i) => `${(i / (safeData.length - 1)) * w},${h - ((v - min) / range) * (h - 6)}`).join(" ")
  const gid = `sg${color.replace(/[^a-z0-9]/gi, "")}${height}`
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── BAR CHART ───────────────────────────────────────────────────────────────
function BarChart({ data, labels, color = "#6366f1", height = 120 }) {
  const t = useContext(ThemeCtx)
  const safeData = Array.isArray(data) && data.length ? data : [0]
  const max = Math.max(...safeData) || 1
  return (
    <div className="flex items-end gap-0.5 w-full" style={{ height }}>
      {safeData.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-0.5 group relative">
          <div className="w-full rounded-t transition-all duration-500"
            style={{ height: `${(v / max) * (height - 20)}px`, background: color, opacity: 0.6 + (i / safeData.length) * 0.4 }}>
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs bg-slate-800 text-white px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">{v}</span>
          </div>
          <span style={{ color: t.textMuted, fontSize: 8 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
function Badge({ label }) {
  const map = {
    Active: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    Inactive: "bg-slate-400/20  text-slate-500  border-slate-400/30",
    Blocked: "bg-red-500/20    text-red-500    border-red-500/30",
    User: "bg-sky-500/20    text-sky-500    border-sky-500/30",
    Freelancer: "bg-violet-500/20 text-violet-500 border-violet-500/30",
    Admin: "bg-amber-500/20  text-amber-500  border-amber-500/30",
    Open: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    "In-Progress": "bg-blue-500/20   text-blue-500   border-blue-500/30",
    Completed: "bg-teal-500/20   text-teal-600   border-teal-500/30",
    Cancelled: "bg-red-500/20    text-red-500    border-red-500/30",
    Pending: "bg-amber-500/20  text-amber-500  border-amber-500/30",
    Accepted: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    Rejected: "bg-red-500/20    text-red-500    border-red-500/30",
    pending: "bg-amber-500/20  text-amber-500  border-amber-500/30",
    accepted: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
    rejected: "bg-red-500/20    text-red-500    border-red-500/30",
    "in-progress": "bg-blue-500/20   text-blue-500   border-blue-500/30",
    completed: "bg-teal-500/20   text-teal-600   border-teal-500/30",
    failed: "bg-red-500/20    text-red-500    border-red-500/30",
    escrow: "bg-blue-500/20   text-blue-500   border-blue-500/30",
    released: "bg-teal-500/20   text-teal-600   border-teal-500/30",
    Failed: "bg-red-500/20    text-red-500    border-red-500/30",
    fraud: "bg-orange-500/20 text-orange-500 border-orange-500/30",
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${map[label] || "bg-slate-400/20 text-slate-500 border-slate-400/30"}`}>
      {label}
    </span>
  )
}

// ─── HIGHLIGHT ────────────────────────────────────────────────────────────────
function Hl({ text, q }) {
  if (!q || !text) return <>{text}</>
  const s = String(text), ql = q.toLowerCase(), idx = s.toLowerCase().indexOf(ql)
  if (idx === -1) return <>{s}</>
  return <>{s.slice(0, idx)}<mark className="bg-yellow-300/70 text-inherit rounded-sm px-0.5">{s.slice(idx, idx + q.length)}</mark>{s.slice(idx + q.length)}</>
}

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
function ThemeToggle({ theme, toggle }) {
  const dark = theme === "dark"
  return (
    <button onClick={toggle}
      style={{ display: "flex", alignItems: "center", gap: 8, background: dark ? "#1e293b" : "#e8edf5", border: `1.5px solid ${dark ? "#334155" : "#c8d3e0"}`, color: dark ? "#e2e8f0" : "#1e293b", borderRadius: 12, padding: "5px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .25s", whiteSpace: "nowrap" }}>
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", width: 34, height: 18, borderRadius: 9, background: dark ? "#6366f1" : "#94a3b8", transition: "background .3s", flexShrink: 0 }}>
        <span style={{ position: "absolute", left: dark ? 17 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left .25s", boxShadow: "0 1px 4px rgba(0,0,0,.28)" }} />
      </span>
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  )
}

// ─── INLINE EDIT ─────────────────────────────────────────────────────────────
function InlineEdit({ value, onSave, type = "text", options }) {
  const t = useContext(ThemeCtx)
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const inp = { background: t.inputBg, color: t.inputText, border: `1px solid ${t.inputBorder}`, borderRadius: 6, padding: "2px 7px", fontSize: 12, width: 100, outline: "none" }
  const saveSt = { background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, padding: "2px 8px", fontSize: 12, cursor: "pointer", fontWeight: 600 }
  const canSt = { background: t.cancelBtn, color: t.cancelText, border: "none", borderRadius: 6, padding: "2px 8px", fontSize: 12, cursor: "pointer" }
  if (!editing)
    return <span onClick={() => { setVal(value); setEditing(true) }} style={{ cursor: "pointer", color: t.text, borderBottom: `1px dashed ${t.textMuted}` }}>{value ?? "—"}</span>
  if (options)
    return (
      <span className="inline-flex gap-1 items-center flex-wrap">
        <select value={val} onChange={e => setVal(e.target.value)} style={{ ...inp, width: "auto" }}>{options.map(o => <option key={o}>{o}</option>)}</select>
        <button style={saveSt} onClick={() => { onSave(val); setEditing(false) }}>✓</button>
        <button style={canSt} onClick={() => setEditing(false)}>✕</button>
      </span>
    )
  return (
    <span className="inline-flex gap-1 items-center flex-wrap">
      <input type={type} value={val} onChange={e => setVal(e.target.value)} style={inp} />
      <button style={saveSt} onClick={() => { onSave(val); setEditing(false) }}>✓</button>
      <button style={canSt} onClick={() => setEditing(false)}>✕</button>
    </span>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
function Card({ children, style = {}, className = "" }) {
  const t = useContext(ThemeCtx)
  return <div className={`rounded-2xl p-5 ${className}`} style={{ background: t.card, border: `1px solid ${t.border}`, ...style }}>{children}</div>
}

// ─── BTN ──────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, color = "indigo", size = "sm", disabled = false }) {
  const C = { indigo: ["rgba(99,102,241,.13)", "#6366f1", "rgba(99,102,241,.28)"], green: ["rgba(16,185,129,.13)", "#10b981", "rgba(16,185,129,.28)"], red: ["rgba(239,68,68,.13)", "#ef4444", "rgba(239,68,68,.28)"], amber: ["rgba(245,158,11,.13)", "#f59e0b", "rgba(245,158,11,.28)"], orange: ["rgba(249,115,22,.13)", "#f97316", "rgba(249,115,22,.28)"], rose: ["rgba(244,63,94,.13)", "#f43f5e", "rgba(244,63,94,.28)"] }
  const [bg, text, bdr] = C[color] || C.indigo
  const pad = size === "xs" ? "2px 8px" : size === "sm" ? "4px 11px" : "7px 18px"
  const fs = size === "xs" ? 10 : size === "sm" ? 11 : 13
  return <button onClick={onClick} disabled={disabled} style={{ background: disabled ? "#374151" : bg, color: disabled ? "#6b7280" : text, border: `1px solid ${disabled ? "#374151" : bdr}`, borderRadius: 8, padding: pad, fontSize: fs, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, transition: "all .2s", opacity: disabled ? .6 : 1 }}>{children}</button>
}

// ─── TABLE HELPERS ────────────────────────────────────────────────────────────
function TH({ children, onClick }) {
  const t = useContext(ThemeCtx)
  return <th onClick={onClick} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${onClick ? "cursor-pointer select-none" : ""}`} style={{ color: t.textMuted, borderBottom: `1px solid ${t.border}` }}>{children}</th>
}
function TD({ children, className = "" }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>
}
function TR({ children, fraud = false }) {
  const t = useContext(ThemeCtx)
  const [hov, setHov] = useState(false)
  return <tr style={{ borderBottom: `1px solid ${t.border}`, background: hov ? t.rowHover : fraud ? t.fraudRow : "transparent", transition: "background .15s" }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</tr>
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function Skeleton({ rows = 5 }) {
  const t = useContext(ThemeCtx)
  return <div className="space-y-2 p-4">{Array.from({ length: rows }).map((_, i) => <div key={i} className="h-10 rounded-xl animate-pulse" style={{ background: t.inputBg, opacity: .7 - i * .1 }} />)}</div>
}

// ─── EMPTY ────────────────────────────────────────────────────────────────────
function Empty({ icon = "📭", label = "No data" }) {
  const t = useContext(ThemeCtx)
  return <div className="flex flex-col items-center py-14 gap-2"><span className="text-5xl opacity-25">{icon}</span><p className="text-sm" style={{ color: t.textMuted }}>{label}</p></div>
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ title, body, onConfirm, onClose }) {
  const t = useContext(ThemeCtx)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: t.modalOverlay }}>
      <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
        <h3 className="text-lg font-bold mb-3" style={{ color: t.text }}>{title}</h3>
        <p className="text-sm mb-5" style={{ color: t.textSub }}>{body}</p>
        <div className="flex gap-3 justify-end">
          <Btn onClick={onClose} color="indigo">Cancel</Btn>
          <Btn onClick={() => { onConfirm(); onClose() }} color="red">Confirm</Btn>
        </div>
      </div>
    </div>
  )
}

// ─── TX DETAIL MODAL ──────────────────────────────────────────────────────────
function TxModal({ tx, onClose }) {
  const t = useContext(ThemeCtx)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: t.modalOverlay }}>
      <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg" style={{ color: t.text }}>Transaction Detail</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        {[["ID", tx.txId], ["User", tx.user], ["Amount", `₹${tx.amount?.toLocaleString()}`], ["Method", tx.method], ["Date", tx.date], ["Status", tx.status]].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 border-b" style={{ borderColor: t.border }}>
            <span className="text-sm" style={{ color: t.textSub }}>{k}</span>
            <span className="text-sm font-semibold" style={{ color: t.text }}>{v}</span>
          </div>
        ))}
        <div className="mt-4 flex justify-end"><Btn onClick={onClose} color="indigo">Close</Btn></div>
      </div>
    </div>
  )
}

// ─── ADD USER MODAL ───────────────────────────────────────────────────────────
function AddUserModal({ onClose, onAdd }) {
  const t = useContext(ThemeCtx)
  const [form, setForm] = useState({ name: "", email: "", credits: 0, isFreelancer: false, status: "Active" })
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inp = { background: t.inputBg, color: t.inputText, border: `1px solid ${t.inputBorder}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, width: "100%", outline: "none", boxSizing: "border-box" }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: t.modalOverlay }}>
      <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl" style={{ background: t.card, border: `1px solid ${t.border}` }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg" style={{ color: t.text }}>Add New User</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>
        <div className="space-y-3">
          {[["Name", "name", "text"], ["Email", "email", "email"], ["Credits", "credits", "number"]].map(([label, key, type]) => (
            <div key={key}>
              <label className="text-xs font-semibold mb-1 block" style={{ color: t.textSub }}>{label}</label>
              <input type={type} value={form[key]} onChange={e => upd(key, type === "number" ? Number(e.target.value) : e.target.value)} style={inp} />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: t.textSub }}>Role</label>
            <select value={form.isFreelancer ? "Freelancer" : "User"} onChange={e => upd("isFreelancer", e.target.value === "Freelancer")} style={inp}>
              <option>User</option><option>Freelancer</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <Btn onClick={onClose} color="indigo">Cancel</Btn>
          <Btn onClick={() => { if (form.name && form.email) { onAdd({ ...form, _id: `local_${Date.now()}`, fraudFlag: false, notes: "", skills: [], completedProjects: 0, previousProjects: 0, totalBids: 0, acceptedBids: 0, activeProjects: 0, experience: "N/A" }); onClose() } }} color="green">Add User</Btn>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
const AdminDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // ── Redux state ────────────────────────────────────────────────────────────
  const { user } = useSelector(s => s.auth)
  const appTheme = useSelector(s => s.theme?.mode || "light")
  const { users, projects, bids, stats, monthlyAnalytics, recentPayments, platformSettings, adminLoading, adminError, adminErrorMessage } = useSelector(s => s.admin)

  // ── Theme ──────────────────────────────────────────────────────────────────
  const themeName = appTheme === "dark" ? "dark" : "light"
  const t = THEMES[themeName]

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [section, setSection] = useState("dashboard")
  const payments = useMemo(() => (recentPayments && recentPayments.length > 0 ? recentPayments : []), [recentPayments])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortCfg, setSortCfg] = useState({ key: "name", dir: "asc" })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showNotif, setShowNotif] = useState(false)
  const [confirmModal, setConfirmModal] = useState(null)
  const [txModal, setTxModal] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [activity, setActivity] = useState([
    { id: 1, msg: "Admin session started", time: "Just now", type: "info" },
    { id: 2, msg: "Dashboard data loaded", time: "Just now", type: "success" },
  ])
  const refreshTimerRef = useRef(null)

  // ── Helpers ────────────────────────────────────────────────────────────────
  const pushActivity = useCallback((msg, type = "info") => {
    setActivity(prev => [{ id: Date.now(), msg, time: "Just now", type }, ...prev.slice(0, 29)])
  }, [setActivity])

  const refreshAdminData = useCallback(() => {
    dispatch(refreshAdminDashboard())
  }, [dispatch])

  const scheduleAdminRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
    }

    refreshTimerRef.current = window.setTimeout(() => {
      refreshAdminData()
      refreshTimerRef.current = null
    }, 250)
  }, [refreshAdminData])

  const changeSection = useCallback((nextSection) => {
    startTransition(() => setSection(nextSection))
  }, [])

  // ── Platform toggles (must be top-level — never inside .map()) ────────────
  const [platformToggleOverrides, setPlatformToggleOverrides] = useState({})
  const platformToggles = useMemo(() => ({
    ...DEFAULT_PLATFORM_TOGGLES,
    ...(platformSettings ? {
      "Maintenance Mode": Boolean(platformSettings.maintenanceMode?.enabled),
      "New Registrations": platformSettings.registrations?.enabled !== false,
      "Bid System": platformSettings.bidSystem?.enabled !== false,
      "Payment Gateway": platformSettings.paymentGateway?.enabled !== false,
    } : {}),
    ...platformToggleOverrides,
  }), [platformSettings, platformToggleOverrides])
  const togglePlatform = (label) => {
    const next = !platformToggles[label]
    toast.success(`${label} ${next ? "enabled" : "disabled"}`)

    const settingMap = {
      "Maintenance Mode": { maintenanceMode: { enabled: next } },
      "New Registrations": { registrations: { enabled: next } },
      "Bid System": { bidSystem: { enabled: next } },
      "Payment Gateway": { paymentGateway: { enabled: next } },
    }

    const updateData = settingMap[label]
    if (updateData) {
      dispatch(updatePlatformSettingsThunk(updateData))
    }

    setPlatformToggleOverrides(prev => ({ ...prev, [label]: next }))
  }

  // ── Auth guard (stable deps — no navigate in deps) ─────────────────────────
  useEffect(() => {
    if (!user || !user.isAdmin) navigate("/")
  }, [navigate, user])

  // ── Fetch all data once on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.isAdmin) return
    refreshAdminData()

    // ─ Join admin dashboard room for real-time updates
    const activeSocket = getSocket() || initSocket(user.token)
    activeSocket?.emit("join_dashboard")

    return () => {
      activeSocket?.emit("leave_dashboard")
    }
  }, [refreshAdminData, user?.isAdmin, user?.token])

  // ── Listen for real-time dashboard updates via Socket.IO ──────────────────
  useEffect(() => {
    if (!user?.isAdmin) return

    const activeSocket = getSocket() || initSocket(user.token)
    if (!activeSocket) return

    const handleMonthlyAnalyticsUpdate = (data) => {
      dispatch(updateMonthlyAnalytics(data))
      pushActivity("Monthly analytics updated", "info")
    }

    const handlePaymentUpdate = (data) => {
      const payment = data?.payment || data
      if (payment?._id) {
        dispatch(addPaymentToList(payment))
      }
      dispatch(getDashboardStats())
      dispatch(getMonthlyAnalytics())
      pushActivity(`Payment updated: ₹${getPaymentAmount(payment).toLocaleString("en-IN")}`, "success")
    }

    const handleStatsUpdate = (data) => {
      dispatch({ type: "admin/getStats/fulfilled", payload: data })
      pushActivity("Dashboard stats updated", "info")
    }

    const handleAdminDataChanged = (data) => {
      scheduleAdminRefresh()
      pushActivity(data?.message || `Platform data changed${data?.type ? `: ${data.type}` : ""}`, "info")
    }

    activeSocket.on("monthly_analytics_updated", handleMonthlyAnalyticsUpdate)
    activeSocket.on("payment_updated", handlePaymentUpdate)
    activeSocket.on("dashboard_stats_updated", handleStatsUpdate)
    activeSocket.on("admin_data_changed", handleAdminDataChanged)

    return () => {
      activeSocket.off("monthly_analytics_updated", handleMonthlyAnalyticsUpdate)
      activeSocket.off("payment_updated", handlePaymentUpdate)
      activeSocket.off("dashboard_stats_updated", handleStatsUpdate)
      activeSocket.off("admin_data_changed", handleAdminDataChanged)
    }
  }, [dispatch, pushActivity, scheduleAdminRefresh, user?.isAdmin, user?.token])

  // Socket events are best-effort; this keeps admin numbers current even when
  // a backend path has not yet been wired to emit a dashboard event.
  useEffect(() => {
    if (!user?.isAdmin) return
    const intervalId = window.setInterval(refreshAdminData, 30000)
    return () => window.clearInterval(intervalId)
  }, [refreshAdminData, user?.isAdmin])

  useEffect(() => () => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current)
    }
  }, [])

  // ── Show error toasts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (adminError && adminErrorMessage) {
      toast.error(adminErrorMessage)
      dispatch(resetAdminState())
    }
  }, [adminError, adminErrorMessage, dispatch])

  const exportJSON = (data, name) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `${name}-${Date.now()}.json`; a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported ${name}.json`)
  }

  // ── Sort helpers ───────────────────────────────────────────────────────────
  const toggleSort = key => setSortCfg(p => ({ key, dir: p.key === key && p.dir === "asc" ? "desc" : "asc" }))
  const sortArr = useCallback(arr => [...arr].sort((a, b) => {
    const mod = sortCfg.dir === "asc" ? 1 : -1
    const av = a[sortCfg.key], bv = b[sortCfg.key]
    if (typeof av === "string") return (av || "").localeCompare(bv || "") * mod
    return ((av || 0) - (bv || 0)) * mod
  }), [sortCfg])
  const getSortIcon = col => sortCfg.key === col ? (sortCfg.dir === "asc" ? "↑" : "↓") : "↕"

  // ── Computed ───────────────────────────────────────────────────────────────
  const deferredSearch = useDeferredValue(search)
  const q = useMemo(() => deferredSearch.trim().toLowerCase(), [deferredSearch])
  const freelancers = useMemo(() => users.filter(u => u.isFreelancer), [users])
  const topFreelancers = useMemo(
    () => [...freelancers].sort((a, b) => (b.completedProjects || 0) - (a.completedProjects || 0)).slice(0, 5),
    [freelancers]
  )
  const totalRevenue = useMemo(() => (
    stats?.totalRevenue ?? payments
      .filter(p => statusIs(p.status, "escrow", "released", "completed"))
      .reduce((s, p) => s + getPaymentRevenue(p), 0)
  ), [payments, stats?.totalRevenue])
  const totalCredits = useMemo(
    () => stats?.totalCredits ?? users.reduce((s, u) => s + (u.credits || 0), 0),
    [stats?.totalCredits, users]
  )
  const fraudUsers = useMemo(() => users.filter(u => u.fraudFlag), [users])
  const fraudBids = useMemo(() => bids.filter(b => b.fraudFlag), [bids])
  const acceptedBidsCount = useMemo(() => bids.filter(b => statusIs(b.status, "accepted")).length, [bids])
  const rejectedBidsCount = useMemo(() => bids.filter(b => statusIs(b.status, "rejected")).length, [bids])
  const completedProjectsCount = useMemo(() => projects.filter(p => statusIs(p.status, "completed")).length, [projects])
  const successfulPaymentsCount = useMemo(
    () => stats?.successfulPayments ?? payments.filter(p => statusIs(p.status, "released", "completed")).length,
    [payments, stats?.successfulPayments]
  )
  const totalPaymentsCount = stats?.totalPayments ?? payments.length
  const monthlyBids = monthlyAnalytics?.bids || []
  const monthlyRevenue = monthlyAnalytics?.revenue || []
  const monthlyUsers = monthlyAnalytics?.userGrowth || []
  const monthlyFreelancers = monthlyAnalytics?.freelancers || []
  const monthlyProjects = monthlyAnalytics?.projects || []

  const filteredUsers = useMemo(() => sortArr(users).filter(u => {
    const mq = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u._id?.includes(q)
    const mr = roleFilter === "All" || (roleFilter === "Freelancer" && u.isFreelancer) || (roleFilter === "User" && !u.isFreelancer && !u.isAdmin) || (roleFilter === "Admin" && u.isAdmin)
    const ms = statusFilter === "All" || (u.status || "Active") === statusFilter
    return mq && mr && ms
  }), [q, roleFilter, sortArr, statusFilter, users])
  const visibleUsers = useMemo(
    () => section === "freelancers" ? filteredUsers.filter(u => u.isFreelancer) : filteredUsers,
    [filteredUsers, section]
  )
  const filteredProjects = useMemo(() => sortArr(projects).filter(p => {
    const mq = !q || p.title?.toLowerCase().includes(q) || getProjectOwnerName(p).toLowerCase().includes(q)
    const ms = statusFilter === "All" || statusIs(p.status, statusFilter)
    return mq && ms
  }), [projects, q, sortArr, statusFilter])
  const filteredBids = useMemo(() => sortArr(bids).filter(b => {
    const fl = getBidFreelancerName(b)
    const pr = getBidProjectTitle(b)
    const mq = !q || fl.toLowerCase().includes(q) || pr.toLowerCase().includes(q)
    const ms = statusFilter === "All" || statusIs(b.status, statusFilter)
    return mq && ms
  }), [bids, q, sortArr, statusFilter])
  const highValueProjects = useMemo(() => projects.filter(p => p.budget >= 25000), [projects])
  // ── Admin actions ──────────────────────────────────────────────────────────
  const doUpdateUser = (uid, data) => {
    dispatch(localUpdateUser({ uid, data }))
    dispatch(adminUpdateUser({ uid, data }))
      .unwrap()
      .then(() => { toast.success("User updated"); pushActivity(`User field updated`, "success") })
      .catch(() => { })
  }
  const doDeleteUser = uid => {
    const u = users.find(x => x._id === uid)
    dispatch(localDeleteUser(uid))
    dispatch(adminDeleteUser(uid))
      .unwrap()
      .then(() => { toast.success(`${u?.name} deleted`); pushActivity(`Deleted user ${u?.name}`, "warn") })
      .catch(() => { })
  }
  const doUpdateProject = (pid, data) => {
    dispatch(localUpdateProject({ pid, data }))
    dispatch(adminUpdateProject({ pid, data }))
      .unwrap()
      .then(() => { toast.success("Project updated"); pushActivity(`Project status updated`, "info") })
      .catch(() => { })
  }
  const doUpdateBid = (bid_id, data) => {
    dispatch(localUpdateBid({ bid_id, data }))
    dispatch(adminUpdateBid({ bid_id, data }))
      .unwrap()
      .then(() => { toast.success(`Bid ${data.status || "updated"}`); pushActivity(`Bid ${data.status || "updated"}`, statusIs(data.status, "accepted") ? "success" : "warn") })
      .catch(() => { })
  }
  // ── Selects style ──────────────────────────────────────────────────────────
  const SEL = { background: t.selectBg, border: `1px solid ${t.inputBorder}`, color: t.text, borderRadius: 10, padding: "6px 12px", fontSize: 13, outline: "none", cursor: "pointer" }

  // ── NAV ────────────────────────────────────────────────────────────────────
  const NAV = [
    { id: "dashboard", icon: "◉", label: "Dashboard" },
    { id: "users", icon: "👥", label: "Users" },
    { id: "freelancers", icon: "🧑‍💻", label: "Freelancers" },
    { id: "projects", icon: "💼", label: "Projects" },
    { id: "bids", icon: "🏷️", label: "Bids" },
    { id: "payments", icon: "💳", label: "Payments" },
    { id: "analytics", icon: "📈", label: "Analytics" },
    { id: "fraud", icon: "🚨", label: "Fraud" },
    { id: "control", icon: "⚙️", label: "Control" },
    { id: "activity", icon: "📋", label: "Activity" },
  ]

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <ThemeCtx.Provider value={t}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: t.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: t.text, transition: "background .3s,color .3s" }}>

        {/* MODALS */}
        {confirmModal && <ConfirmModal {...confirmModal} onClose={() => setConfirmModal(null)} />}
        {txModal && <TxModal tx={txModal} onClose={() => setTxModal(null)} />}
        {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onAdd={u => { setActivity(p => [{ id: Date.now(), msg: `Added user ${u.name}`, time: "Just now", type: "success" }, ...p]); toast.success("User added locally") }} />}

        {/* ── NAVBAR ── */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3" style={{ background: t.navBg, backdropFilter: "blur(14px)", borderBottom: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(s => !s)} style={{ color: t.textSub, background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 }}>☰</button>
            <span className="font-bold text-lg tracking-tight" style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>FreelanceHub</span>
            <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: t.inputBg, color: "#6366f1", border: "1px solid rgba(99,102,241,.3)" }}>ADMIN</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="relative hidden lg:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: t.textMuted }}>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search everything…" className="rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none w-56" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.inputText }} />
              {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer" }}>✕</button>}
            </div>
            <ThemeToggle theme={themeName} toggle={() => dispatch(toggleTheme())} />
            <div className="relative">
              <button onClick={() => setShowNotif(s => !s)} className="relative p-2 rounded-xl" style={{ background: t.inputBg, border: `1px solid ${t.inputBorder}`, color: t.textSub, cursor: "pointer" }}>
                🔔<span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center" style={{ fontSize: 9 }}>{activity.length}</span>
              </button>
              {showNotif && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl shadow-2xl overflow-hidden z-50" style={{ background: t.notifBg, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center justify-between px-4 py-3 font-semibold text-sm" style={{ color: t.text, borderBottom: `1px solid ${t.border}` }}>
                    Activity Log <button onClick={() => setShowNotif(false)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer" }}>✕</button>
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {activity.slice(0, 8).map(a => (
                      <div key={a.id} className="px-4 py-3" style={{ borderBottom: `1px solid ${t.border}` }}
                        onMouseEnter={e => e.currentTarget.style.background = t.notifHover}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div className="flex items-start gap-2">
                          <span>{a.type === "error" ? "🔴" : a.type === "warn" ? "🟡" : a.type === "success" ? "🟢" : "🔵"}</span>
                          <div><p className="text-xs" style={{ color: t.text }}>{a.msg}</p><p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{a.time}</p></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}>{user?.name?.[0] || "A"}</div>
          </div>
        </header>

        <div className="flex flex-1">
          {/* ── SIDEBAR ── */}
          <aside style={{ width: sidebarOpen ? 218 : 56, transition: "width .3s", flexShrink: 0, position: "sticky", top: 56, height: "calc(100vh - 3.5rem)", display: "flex", flexDirection: "column", background: t.bgSub, borderRight: `1px solid ${t.border}`, paddingTop: 8, overflowX: "hidden", overflowY: "auto" }}>
            {NAV.map(n => {
              const active = section === n.id
              return (
                <button key={n.id} onClick={() => changeSection(n.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", margin: "2px 8px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", transition: "all .18s", textAlign: "left", background: active ? t.activeNav : "transparent", color: active ? "#6366f1" : t.textSub, borderLeft: active ? "3px solid #6366f1" : "3px solid transparent" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.rowHover }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
                  {sidebarOpen && <span>{n.label}</span>}
                </button>
              )
            })}
          </aside>

          {/* ── MAIN ── */}
          <main className="flex-1 p-4 md:p-6 overflow-auto">

            {/* ════ DASHBOARD ════ */}
            {section === "dashboard" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: t.text }}>Overview</h1>
                    <p className="text-sm" style={{ color: t.textSub }}>Welcome, {user?.name || "Admin"} — real-time platform metrics</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Btn onClick={() => { refreshAdminData(); toast.info("Data refreshed") }} color="indigo">↻ Refresh</Btn>
                    <Btn onClick={() => exportJSON({ users, projects, bids }, "full-backup")} color="amber">💾 Backup</Btn>
                  </div>
                </div>

                {/* KPI CARDS */}
                {adminLoading && !users.length ? <Skeleton rows={2} /> : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    {[
                      { label: "Total Users", value: stats?.totalUsers ?? users.length, icon: "👥", color: "#6366f1", data: monthlyUsers },
                      { label: "Freelancers", value: stats?.totalFreelancers ?? freelancers.length, icon: "🧑‍💻", color: "#a78bfa", data: monthlyFreelancers },
                      { label: "Projects", value: stats?.totalProjects ?? projects.length, icon: "💼", color: "#38bdf8", data: monthlyProjects },
                      { label: "Total Bids", value: stats?.totalBids ?? bids.length, icon: "🏷️", color: "#34d399", data: monthlyBids },
                      { label: "Revenue", value: formatCompactMoney(totalRevenue), icon: "💰", color: "#f59e0b", data: monthlyRevenue.map(v => Math.round(v / 1000)) },
                      { label: "Credits", value: totalCredits.toLocaleString("en-IN"), icon: "⚡", color: "#f472b6", data: monthlyUsers },
                    ].map(c => (
                      <div key={c.label} className="rounded-2xl p-4 transition-all hover:scale-[1.02]" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: t.textSub }}>{c.label}</span>
                          <span className="text-xl">{c.icon}</span>
                        </div>
                        <div className="text-2xl font-bold mb-1" style={{ color: t.text }}>{c.value}</div>
                        <SparkLine data={c.data} color={c.color} height={36} />
                      </div>
                    ))}
                  </div>
                )}

                {/* CHARTS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {monthlyAnalytics ? [
                    { title: "Bids / Month", data: monthlyBids, color: "#6366f1" },
                    { title: "Revenue (₹K)", data: monthlyRevenue.map(v => Math.round(v / 1000)), color: "#f59e0b" },
                    { title: "User Growth", data: monthlyUsers, color: "#34d399" }
                  ].map(c => (
                    <div key={c.title} className="rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                      <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>{c.title}</h3>
                      <BarChart data={c.data.length > 0 ? c.data : [0]} labels={monthlyAnalytics.months || MONTHS} color={c.color} height={128} />
                    </div>
                  )).slice(0, 3) : (
                    <div style={{ color: t.textMuted }}>Loading analytics...</div>
                  )}
                </div>

                {/* BOTTOM ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>🏆 Top Freelancers</h3>
                    {topFreelancers.map((f, i) => (
                      <div key={f._id} className="flex items-center gap-3 mb-3 p-2 rounded-xl" style={{ background: t.summaryRow }}>
                        <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: ["#f59e0b", "#94a3b8", "#b45309", "#6366f1"][i] + "22", color: ["#f59e0b", "#94a3b8", "#b45309", "#6366f1"][i] || "#6366f1" }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: t.text }}>{f.name}</p>
                          <p className="text-xs" style={{ color: t.textMuted }}>{f.completedProjects || 0} done · ₹{f.credits || 0}</p>
                        </div>
                        {f.fraudFlag && <Badge label="fraud" />}
                      </div>
                    ))}
                    {!freelancers.length && <Empty icon="🧑‍💻" label="No freelancers yet" />}
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>📊 Platform Health</h3>
                    {[
                      { label: "Bid Accept Rate", val: Math.round(acceptedBidsCount / Math.max(bids.length, 1) * 100), color: "#6366f1" },
                      { label: "Project Success", val: Math.round(completedProjectsCount / Math.max(projects.length, 1) * 100), color: "#34d399" },
                      { label: "Payment Success", val: Math.round(successfulPaymentsCount / Math.max(totalPaymentsCount, 1) * 100), color: "#f59e0b" },
                      { label: "Fraud Rate", val: Math.round(fraudUsers.length / Math.max(users.length, 1) * 100), color: "#f87171" },
                    ].map(m => (
                      <div key={m.label} className="mb-3">
                        <div className="flex justify-between text-xs mb-1"><span style={{ color: t.textSub }}>{m.label}</span><span style={{ color: t.text, fontWeight: 700 }}>{m.val}%</span></div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: t.progressBg }}><div className="h-full rounded-full transition-all duration-700" style={{ width: `${m.val}%`, background: m.color }} /></div>
                      </div>
                    ))}
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold mb-3" style={{ color: t.text }}>🚨 Alerts ({fraudUsers.length + fraudBids.length})</h3>
                    {fraudUsers.map(u => (
                      <div key={u._id} className="flex items-center gap-2 mb-2 p-2 rounded-lg" style={{ background: "rgba(249,115,22,.09)", border: "1px solid rgba(249,115,22,.22)" }}>
                        <span style={{ color: "#f97316" }}>⚠</span>
                        <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate" style={{ color: t.text }}>{u.name}</p><p className="text-xs" style={{ color: t.textMuted }}>Fraud flag</p></div>
                        <Btn onClick={() => doUpdateUser(u._id, { status: "Blocked" })} color="red" size="xs">Block</Btn>
                      </div>
                    ))}
                    {!fraudUsers.length && !fraudBids.length && <p className="text-xs" style={{ color: t.textMuted }}>No active fraud alerts 🎉</p>}
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: t.textMuted }}>💎 High-Value Projects</p>
                      {highValueProjects.map(p => (
                        <p key={p._id} className="text-xs mb-1" style={{ color: t.textSub }}>· {p.title} <span style={{ color: "#f59e0b", fontWeight: 700 }}>₹{p.budget?.toLocaleString()}</span></p>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* ════ USERS / FREELANCERS ════ */}
            {(section === "users" || section === "freelancers") && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: t.text }}>{section === "users" ? "All Users" : "Freelancers"}</h1>
                    <p className="text-sm" style={{ color: t.textSub }}>{visibleUsers.length} records</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: t.textMuted }}>🔍</span>
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="focus:outline-none" style={{ ...SEL, paddingLeft: 26 }} />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={SEL}><option value="All">All Roles</option><option>User</option><option>Freelancer</option><option>Admin</option></select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SEL}><option value="All">All Status</option><option>Active</option><option>Inactive</option><option>Blocked</option></select>
                    <Btn onClick={() => setShowAddUser(true)} color="green">+ Add</Btn>
                    <Btn onClick={() => exportJSON(users, "users")} color="indigo">↓ Export</Btn>
                  </div>
                </div>

                {adminLoading ? <Skeleton /> : (
                  <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <TH onClick={() => toggleSort("name")}>Name / Email <span className="ml-1 opacity-60">{getSortIcon("name")}</span></TH>
                            <TH>Role</TH>
                            <TH>Skills</TH>
                            <TH onClick={() => toggleSort("completedProjects")}>Projects <span className="ml-1 opacity-60">{getSortIcon("completedProjects")}</span></TH>
                            <TH onClick={() => toggleSort("totalBids")}>Bids <span className="ml-1 opacity-60">{getSortIcon("totalBids")}</span></TH>
                            <TH onClick={() => toggleSort("credits")}>Credits <span className="ml-1 opacity-60">{getSortIcon("credits")}</span></TH>
                            <TH>Status</TH>
                            <TH>Actions</TH>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleUsers.length === 0
                            ? <tr><td colSpan={8}><Empty icon="👤" label="No users match filters" /></td></tr>
                            : visibleUsers.map(u => {
                              const profile = u.profile || {}
                              const skills = u.skills?.length ? u.skills : profile.skills?.length ? profile.skills : []
                              const done = u.completedProjects != null ? u.completedProjects : profile.completedProjects ?? 0
                              const active = u.activeProjects != null ? u.activeProjects : 0
                              const totalBids = u.totalBids ?? 0
                              const acceptedBids = u.acceptedBids ?? 0
                              const rejectedBids = u.rejectedBids ?? 0
                              return (
                                <TR key={u._id} fraud={!!u.fraudFlag}>
                                  <TD>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}>{u.name?.[0]}</div>
                                      <div>
                                        <div className="font-medium flex items-center gap-1" style={{ color: t.text }}>
                                          <InlineEdit value={u.name} onSave={v => doUpdateUser(u._id, { name: v })} />
                                          {u.fraudFlag && <span style={{ color: "#f97316", fontSize: 11 }}>⚠</span>}
                                          {u.isAdmin && <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500">Admin</span>}
                                        </div>
                                        <div className="text-xs" style={{ color: t.textMuted }}>
                                          <InlineEdit value={u.email} onSave={v => doUpdateUser(u._id, { email: v })} />
                                        </div>
                                      </div>
                                    </div>
                                  </TD>
                                  <TD><Badge label={u.isAdmin ? "Admin" : u.isFreelancer ? "Freelancer" : "User"} /></TD>
                                  <TD className="max-w-[140px]">
                                    {skills.length > 0
                                      ? <div className="flex flex-wrap gap-1">{skills.map(s => <span key={s} className="px-1.5 py-0.5 rounded-md text-xs" style={{ background: t.skillTag, color: t.textSub, border: `1px solid ${t.border}` }}>{s}</span>)}</div>
                                      : <span style={{ color: t.textMuted, fontSize: 11 }}>—</span>}
                                  </TD>
                                  <TD className="text-xs whitespace-nowrap" style={{ color: t.textSub }}>
                                    Done: <span style={{ color: t.text }}>{done}</span><br />Active: <span style={{ color: "#6366f1" }}>{active}</span>
                                  </TD>
                                  <TD className="text-xs whitespace-nowrap" style={{ color: t.textSub }}>
                                    Total: <span style={{ color: t.text }}>{totalBids}</span><br />✓{acceptedBids} ✗{rejectedBids}
                                  </TD>
                                  <TD><InlineEdit value={u.credits ?? 0} onSave={v => doUpdateUser(u._id, { credits: Number(v) })} type="number" /></TD>
                                  <TD>
                                    <InlineEdit value={u.status || "Active"} onSave={v => doUpdateUser(u._id, { status: v })} options={["Active", "Inactive", "Blocked"]} />
                                  </TD>
                                  <TD>
                                    <div className="flex gap-1 flex-wrap">
                                      <Btn onClick={() => doUpdateUser(u._id, { status: u.status === "Active" ? "Blocked" : "Active" })} color={u.status === "Active" ? "red" : "green"} size="xs">{u.status === "Active" ? "Block" : "Unblock"}</Btn>
                                      <Btn onClick={() => doUpdateUser(u._id, { isFreelancer: !u.isFreelancer })} color="amber" size="xs">{u.isFreelancer ? "→User" : "→FL"}</Btn>
                                      <Btn onClick={() => setConfirmModal({ title: "Delete User", body: `Delete ${u.name} permanently?`, onConfirm: () => doDeleteUser(u._id) })} color="red" size="xs">Del</Btn>
                                      <Btn onClick={() => { const n = window.prompt("Admin note:", u.notes || ""); if (n !== null) doUpdateUser(u._id, { notes: n }) }} color="orange" size="xs">Note</Btn>
                                    </div>
                                    {u.notes && <p className="text-xs mt-1 italic" style={{ color: t.textMuted }}>📌 {u.notes}</p>}
                                  </TD>
                                </TR>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                    <p className="px-4 py-2 text-xs text-right" style={{ color: t.textMuted }}>
                      Showing {visibleUsers.length} of {users.length}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ════ PROJECTS ════ */}
            {section === "projects" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: t.text }}>Projects</h1>
                    <p className="text-sm" style={{ color: t.textSub }}>{filteredProjects.length} projects</p>
                  </div>
                  <div className="flex gap-2">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SEL}><option value="All">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="rejected">Rejected</option></select>
                    <Btn onClick={() => exportJSON(projects, "projects")} color="indigo">↓ Export</Btn>
                  </div>
                </div>
                {adminLoading ? <Skeleton rows={3} /> : filteredProjects.length === 0 ? <Empty icon="💼" label="No projects" /> : (
                  <div className="grid gap-4">
                    {filteredProjects.map(p => {
                      const clientName = getProjectOwnerName(p)
                      const projectBids = p.bids || bids.filter(b => {
                        const proj = typeof b.project === "object" ? b.project?._id : b.project
                        return proj === p._id
                      })
                      return (
                        <div key={p._id} className="rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h3 className="font-semibold" style={{ color: t.text }}><InlineEdit value={p.title} onSave={v => doUpdateProject(p._id, { title: v })} /></h3>
                                <Badge label={p.status} />
                                {p.budget >= 25000 && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.3)" }}>💎 High Value</span>}
                              </div>
                              <p className="text-sm mb-3" style={{ color: t.textSub }}>{p.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm">
                                {[["Client", clientName, t.text], ["Budget", `₹${p.budget?.toLocaleString()}`, "#10b981"], ["Bids", projectBids.length, t.text], ["Category", p.category, t.textSub]].map(([k, v, c]) => (
                                  <span key={k} style={{ color: t.textSub }}>{k}: <span style={{ color: c, fontWeight: 600 }}>{v}</span></span>
                                ))}
                              </div>
                              {/* Bids on this project */}
                              {projectBids.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-xs font-semibold mb-1" style={{ color: t.textMuted }}>Bids:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {projectBids.map(b => {
                                      const flName = getBidFreelancerName(b)
                                      return (
                                        <div key={b._id} className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl" style={{ background: t.summaryRow, border: `1px solid ${t.border}` }}>
                                          <span style={{ color: t.text }}>{flName}</span>
                                          <span style={{ color: "#10b981", fontWeight: 700 }}>₹{b.amount?.toLocaleString()}</span>
                                          <Badge label={b.status} />
                                          {statusIs(b.status, "pending") && (
                                            <>
                                              <Btn onClick={() => doUpdateBid(b._id, { status: "accepted" })} color="green" size="xs">✓</Btn>
                                              <Btn onClick={() => doUpdateBid(b._id, { status: "rejected" })} color="red" size="xs">✗</Btn>
                                            </>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 shrink-0">
                              <select value={p.status} onChange={e => doUpdateProject(p._id, { status: e.target.value })} style={{ ...SEL, fontSize: 12, padding: "5px 10px" }}>
                                <option value="pending">Pending</option><option value="accepted">Accepted</option><option value="in-progress">In Progress</option><option value="completed">Completed</option><option value="rejected">Rejected</option>
                              </select>
                              <Btn onClick={() => { const fl = window.prompt("Assign freelancer:", p.assignedTo || ""); if (fl !== null) doUpdateProject(p._id, { assignedTo: fl }) }} color="indigo" size="sm">Assign</Btn>
                              <Btn onClick={() => setConfirmModal({ title: "Delete Project", body: `Delete "${p.title}"?`, onConfirm: () => dispatch(localUpdateProject({ pid: p._id, data: {} })) })} color="red" size="sm">Delete</Btn>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════ BIDS ════ */}
            {section === "bids" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: t.text }}>Bids Management</h1>
                    <p className="text-sm" style={{ color: t.textSub }}>{filteredBids.length} bids · Accept rate: {Math.round(acceptedBidsCount / Math.max(bids.length, 1) * 100)}%</p>
                  </div>
                  <div className="flex gap-2">
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={SEL}><option value="All">All</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="rejected">Rejected</option></select>
                    <Btn onClick={() => exportJSON(bids, "bids")} color="indigo">↓ Export</Btn>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{ l: "Total", v: bids.length, c: "#6366f1" }, { l: "Accepted", v: acceptedBidsCount, c: "#10b981" }, { l: "Rejected", v: rejectedBidsCount, c: "#ef4444" }, { l: "Fraud Flags", v: fraudBids.length, c: "#f59e0b" }].map(s => (
                    <div key={s.l} className="rounded-2xl p-4 text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                      <div className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</div>
                      <div className="text-xs mt-1" style={{ color: t.textSub }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                {adminLoading ? <Skeleton /> : filteredBids.length === 0 ? <Empty icon="🏷️" label="No bids" /> : (
                  <div className="rounded-2xl overflow-hidden" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <TH>Freelancer</TH>
                            <TH onClick={() => toggleSort("project")}>Project <span className="ml-1 opacity-60">{getSortIcon("project")}</span></TH>
                            <TH onClick={() => toggleSort("amount")}>Amount <span className="ml-1 opacity-60">{getSortIcon("amount")}</span></TH>
                            <TH>Status</TH>
                            <TH>Fraud</TH>
                            <TH>Actions</TH>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBids.map(b => {
                            const flName = getBidFreelancerName(b)
                            const prName = getBidProjectTitle(b)
                            return (
                              <TR key={b._id} fraud={!!b.fraudFlag}>
                                <TD className="font-medium" style={{ color: t.text }}><Hl text={flName} q={q} /></TD>
                                <TD style={{ color: t.textSub }}><Hl text={prName} q={q} /></TD>
                                <TD className="font-semibold" style={{ color: "#10b981" }}>₹{b.amount?.toLocaleString()}</TD>
                                <TD><Badge label={b.status} /></TD>
                                <TD>{b.fraudFlag ? <Badge label="fraud" /> : <span style={{ color: t.textMuted, fontSize: 11 }}>Clean</span>}</TD>
                                <TD>
                                  <div className="flex gap-1 flex-wrap">
                                    {statusIs(b.status, "pending") && <>
                                      <Btn onClick={() => doUpdateBid(b._id, { status: "accepted" })} color="green" size="xs">Accept</Btn>
                                      <Btn onClick={() => doUpdateBid(b._id, { status: "rejected" })} color="red" size="xs">Reject</Btn>
                                    </>}
                                    <Btn onClick={() => doUpdateBid(b._id, { fraudFlag: !b.fraudFlag })} color={b.fraudFlag ? "green" : "orange"} size="xs">{b.fraudFlag ? "Clear" : "Flag"}</Btn>
                                  </div>
                                </TD>
                              </TR>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {/* Per-freelancer summary */}
                <Card>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>Bids Per Freelancer</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...new Set(bids.map(getBidFreelancerName).filter(Boolean))].map(fl => {
                      const fb = bids.filter(b => getBidFreelancerName(b) === fl)
                      const acc = fb.filter(b => statusIs(b.status, "accepted")).length
                      const ratio = Math.round((acc / Math.max(fb.length, 1)) * 100)
                      return (
                        <div key={fl} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: t.summaryRow }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#a78bfa)" }}>{fl[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium" style={{ color: t.text }}>{fl}</p>
                            <div className="flex gap-3 text-xs mt-0.5" style={{ color: t.textSub }}><span>Total: {fb.length}</span><span>✓ {acc}</span><span style={{ color: "#6366f1", fontWeight: 700 }}>{ratio}%</span></div>
                            <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: t.progressBg }}>
                              <div className="h-full rounded-full" style={{ width: `${ratio}%`, background: "#6366f1", transition: "width .5s" }} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* ════ PAYMENTS ════ */}
            {section === "payments" && (
              <div style={{ background: t.bg }}>
                <AdminPayments />
              </div>
            )}





            {/* ════ ANALYTICS ════ */}
            {section === "analytics" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: t.text }}>Advanced Analytics</h1>
                  <p className="text-sm" style={{ color: t.textSub }}>Full platform performance insights</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "User Growth", val: `${getGrowthPercent(monthlyUsers)}%`, color: "#10b981", bg: "rgba(16,185,129,.1)" },
                    { label: "Revenue Growth", val: `${getGrowthPercent(monthlyRevenue)}%`, color: "#f59e0b", bg: "rgba(245,158,11,.1)" },
                    { label: "Bid Volume", val: `${getGrowthPercent(monthlyBids)}%`, color: "#6366f1", bg: "rgba(99,102,241,.1)" },
                    { label: "Fraud Rate", val: `${Math.round(fraudBids.length / Math.max(bids.length, 1) * 100)}%`, color: "#f97316", bg: "rgba(249,115,22,.1)" },
                  ].map(m => (
                    <div key={m.label} className="rounded-2xl p-4 text-center" style={{ background: m.bg, border: `1px solid ${m.color}33` }}>
                      <div className="text-2xl font-bold" style={{ color: m.color }}>{m.val}</div>
                      <div className="text-xs mt-1" style={{ color: t.textSub }}>{m.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>vs last month</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monthlyAnalytics ? [
                    { title: "Monthly Bids", sub: "Total bids placed", data: monthlyAnalytics.bids || [], color: "#6366f1" },
                    { title: "Monthly Revenue (₹K)", sub: "Completed volume", data: monthlyRevenue.map(v => Math.round(v / 1000)), color: "#f59e0b" },
                    { title: "User Growth", sub: "New registrations", data: monthlyUsers, color: "#34d399" }
                  ].map(c => (
                    <div key={c.title} className="rounded-2xl p-5" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                      <h3 className="text-sm font-semibold" style={{ color: t.text }}>{c.title}</h3>
                      <p className="text-xs mb-4" style={{ color: t.textMuted }}>{c.sub}</p>
                      <BarChart data={c.data.length > 0 ? c.data : [0]} labels={monthlyAnalytics?.months || MONTHS} color={c.color} height={155} />
                    </div>
                  )) : <div style={{ color: t.textMuted }}>Loading analytics...</div>}
                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>💰 Top Earning Freelancers</h3>
                    {freelancers.sort((a, b) => (b.credits || 0) - (a.credits || 0)).slice(0, 5).map((f, i) => (
                      <div key={f._id} className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-bold w-5" style={{ color: ["#f59e0b", "#94a3b8", "#b45309", "#6366f1", "#34d399"][i] || "#6366f1" }}>#{i + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: t.text }}>{f.name}</p>
                          <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ background: t.progressBg }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(((f.credits || 0) / 5000) * 100, 100)}%`, background: ["#f59e0b", "#94a3b8", "#b45309", "#6366f1", "#34d399"][i] || "#6366f1" }} />
                          </div>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#10b981" }}>₹{(f.credits || 0).toLocaleString()}</span>
                      </div>
                    ))}
                    {!freelancers.length && <Empty icon="🧑‍💻" label="No freelancers" />}
                  </Card>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>🚨 Fraud Summary</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[{ l: "Fraud Users", v: fraudUsers.length, c: "#ef4444" }, { l: "Fraud Bids", v: fraudBids.length, c: "#f97316" }, { l: "Fraud Bid %", v: `${Math.round(fraudBids.length / Math.max(bids.length, 1) * 100)}%`, c: "#f59e0b" }, { l: "Blocked Users", v: users.filter(u => u.status === "Blocked").length, c: "#94a3b8" }].map(s => (
                        <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: t.summaryRow, border: `1px solid ${t.border}` }}>
                          <div className="text-xl font-bold" style={{ color: s.c }}>{s.v}</div>
                          <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>📊 Project Status</h3>
                    {[
                      ["pending", "Pending", "#f59e0b"],
                      ["accepted", "Accepted", "#38bdf8"],
                      ["in-progress", "In Progress", "#6366f1"],
                      ["completed", "Completed", "#34d399"],
                      ["rejected", "Rejected", "#f87171"],
                    ].map(([status, label, color]) => {
                      const count = projects.filter(p => statusIs(p.status, status)).length
                      const pct = Math.round(count / Math.max(projects.length, 1) * 100)
                      return (
                        <div key={status} className="mb-3">
                          <div className="flex justify-between items-center text-xs mb-1"><span className="flex items-center gap-2" style={{ color: t.textSub }}><Badge label={status} /> {label}</span><span style={{ color: t.text, fontWeight: 600 }}>{count} ({pct}%)</span></div>
                          <div className="h-2 rounded-full" style={{ background: t.progressBg }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width .6s" }} /></div>
                        </div>
                      )
                    })}
                  </Card>
                </div>
              </div>
            )}

            {/* ════ FRAUD ════ */}
            {section === "fraud" && (
              <div className="space-y-5">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: t.text }}>🚨 Fraud Management</h1>
                  <p className="text-sm" style={{ color: t.textSub }}>{fraudUsers.length} flagged users · {fraudBids.length} flagged bids</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[{ l: "Fraud Users", v: fraudUsers.length, c: "#ef4444" }, { l: "Fraud Bids", v: fraudBids.length, c: "#f97316" }, { l: "Blocked", v: users.filter(u => u.status === "Blocked").length, c: "#94a3b8" }, { l: "Fraud Bid %", v: `${Math.round(fraudBids.length / Math.max(bids.length, 1) * 100)}%`, c: "#f59e0b" }].map(s => (
                    <div key={s.l} className="rounded-2xl p-4 text-center" style={{ background: t.card, border: `1px solid ${t.border}` }}>
                      <div className="text-2xl font-bold" style={{ color: s.c }}>{s.v}</div>
                      <div className="text-xs mt-1" style={{ color: t.textSub }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <Card>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>🚩 Flagged Users</h3>
                  {fraudUsers.length === 0 ? <Empty icon="✅" label="No fraud users" /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr><TH>User</TH><TH>Email</TH><TH>Status</TH><TH>Credits</TH><TH>Note</TH><TH>Actions</TH></tr></thead>
                        <tbody>
                          {fraudUsers.map(u => (
                            <TR key={u._id} fraud>
                              <TD className="font-medium" style={{ color: t.text }}>{u.name}</TD>
                              <TD className="text-xs" style={{ color: t.textSub }}>{u.email}</TD>
                              <TD><Badge label={u.status || "Active"} /></TD>
                              <TD className="font-semibold" style={{ color: "#10b981" }}>{u.credits}</TD>
                              <TD className="text-xs italic" style={{ color: t.textMuted }}>{u.notes || "—"}</TD>
                              <TD>
                                <div className="flex gap-1 flex-wrap">
                                  <Btn onClick={() => doUpdateUser(u._id, { fraudFlag: false })} color="green" size="xs">Clear Flag</Btn>
                                  <Btn onClick={() => setConfirmModal({ title: "Permanent Ban", body: `Ban ${u.name} — sets credits to 0 and blocks account.`, onConfirm: () => { doUpdateUser(u._id, { status: "Blocked", credits: 0 }) } })} color="red" size="xs">Perm Ban</Btn>
                                  <Btn onClick={() => { const n = window.prompt("Remark:", u.notes || ""); if (n !== null) doUpdateUser(u._id, { notes: n }) }} color="amber" size="xs">Remark</Btn>
                                </div>
                              </TD>
                            </TR>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
                <Card>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>🚩 Flagged Bids</h3>
                  {fraudBids.length === 0 ? <Empty icon="✅" label="No fraud bids" /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr><TH>Freelancer</TH><TH>Project</TH><TH>Amount</TH><TH>Status</TH><TH>Actions</TH></tr></thead>
                        <tbody>
                          {fraudBids.map(b => {
                            const fl = getBidFreelancerName(b)
                            const pr = getBidProjectTitle(b)
                            return (
                              <TR key={b._id} fraud>
                                <TD className="font-medium" style={{ color: t.text }}>{fl}</TD>
                                <TD style={{ color: t.textSub }}>{pr}</TD>
                                <TD className="font-semibold" style={{ color: "#ef4444" }}>₹{b.amount?.toLocaleString()}</TD>
                                <TD><Badge label={b.status} /></TD>
                                <TD>
                                  <div className="flex gap-1">
                                    <Btn onClick={() => doUpdateBid(b._id, { fraudFlag: false })} color="green" size="xs">Clear</Btn>
                                    <Btn onClick={() => doUpdateBid(b._id, { status: "rejected" })} color="red" size="xs">Reject</Btn>
                                  </div>
                                </TD>
                              </TR>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ════ CONTROL PANEL ════ */}
            {section === "control" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: t.text }}>⚙️ Admin Control Panel</h1>
                    <p className="text-sm" style={{ color: t.textSub }}>Manage platform settings and data</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Btn onClick={() => setShowAddUser(true)} color="green">+ Add User</Btn>
                    <Btn onClick={() => exportJSON(users, "users-full")} color="indigo">↓ Users</Btn>
                    <Btn onClick={() => exportJSON({ users, projects, bids, payments }, "full-backup")} color="amber">💾 Full Backup</Btn>
                    <Btn onClick={() => toast.info("Connect a file input to import")} color="orange">↑ Import</Btn>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>🔧 Platform Toggles</h3>
                    {[
                      ["Maintenance Mode", "Disable public access"],
                      ["New Registrations", "Allow new users to sign up"],
                      ["Bid System", "Allow freelancers to place bids"],
                      ["Payment Gateway", "Enable payment processing"],
                    ].map(([label, desc]) => {
                      const on = platformToggles[label]
                      return (
                        <div key={label} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid ${t.border}` }}>
                          <div>
                            <p className="text-sm font-medium" style={{ color: t.text }}>{label}</p>
                            <p className="text-xs" style={{ color: t.textMuted }}>{desc}</p>
                          </div>
                          <button
                            onClick={() => togglePlatform(label)}
                            style={{ width: 42, height: 22, borderRadius: 11, background: on ? "#6366f1" : "#94a3b8", border: "none", cursor: "pointer", position: "relative", transition: "background .25s", flexShrink: 0 }}>
                            <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .25s" }} />
                          </button>
                        </div>
                      )
                    })}
                  </Card>
                  <Card>
                    <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>📊 Live Counts</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[{ l: "Total Users", v: users.length, c: "#6366f1" }, { l: "Freelancers", v: freelancers.length, c: "#a78bfa" }, { l: "Pending Projects", v: projects.filter(p => statusIs(p.status, "pending")).length, c: "#38bdf8" }, { l: "Pending Bids", v: bids.filter(b => statusIs(b.status, "pending")).length, c: "#f59e0b" }, { l: "Failed Payments", v: payments.filter(p => statusIs(p.status, "failed")).length, c: "#ef4444" }, { l: "Fraud Flags", v: fraudUsers.length + fraudBids.length, c: "#f97316" }].map(s => (
                        <div key={s.l} className="rounded-xl p-3 text-center" style={{ background: t.summaryRow, border: `1px solid ${t.border}` }}>
                          <div className="text-xl font-bold" style={{ color: s.c }}>{s.v}</div>
                          <div className="text-xs mt-0.5" style={{ color: t.textMuted }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
                <Card>
                  <h3 className="text-sm font-semibold mb-4" style={{ color: t.text }}>🧑‍💻 All Freelancer Profiles (Full Edit)</h3>
                  {!freelancers.length ? <Empty icon="🧑‍💻" label="No freelancers" /> : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <TH>Name</TH>
                            <TH>Email</TH>
                            <TH>Experience</TH>
                            <TH>Skills</TH>
                            <TH>Prev. Works</TH>
                            <TH>Done</TH>
                            <TH>Credits</TH>
                            <TH>Notes</TH>
                            <TH>Actions</TH>
                          </tr>
                        </thead>
                        <tbody>
                          {freelancers.map(u => {
                            /*
                             * Field resolution — handles 3 possible shapes:
                             *  1. Flat on user:   u.experience, u.skills, u.completedProjects
                             *  2. Nested profile: u.profile.experience, u.profile.skills
                             *  3. FreelancerSlice shape: profile.experience, profile.skills,
                             *     profile.previousWorks (array of project refs)
                             */
                            const profile = u.profile || {}
                            const exp = u.experience || profile.experience || "N/A"
                            const skills = u.skills?.length ? u.skills
                              : profile.skills?.length ? profile.skills
                                : []
                            const prevWorks = profile.previousWorks?.length || u.previousProjects || 0
                            const done = u.completedProjects != null
                              ? u.completedProjects
                              : profile.completedProjects != null
                                ? profile.completedProjects
                                : 0
                            const credits = u.credits ?? profile.Credits ?? 0
                            const notes = u.notes || profile.description || "—"

                            return (
                              <TR key={u._id}>
                                <TD className="font-medium" style={{ color: t.text }}>
                                  <InlineEdit value={u.name} onSave={v => doUpdateUser(u._id, { name: v })} />
                                </TD>
                                <TD className="text-xs" style={{ color: t.textSub }}>
                                  <InlineEdit value={u.email} onSave={v => doUpdateUser(u._id, { email: v })} />
                                </TD>
                                <TD>
                                  <InlineEdit
                                    value={exp}
                                    onSave={v => doUpdateUser(u._id, { experience: v })}
                                  />
                                </TD>
                                <TD className="max-w-[160px]">
                                  {skills.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {skills.map(s => (
                                        <span key={s} className="px-1.5 py-0.5 rounded-md text-xs"
                                          style={{ background: t.skillTag, color: t.textSub, border: `1px solid ${t.border}` }}>
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span style={{ color: t.textMuted, fontSize: 11 }}>No skills set</span>
                                  )}
                                </TD>
                                <TD className="text-center" style={{ color: t.textSub }}>{prevWorks}</TD>
                                <TD className="text-center font-semibold" style={{ color: "#10b981" }}>{done}</TD>
                                <TD>
                                  <InlineEdit
                                    value={credits}
                                    onSave={v => doUpdateUser(u._id, { credits: Number(v) })}
                                    type="number"
                                  />
                                </TD>
                                <TD className="text-xs italic max-w-[140px] truncate" style={{ color: t.textMuted }}
                                  title={notes}>
                                  {notes}
                                </TD>
                                <TD>
                                  <div className="flex gap-1 flex-wrap">
                                    <Btn
                                      onClick={() => doUpdateUser(u._id, { status: u.status === "Blocked" ? "Active" : "Blocked" })}
                                      color={u.status === "Blocked" ? "green" : "red"}
                                      size="xs">
                                      {u.status === "Blocked" ? "Unblock" : "Block"}
                                    </Btn>
                                    <Btn
                                      onClick={() => { const n = window.prompt("Admin note:", u.notes || ""); if (n !== null) doUpdateUser(u._id, { notes: n }) }}
                                      color="amber" size="xs">
                                      Note
                                    </Btn>
                                    <Btn
                                      onClick={() => setConfirmModal({ title: "Delete User", body: `Permanently delete ${u.name}?`, onConfirm: () => doDeleteUser(u._id) })}
                                      color="red" size="xs">
                                      Del
                                    </Btn>
                                  </div>
                                </TD>
                              </TR>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* ════ ACTIVITY LOG ════ */}
            {section === "activity" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: t.text }}>📋 Activity Log</h1>
                    <p className="text-sm" style={{ color: t.textSub }}>{activity.length} events</p>
                  </div>
                  <div className="flex gap-2">
                    <Btn onClick={() => exportJSON(activity, "activity-log")} color="indigo">↓ Export</Btn>
                    <Btn onClick={() => setConfirmModal({ title: "Clear Log", body: "Clear all activity logs?", onConfirm: () => setActivity([]) })} color="red">🗑 Clear</Btn>
                  </div>
                </div>
                <Card>
                  {activity.length === 0 ? <Empty icon="📋" label="No activity yet" /> : (
                    <div className="space-y-2">
                      {activity.map(a => (
                        <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: t.summaryRow, border: `1px solid ${t.border}` }}>
                          <span className="text-lg mt-0.5">{a.type === "error" ? "🔴" : a.type === "warn" ? "🟡" : a.type === "success" ? "🟢" : "🔵"}</span>
                          <div className="flex-1"><p className="text-sm" style={{ color: t.text }}>{a.msg}</p><p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{a.time}</p></div>
                          <Badge label={a.type === "error" ? "Failed" : a.type === "warn" ? "Warning" : a.type === "success" ? "Success" : "Info"} />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

          </main>
        </div>

        <style>{`
          @keyframes slideIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
          ::-webkit-scrollbar{width:5px;height:5px}
          ::-webkit-scrollbar-track{background:transparent}
          ::-webkit-scrollbar-thumb{background:${themeName === "dark" ? "#1e3a5f" : "#c0cfe0"};border-radius:8px}
          mark{background:rgba(253,224,71,.65);color:inherit;border-radius:3px;padding:0 2px}
        `}</style>
      </div>
    </ThemeCtx.Provider>
  )
}

export default AdminDashboard
