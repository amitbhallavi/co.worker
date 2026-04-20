// ===== FILE: client/src/pages/AdminPayments.jsx =====
// Add to App.jsx:  <Route path="/admin/payments" element={<AdminPayments />} />
// Add link in AdminDashboard sidebar

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import {
    fetchAllPayments,
    fetchAllWithdrawals,
    processWithdrawal,
} from "../features/wallet/walletSlice"

const fmt = (n = 0) => `₹${Number(n).toLocaleString("en-IN")}`

const Badge = ({ label }) => {
    const map = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        escrow: "bg-blue-100  text-blue-700  border-blue-200",
        released: "bg-teal-100  text-teal-700  border-teal-200",
        failed: "bg-rose-100  text-rose-700  border-rose-200",
        approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
        rejected: "bg-rose-100  text-rose-700  border-rose-200",
    }
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[label] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {label}
        </span>
    )
}

const AdminPayments = () => {
    const dispatch = useDispatch()
    const { allPayments, allWithdrawals } = useSelector(s => s.wallet)
    const [tab, setTab] = useState("payments")
    const [processing, setProcessing] = useState(null)
    const [note, setNote] = useState("")

    useEffect(() => {
        dispatch(fetchAllPayments())
        dispatch(fetchAllWithdrawals())
    }, [dispatch])

    const totalRevenue = allPayments.filter(p => p.status !== "pending" && p.status !== "failed").reduce((s, p) => s + p.platformFee, 0)
    const totalEscrow = allPayments.filter(p => p.status === "escrow").reduce((s, p) => s + p.totalAmount, 0)
    const pendingWithdr = allWithdrawals.filter(w => w.status === "pending").length

    const handleProcess = async (id, status) => {
        try {
            await dispatch(processWithdrawal({ id, status, adminNote: note })).unwrap()
            toast.success(`Withdrawal ${status}`)
            setProcessing(null)
            setNote("")
        } catch (err) { toast.error(err) }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4" style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <div className="max-w-5xl mx-auto space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">💳 Payment Management</h1>
                    <p className="text-sm text-gray-500">Escrow system · Withdrawal approvals · Revenue tracking</p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Platform Revenue", value: fmt(totalRevenue), color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
                        { label: "In Escrow", value: fmt(totalEscrow), color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
                        { label: "Total Payments", value: allPayments.length, color: "text-gray-900", bg: "bg-white border-gray-200" },
                        { label: "Pending Withdrawals", value: pendingWithdr, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
                    ].map(c => (
                        <div key={c.label} className={`rounded-2xl p-4 border ${c.bg} text-center`}>
                            <p className={`text-xl font-black ${c.color}`}>{c.value}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{c.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-0.5 border-b border-gray-200">
                    {[["payments", `Payments (${allPayments.length})`], ["withdrawals", `Withdrawals (${allWithdrawals.length})`]].map(([id, label]) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px cursor-pointer bg-transparent
                ${tab === id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Payments Table */}
                {tab === "payments" && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {["Project", "Client", "Freelancer", "Total", "Fee", "Freelancer Gets", "Status", "Date"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!allPayments.length ? (
                                        <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No payments yet</td></tr>
                                    ) : allPayments.map(p => (
                                        <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-medium text-gray-900 max-w-[160px] truncate">{p.project?.title || "—"}</td>
                                            <td className="px-4 py-3 text-gray-600">{p.client?.name || "—"}</td>
                                            <td className="px-4 py-3 text-gray-600">{p.freelancer?.name || "—"}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">{fmt(p.totalAmount)}</td>
                                            <td className="px-4 py-3 text-rose-600">₹{p.platformFee}</td>
                                            <td className="px-4 py-3 font-semibold text-emerald-600">{fmt(p.freelancerAmount)}</td>
                                            <td className="px-4 py-3"><Badge label={p.status} /></td>
                                            <td className="px-4 py-3 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Withdrawals */}
                {tab === "withdrawals" && (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        {["Freelancer", "Amount", "Fee", "Final", "UPI", "Status", "Date", "Actions"].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!allWithdrawals.length ? (
                                        <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">No withdrawals yet</td></tr>
                                    ) : allWithdrawals.map(w => (
                                        <tr key={w._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-medium text-gray-900">{w.user?.name || "—"}</td>
                                            <td className="px-4 py-3 font-semibold text-gray-900">{fmt(w.amount)}</td>
                                            <td className="px-4 py-3 text-rose-600">₹{w.fee}</td>
                                            <td className="px-4 py-3 font-semibold text-emerald-600">{fmt(w.finalAmount)}</td>
                                            <td className="px-4 py-3 text-xs text-gray-600">{w.upiId}</td>
                                            <td className="px-4 py-3"><Badge label={w.status} /></td>
                                            <td className="px-4 py-3 text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString("en-IN")}</td>
                                            <td className="px-4 py-3">
                                                {w.status === "pending" ? (
                                                    processing === w._id ? (
                                                        <div className="flex items-center gap-2">
                                                            <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optional)"
                                                                className="text-xs px-2 py-1 border border-gray-200 rounded-lg outline-none w-28" />
                                                            <button onClick={() => handleProcess(w._id, "approved")}
                                                                className="text-xs px-2 py-1 bg-emerald-500 text-white rounded-lg cursor-pointer border-none hover:bg-emerald-600">✓</button>
                                                            <button onClick={() => handleProcess(w._id, "rejected")}
                                                                className="text-xs px-2 py-1 bg-rose-500 text-white rounded-lg cursor-pointer border-none hover:bg-rose-600">✗</button>
                                                            <button onClick={() => setProcessing(null)}
                                                                className="text-xs text-gray-400 cursor-pointer bg-transparent border-none">Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => setProcessing(w._id)}
                                                            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                                                            Process
                                                        </button>
                                                    )
                                                ) : (
                                                    <span className="text-xs text-gray-400">{w.adminNote || "—"}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminPayments