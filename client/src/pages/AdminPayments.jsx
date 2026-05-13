import { useState, useEffect, useCallback } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import API from "../features/api/axiosInstance"
import { buildAuthConfig } from "../features/api/apiHelpers"

// ── Status badge ───────────────────────────────────────────
const Badge = ({ status }) => {
    const map = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        escrow: "bg-blue-50 text-blue-700 border-blue-200",
        pending_release: "bg-purple-50 text-purple-700 border-purple-200",
        released: "bg-emerald-50 text-emerald-700 border-emerald-200",
        failed: "bg-rose-50 text-rose-700 border-rose-200",
        refunded: "bg-gray-50 text-gray-600 border-gray-200",
        processing: "bg-sky-50 text-sky-700 border-sky-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-rose-50 text-rose-700 border-rose-200",
    }
    return (
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${map[status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
            {status?.replace("_", " ") || "—"}
        </span>
    )
}

const getWithdrawalMethodLabel = (withdrawal) => (
    withdrawal?.method === "bank" ? "Bank account" : "UPI"
)

const getWithdrawalDestination = (withdrawal) => {
    if (withdrawal?.method === "bank") {
        const accountNumber = withdrawal.bankDetails?.accountNumber || ""
        const maskedAccount = accountNumber ? `•••• ${accountNumber.slice(-4)}` : "Account"
        return `${withdrawal.bankDetails?.bankName || "Bank"} · ${maskedAccount} · ${withdrawal.bankDetails?.ifscCode || "IFSC"}`
    }

    return withdrawal?.upiId || "UPI"
}

// ══════════════════════════════════════════════════════════
const AdminPayments = () => {
    const { user } = useSelector(state => state.auth)
    const token = user?.token

    const [tab, setTab] = useState("payments")
    const [payments, setPayments] = useState([])
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(false)
    const [actionId, setActionId] = useState(null)
    const [filterStatus, setFilterStatus] = useState("")

    const fetchPayments = useCallback(async () => {
        if (!token) return

        setLoading(true)
        try {
            const res = await API.get("/api/payment/all", buildAuthConfig(token))
            setPayments(Array.isArray(res.data) ? res.data : res.data.payments || [])
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load payments")
        } finally { setLoading(false) }
    }, [token])

    const fetchWithdrawals = useCallback(async () => {
        if (!token) return

        setLoading(true)
        try {
            const res = await API.get("/api/wallet/admin/withdrawals", buildAuthConfig(token))
            setWithdrawals(Array.isArray(res.data) ? res.data : res.data.withdrawals || [])
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load withdrawals")
        } finally { setLoading(false) }
    }, [token])

    useEffect(() => {
        if (tab === "payments") fetchPayments()
        if (tab === "withdrawals") fetchWithdrawals()
    }, [tab, fetchPayments, fetchWithdrawals])

    // ── Release escrow (admin) ──
    const handleReleaseEscrow = async (paymentId) => {
        setActionId(paymentId)
        try {
            const payment = payments.find(p => p._id === paymentId)
            if (!payment) throw new Error("Payment not found")
            const projectId = payment.project?._id || payment.project
            await API.post(
                `/api/payment/release/${projectId}`,
                {},
                buildAuthConfig(token)
            )
            toast.success("Escrow released to freelancer!")
            fetchPayments()
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to release")
        } finally { setActionId(null) }
    }

    // ── Approve withdrawal ──
    const handleApprove = async (id) => {
        setActionId(id)
        try {
            await API.put(
                `/api/wallet/admin/withdrawals/${id}`,
                { status: "approved", adminNote: "Approved by admin" },
                buildAuthConfig(token)
            )
            toast.success("Withdrawal approved!")
            fetchWithdrawals()
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to approve")
        } finally { setActionId(null) }
    }

    // ── Reject withdrawal ──
    const handleReject = async (id) => {
        setActionId(id)
        try {
            await API.put(
                `/api/wallet/admin/withdrawals/${id}`,
                { status: "rejected", adminNote: "Rejected by admin" },
                buildAuthConfig(token)
            )
            toast.success("Withdrawal rejected, amount refunded.")
            fetchWithdrawals()
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject")
        } finally { setActionId(null) }
    }

    const PAYMENT_STATUSES = ["", "pending", "escrow", "pending_release", "released", "failed", "refunded"]
    const WITHDRAWAL_STATUSES = ["", "pending", "processing", "approved", "rejected"]

    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .fade-up{animation:fadeUp .35s ease both}`}</style>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Payment Admin</h1>
                        <p className="text-gray-500 text-sm mt-0.5">Manage escrow, payments & withdrawals</p>
                    </div>
                    {/* Summary cards */}
                    <div className="flex gap-3 flex-wrap">
                        {[
                            { label: "Total Payments", value: payments.length, icon: "💳" },
                            { label: "In Escrow", value: payments.filter(p => p.status === "escrow").length, icon: "🔒" },
                            { label: "Pending Payout", value: withdrawals.filter(w => w.status === "pending").length, icon: "⏳" },
                        ].map(s => (
                            <div key={s.label} className="bg-white rounded-2xl border border-gray-200 px-4 py-3 text-center shadow-sm">
                                <p className="text-xl">{s.icon}</p>
                                <p className="text-xl font-black text-gray-900">{s.value}</p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs + Filter */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex gap-1 border-b border-gray-200">
                        {[{ id: "payments", label: "Payments / Escrow" }, { id: "withdrawals", label: "Withdrawals" }].map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px cursor-pointer border-none bg-transparent
                                    ${tab === t.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter */}
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-700 outline-none focus:border-blue-400 cursor-pointer"
                        style={{ fontFamily: "inherit" }}>
                        {(tab === "payments" ? PAYMENT_STATUSES : WITHDRAWAL_STATUSES).map(s => (
                            <option key={s} value={s}>{s || "All Status"}</option>
                        ))}
                    </select>
                </div>

                {/* ── PAYMENTS TABLE ── */}
                {tab === "payments" && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Loading...</p></div>
                        ) : payments.length === 0 ? (
                            <div className="py-16 text-center"><p className="text-4xl mb-2">📭</p><p className="text-gray-500 text-sm font-semibold">No payments found</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["Project", "Client", "Freelancer", "Total", "Platform Fee", "Freelancer Gets", "Status", "Action"].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {payments.map((p, i) => (
                                            <tr key={p._id} className="hover:bg-gray-50 transition fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-zinc-900 max-w-[140px] truncate">{p.project?.title || "—"}</p>
                                                    <p className="text-xs text-gray-400">{p.project?.category}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-zinc-800">{p.client?.name || "—"}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{p.client?.email}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-zinc-800">{p.freelancer?.name || "—"}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{p.freelancer?.email}</p>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-zinc-900">₹{p.totalAmount?.toLocaleString("en-IN")}</td>
                                                <td className="px-4 py-3 text-rose-600 font-semibold">₹{p.platformFee}</td>
                                                <td className="px-4 py-3 text-emerald-600 font-bold">₹{p.freelancerAmount?.toLocaleString("en-IN")}</td>
                                                <td className="px-4 py-3"><Badge status={p.status} /></td>
                                                <td className="px-4 py-3">
                                                    {["escrow", "pending_release"].includes(p.status) && (
                                                        <button
                                                            onClick={() => handleReleaseEscrow(p._id)}
                                                            disabled={actionId === p._id}
                                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all whitespace-nowrap
                                                                ${actionId === p._id
                                                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white cursor-pointer"
                                                                }`}>
                                                            {actionId === p._id ? "..." : "✓ Release"}
                                                        </button>
                                                    )}
                                                    {!["escrow", "pending_release"].includes(p.status) && (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── WITHDRAWALS TABLE ── */}
                {tab === "withdrawals" && (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="py-16 text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-gray-500 text-sm">Loading...</p></div>
                        ) : withdrawals.length === 0 ? (
                            <div className="py-16 text-center"><p className="text-4xl mb-2">💸</p><p className="text-gray-500 text-sm font-semibold">No withdrawals found</p></div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            {["Freelancer", "Amount", "Fee", "Final Payout", "Destination", "Status", "Requested", "Actions"].map(h => (
                                                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {withdrawals.map((w, i) => (
                                            <tr key={w._id} className="hover:bg-gray-50 transition fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
                                                <td className="px-4 py-3">
                                                    <p className="font-semibold text-zinc-900">{w.user?.name || "—"}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[120px]">{w.user?.email}</p>
                                                </td>
                                                <td className="px-4 py-3 font-bold text-zinc-900">₹{w.amount?.toLocaleString("en-IN")}</td>
                                                <td className="px-4 py-3 text-rose-600">₹{w.fee}</td>
                                                <td className="px-4 py-3 font-bold text-emerald-600">₹{w.finalAmount?.toLocaleString("en-IN")}</td>
                                                <td className="px-4 py-3">
                                                    <p className="text-xs font-bold text-gray-800">{getWithdrawalMethodLabel(w)}</p>
                                                    <p className="max-w-[180px] truncate text-xs text-gray-400">{getWithdrawalDestination(w)}</p>
                                                </td>
                                                <td className="px-4 py-3"><Badge status={w.status} /></td>
                                                <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                                                    {new Date(w.createdAt).toLocaleDateString("en-IN")}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {w.status === "pending" && (
                                                        <div className="flex gap-2">
                                                            <button onClick={() => handleApprove(w._id)} disabled={actionId === w._id}
                                                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all
                                                                    ${actionId === w._id ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400" : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-500 hover:text-white cursor-pointer"}`}>
                                                                ✓ Approve
                                                            </button>
                                                            <button onClick={() => handleReject(w._id)} disabled={actionId === w._id}
                                                                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all
                                                                    ${actionId === w._id ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-400" : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-500 hover:text-white cursor-pointer"}`}>
                                                                ✕ Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {w.status !== "pending" && <span className="text-xs text-gray-400">Processed</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPayments
