// ===== FILE: client/src/pages/WalletDashboard.jsx =====
// Add to App.jsx:  <Route path="/wallet" element={<WalletDashboard />} />
// Add link in FreelancerProfile or Navbar for logged-in freelancers

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import {
    fetchMyWallet,
    requestWithdrawal,
    fetchMyWithdrawals,
    resetWallet,
} from "../features/wallet/walletSlice"

const fmt = (n = 0) => `₹${Number(n).toLocaleString("en-IN")}`

const StatusBadge = ({ status }) => {
    const map = {
        pending: "bg-amber-100 text-amber-700",
        approved: "bg-emerald-100 text-emerald-700",
        rejected: "bg-rose-100 text-rose-700",
        completed: "bg-blue-100 text-blue-700",
        failed: "bg-rose-100 text-rose-700",
        credit: "bg-emerald-100 text-emerald-700",
        debit: "bg-rose-100 text-rose-700",
    }
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    )
}

const WalletDashboard = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(s => s.auth)
    const { wallet, withdrawals, loading, success, error, errorMsg } = useSelector(s => s.wallet)

    const [showWithdraw, setShowWithdraw] = useState(false)
    const [amount, setAmount] = useState("")
    const [upiId, setUpiId] = useState("")
    const [activeTab, setActiveTab] = useState("transactions")

    const WITHDRAWAL_FEE = 19

    useEffect(() => {
        dispatch(fetchMyWallet())
        dispatch(fetchMyWithdrawals())
    }, [dispatch])

    useEffect(() => {
        if (error && errorMsg) toast.error(errorMsg)
        if (success && showWithdraw) {
            toast.success("Withdrawal request submitted!")
            setShowWithdraw(false)
            setAmount("")
            setUpiId("")
            dispatch(resetWallet())
        }
    }, [error, success, errorMsg]) // eslint-disable-line

    const handleWithdraw = async () => {
        const amt = Number(amount)
        if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return }
        if (!upiId.trim()) { toast.error("Enter your UPI ID"); return }
        if (amt <= WITHDRAWAL_FEE) { toast.error(`Amount must be greater than fee ₹${WITHDRAWAL_FEE}`); return }
        if (amt > (wallet?.balance || 0)) { toast.error("Insufficient balance"); return }

        dispatch(requestWithdrawal({ amount: amt, upiId: upiId.trim() }))
    }

    const inpStyle = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-gray-50"

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">💰 My Wallet</h1>
                    <p className="text-sm text-gray-500">{user?.name} · Freelancer Wallet</p>
                </div>

                {/* Balance cards */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Withdrawable", value: wallet?.balance || 0, color: "text-emerald-600", bg: "bg-emerald-50  border-emerald-200", icon: "✅" },
                        { label: "Pending (24hr)", value: wallet?.pendingBalance || 0, color: "text-amber-600", bg: "bg-amber-50   border-amber-200", icon: "⏳" },
                        { label: "Total Earned", value: (wallet?.balance || 0) + (wallet?.pendingBalance || 0), color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: "💎" },
                    ].map(c => (
                        <div key={c.label} className={`rounded-2xl p-4 border ${c.bg} text-center`}>
                            <p className="text-xl mb-1">{c.icon}</p>
                            <p className={`text-xl font-black ${c.color}`}>{fmt(c.value)}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium">{c.label}</p>
                        </div>
                    ))}
                </div>

                {/* Withdraw CTA */}
                {!showWithdraw ? (
                    <button
                        onClick={() => setShowWithdraw(true)}
                        disabled={!wallet?.balance || wallet?.balance <= WITHDRAWAL_FEE}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm rounded-2xl hover:shadow-lg transition cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        🏦 Withdraw Funds
                    </button>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-base">Withdraw Funds</h3>
                            <button onClick={() => setShowWithdraw(false)} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none">✕</button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                placeholder={`Max: ${fmt(wallet?.balance)}`} className={inpStyle} />
                            {amount && Number(amount) > WITHDRAWAL_FEE && (
                                <p className="text-xs text-gray-500 mt-1">
                                    After fee: <span className="font-bold text-emerald-600">{fmt(Number(amount) - WITHDRAWAL_FEE)}</span>
                                    <span className="text-gray-400"> (fee: ₹{WITHDRAWAL_FEE})</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">UPI ID</label>
                            <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                                placeholder="yourname@upi" className={inpStyle} />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowWithdraw(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl cursor-pointer border-none">Cancel</button>
                            <button onClick={handleWithdraw} disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm rounded-xl cursor-pointer border-none disabled:opacity-60">
                                {loading ? "Submitting..." : "Request Withdrawal"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-0.5 border-b border-gray-200">
                    {[["transactions", "Transactions"], ["withdrawals", "Withdrawals"]].map(([id, label]) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px cursor-pointer bg-transparent
                ${activeTab === id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Transactions */}
                {activeTab === "transactions" && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        {!wallet?.transactions?.length ? (
                            <div className="py-12 text-center text-gray-400 text-sm">No transactions yet</div>
                        ) : [...(wallet.transactions)].reverse().map((t, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                  ${t.type === "credit" ? "bg-emerald-50" : "bg-rose-50"}`}>
                                    {t.type === "credit" ? "⬆️" : "⬇️"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{t.description || t.type}</p>
                                    <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className={`text-sm font-bold ${t.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                                        {t.type === "credit" ? "+" : "-"}{fmt(t.amount)}
                                    </p>
                                    <StatusBadge status={t.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Withdrawals */}
                {activeTab === "withdrawals" && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        {!withdrawals.length ? (
                            <div className="py-12 text-center text-gray-400 text-sm">No withdrawals yet</div>
                        ) : withdrawals.map((w) => (
                            <div key={w._id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-base flex-shrink-0">🏦</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800">{fmt(w.amount)} → {w.upiId}</p>
                                    <p className="text-xs text-gray-400">Fee: ₹{w.fee} · Final: {fmt(w.finalAmount)}</p>
                                    <p className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString("en-IN")}</p>
                                </div>
                                <StatusBadge status={w.status} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default WalletDashboard