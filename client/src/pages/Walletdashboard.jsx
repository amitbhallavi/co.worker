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

const emptyBankDetails = {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
}

const getWithdrawalDestination = (withdrawal) => {
    if (withdrawal?.method === "bank") {
        const accountNumber = withdrawal.bankDetails?.accountNumber || ""
        const maskedAccount = accountNumber ? `•••• ${accountNumber.slice(-4)}` : "Bank account"
        return `${withdrawal.bankDetails?.bankName || "Bank"} · ${maskedAccount}`
    }

    return withdrawal?.upiId || "UPI"
}

const StatusBadge = ({ status }) => {
    const map = {
        pending: "bg-amber-100 text-amber-700 dark:bg-amber-300/15 dark:text-amber-100",
        approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100",
        rejected: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-100",
        completed: "bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-100",
        failed: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-100",
        credit: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-100",
        debit: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-100",
    }
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${map[status] || "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60"}`}>
            {status}
        </span>
    )
}

const WalletDashboard = () => {
    const dispatch = useDispatch()
    const { user } = useSelector(s => s.auth)
    const { wallet, withdrawals, loading } = useSelector(s => s.wallet)

    const [showWithdraw, setShowWithdraw] = useState(false)
    const [amount, setAmount] = useState("")
    const [withdrawMethod, setWithdrawMethod] = useState("upi")
    const [upiId, setUpiId] = useState("")
    const [bankDetails, setBankDetails] = useState(emptyBankDetails)
    const [activeTab, setActiveTab] = useState("transactions")

    const WITHDRAWAL_FEE = 19

    useEffect(() => {
        dispatch(fetchMyWallet())
        dispatch(fetchMyWithdrawals())
    }, [dispatch])

    const resetWithdrawalForm = () => {
        setShowWithdraw(false)
        setAmount("")
        setUpiId("")
        setWithdrawMethod("upi")
        setBankDetails(emptyBankDetails)
    }

    const updateBankDetails = (key, value) => {
        setBankDetails(prev => ({ ...prev, [key]: value }))
    }

    const handleWithdraw = async () => {
        const amt = Number(amount)
        if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return }
        if (amt <= WITHDRAWAL_FEE) { toast.error(`Amount must be greater than fee ₹${WITHDRAWAL_FEE}`); return }
        if (amt > (wallet?.balance || 0)) { toast.error("Insufficient balance"); return }

        if (withdrawMethod === "upi" && !upiId.trim().includes("@")) {
            toast.error("Enter a valid UPI ID")
            return
        }

        if (withdrawMethod === "bank") {
            if (!bankDetails.accountHolderName.trim()) { toast.error("Enter account holder name"); return }
            if (!/^\d{6,18}$/.test(bankDetails.accountNumber.trim())) { toast.error("Enter a valid account number"); return }
            if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bankDetails.ifscCode.trim())) { toast.error("Enter a valid IFSC code"); return }
        }

        try {
            await dispatch(requestWithdrawal({
                amount: amt,
                method: withdrawMethod,
                upiId: withdrawMethod === "upi" ? upiId.trim() : "",
                bankDetails: withdrawMethod === "bank"
                    ? {
                        accountHolderName: bankDetails.accountHolderName.trim(),
                        accountNumber: bankDetails.accountNumber.trim(),
                        ifscCode: bankDetails.ifscCode.trim().toUpperCase(),
                        bankName: bankDetails.bankName.trim(),
                    }
                    : undefined,
            })).unwrap()
            toast.success("Withdrawal request submitted!")
            resetWithdrawalForm()
            dispatch(fetchMyWallet())
            dispatch(fetchMyWithdrawals())
            dispatch(resetWallet())
        } catch (error) {
            toast.error(typeof error === "string" ? error : "Failed to submit withdrawal request")
        }
    }

    const inpStyle = "w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition bg-gray-50 text-gray-900 placeholder-gray-400 dark:border-white/10 dark:bg-white/[0.05] dark:text-white dark:placeholder-white/30 dark:focus:border-cyan-300/40 dark:focus:ring-cyan-400/10"

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-[#020617] dark:text-white" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <div className="max-w-2xl mx-auto space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">💰 My Wallet</h1>
                    <p className="text-sm text-gray-500 dark:text-white/55">{user?.name} · Freelancer Wallet</p>
                </div>

                {/* Balance cards */}
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "Withdrawable", value: wallet?.balance || 0, color: "text-emerald-600", bg: "bg-emerald-50  border-emerald-200", icon: "✅" },
                        { label: "Pending (24hr)", value: wallet?.pendingBalance || 0, color: "text-amber-600", bg: "bg-amber-50   border-amber-200", icon: "⏳" },
                        { label: "Total Earned", value: (wallet?.balance || 0) + (wallet?.pendingBalance || 0), color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: "💎" },
                    ].map(c => (
                        <div key={c.label} className={`rounded-2xl p-4 border ${c.bg} text-center dark:border-white/10 dark:bg-white/[0.04]`}>
                            <p className="text-xl mb-1">{c.icon}</p>
                            <p className={`text-xl font-black ${c.color}`}>{fmt(c.value)}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5 font-medium dark:text-white/45">{c.label}</p>
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
                    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-base dark:text-white">Withdraw Funds</h3>
                            <button onClick={resetWithdrawalForm} className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer bg-transparent border-none dark:text-white/40 dark:hover:text-white/70">✕</button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 dark:text-white/55">Amount (₹)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                placeholder={`Max: ${fmt(wallet?.balance)}`} className={inpStyle} />
                            {amount && Number(amount) > WITHDRAWAL_FEE && (
                                <p className="text-xs text-gray-500 mt-1 dark:text-white/50">
                                    After fee: <span className="font-bold text-emerald-600">{fmt(Number(amount) - WITHDRAWAL_FEE)}</span>
                                    <span className="text-gray-400 dark:text-white/35"> (fee: ₹{WITHDRAWAL_FEE})</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 dark:text-white/55">Withdrawal method</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "upi", label: "UPI" },
                                    { id: "bank", label: "Bank account" },
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setWithdrawMethod(method.id)}
                                        className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                                            withdrawMethod === method.id
                                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-cyan-300/40 dark:bg-cyan-400/10 dark:text-cyan-100"
                                                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55"
                                        }`}
                                    >
                                        {method.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {withdrawMethod === "upi" ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 dark:text-white/55">UPI ID</label>
                                <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                                    placeholder="yourname@upi" className={inpStyle} />
                            </div>
                        ) : (
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 dark:text-white/55">Account holder name</label>
                                    <input type="text" value={bankDetails.accountHolderName} onChange={e => updateBankDetails("accountHolderName", e.target.value)}
                                        placeholder="Name as per bank" className={inpStyle} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 dark:text-white/55">Account number</label>
                                    <input type="text" inputMode="numeric" value={bankDetails.accountNumber} onChange={e => updateBankDetails("accountNumber", e.target.value)}
                                        placeholder="Bank account number" className={inpStyle} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 dark:text-white/55">IFSC code</label>
                                    <input type="text" value={bankDetails.ifscCode} onChange={e => updateBankDetails("ifscCode", e.target.value.toUpperCase())}
                                        placeholder="HDFC0001234" className={inpStyle} />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5 dark:text-white/55">Bank name</label>
                                    <input type="text" value={bankDetails.bankName} onChange={e => updateBankDetails("bankName", e.target.value)}
                                        placeholder="Optional" className={inpStyle} />
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-100">
                            Admin approval is required. The requested amount is held from your wallet until approved or rejected.
                        </div>

                        <div className="flex gap-3">
                            <button onClick={resetWithdrawalForm} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl cursor-pointer border-none dark:bg-white/10 dark:text-white/70">Cancel</button>
                            <button onClick={handleWithdraw} disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm rounded-xl cursor-pointer border-none disabled:opacity-60">
                                {loading ? "Submitting..." : "Request Withdrawal"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-0.5 border-b border-gray-200 dark:border-white/10">
                    {[["transactions", "Transactions"], ["withdrawals", "Withdrawals"]].map(([id, label]) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px cursor-pointer bg-transparent
                ${activeTab === id ? "border-blue-500 text-blue-600 dark:border-cyan-300 dark:text-cyan-200" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-white/45 dark:hover:text-white/70"}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Transactions */}
                {activeTab === "transactions" && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                        {!wallet?.transactions?.length ? (
                            <div className="py-12 text-center text-gray-400 text-sm dark:text-white/40">No transactions yet</div>
                        ) : [...(wallet.transactions)].reverse().map((t, i) => (
                            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition dark:border-white/10 dark:hover:bg-white/[0.05]">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0
                  ${t.type === "credit" ? "bg-emerald-50 dark:bg-emerald-400/10" : "bg-rose-50 dark:bg-rose-400/10"}`}>
                                    {t.type === "credit" ? "⬆️" : "⬇️"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate dark:text-white">{t.description || t.type}</p>
                                    <p className="text-xs text-gray-400 dark:text-white/35">{new Date(t.createdAt).toLocaleDateString("en-IN")}</p>
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
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
                        {!withdrawals.length ? (
                            <div className="py-12 text-center text-gray-400 text-sm dark:text-white/40">No withdrawals yet</div>
                        ) : withdrawals.map((w) => (
                            <div key={w._id} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition dark:border-white/10 dark:hover:bg-white/[0.05]">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-base flex-shrink-0 dark:bg-cyan-400/10">🏦</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-white">{fmt(w.amount)} → {getWithdrawalDestination(w)}</p>
                                    <p className="text-xs text-gray-400 dark:text-white/35">Fee: ₹{w.fee} · Final: {fmt(w.finalAmount)}</p>
                                    <p className="text-xs text-gray-400 dark:text-white/35">{new Date(w.createdAt).toLocaleDateString("en-IN")}</p>
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
