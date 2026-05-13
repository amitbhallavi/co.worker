import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"
import { createOrder, verifyPayment, releaseEscrow } from "../features/wallet/walletSlice"
import { loadRazorpayCheckout } from "../utils/loadRazorpay"

const TEST_MODE_MAX_AMOUNT = Number(import.meta.env.VITE_RAZORPAY_TEST_MAX_AMOUNT || 50000)
const isTestLimitEnabled = import.meta.env.DEV && Number.isFinite(TEST_MODE_MAX_AMOUNT) && TEST_MODE_MAX_AMOUNT > 0
const fmt = (value = 0) => `₹${Number(value || 0).toLocaleString("en-IN")}`

const PaymentModal = ({ project, onClose, onPaymentDone }) => {
    const dispatch = useDispatch()
    const { user } = useSelector(s => s.auth)
    const { loading } = useSelector(s => s.wallet)
    const [step, setStep] = useState("confirm") // confirm | paying | success | releasing | released

    if (!project) return null

    const projectId = project._id || project.id || project.project?._id || project.project
    const amount = Number(project.selectedBid?.amount ?? project.finalAmount ?? project.amount ?? 0)
    const fee = amount < 5000 ? 11 : amount < 15000 ? 19 : amount < 30000 ? 21 : 24
    const flAmount = amount - fee
    const exceedsTestLimit = isTestLimitEnabled && amount > TEST_MODE_MAX_AMOUNT
    const canPay = Boolean(projectId) && amount > 0 && !exceedsTestLimit
    const testLimitMessage = `Razorpay test mode blocks payments above ${fmt(TEST_MODE_MAX_AMOUNT)}. Use a smaller test bid or live Razorpay keys.`

    const handlePay = async () => {
        if (!projectId) {
            toast.error("Project ID missing. Refresh and try again.")
            return
        }

        if (!amount || amount <= 0) {
            toast.error("Accepted bid amount missing. Accept a valid bid before payment.")
            return
        }

        if (exceedsTestLimit) {
            toast.error(testLimitMessage)
            return
        }

        setStep("paying")

        let orderData
        try {
            const res = await dispatch(createOrder({ projectId })).unwrap()
            orderData = res
        } catch (err) {
            toast.error(typeof err === "string" ? err : "Could not create payment order")
            setStep("confirm")
            return
        }

        let RazorpayCheckout
        try {
            RazorpayCheckout = await loadRazorpayCheckout()
        } catch (error) {
            toast.error(error.message)
            setStep("confirm")
            return
        }

        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: "Co.Worker",
            description: `Payment for: ${project.title}`,
            order_id: orderData.orderId,
            prefill: { name: user?.name, email: user?.email },
            theme: { color: "#3B7FF5" },

            handler: async (response) => {
                try {
                    await dispatch(verifyPayment({
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        paymentId: orderData.paymentId,
                    })).unwrap()
                    toast.success("Payment successful — funds in escrow 🔒")
                    setStep("success")
                    onPaymentDone?.()
                } catch (err) {
                    toast.error("Payment verification failed: " + err)
                    setStep("confirm")
                }
            },

            modal: { ondismiss: () => setStep("confirm") },
        }

        const rzp = new RazorpayCheckout(options)
        rzp.open()
    }

    // ── Handle Release ─────────────────────────────────────────────────────────
    const handleRelease = async () => {
        setStep("releasing")
        try {
            await dispatch(releaseEscrow(projectId)).unwrap()
            toast.success("Payment released to freelancer! ✅")
            setStep("released")
            setTimeout(() => {
                onPaymentDone?.()
                onClose()
            }, 1500)
        } catch (err) {
            toast.error(err)
            setStep("success")
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex justify-center pt-3 pb-1 sm:hidden"><div className="w-10 h-1 rounded-full bg-gray-200" /></div>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-4 relative overflow-hidden">
                    <div className="absolute w-20 h-20 rounded-full bg-white/10 -top-6 -right-4 pointer-events-none" />
                    <button onClick={onClose} className="absolute top-3.5 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold cursor-pointer border-none">✕</button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">💳</div>
                        <div>
                            <h2 className="text-white font-black text-base">
                                {step === "released" ? "Payment Released! 🎉" : step === "releasing" ? "Releasing Payment..." : step === "success" ? "Payment in Escrow 🔒" : "Pay for Project"}
                            </h2>
                            <p className="text-blue-100 text-xs truncate">{project.title}</p>
                        </div>
                    </div>
                </div>

                {/* Breakdown */}
                <div className="px-5 py-4 space-y-3">
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                        {[
                            ["Final Price (Accepted Bid)", fmt(amount), "text-gray-900"],
                            ["Platform Fee", `-${fmt(fee)}`, "text-rose-500"],
                            ["Freelancer Receives", fmt(flAmount), "text-emerald-600 font-black"],
                        ].map(([k, v, c]) => (
                            <div key={k} className="flex justify-between text-sm">
                                <span className="text-gray-500">{k}</span>
                                <span className={c}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Escrow explanation */}
                    {step !== "released" && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-700 space-y-1">
                            <p className="font-bold">🔒 Escrow Protection</p>
                            <p>Your money is held securely by Co.Worker until the project is complete.</p>
                            <p>Release payment only after you are satisfied with the work.</p>
                        </div>
                    )}

                    {exceedsTestLimit && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold leading-5 text-amber-800">
                            {testLimitMessage}
                        </div>
                    )}

                    {step === "success" && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
                            <p className="text-2xl mb-1">✅</p>
                            <p className="text-sm font-bold text-emerald-700">Funds locked in escrow</p>
                            <p className="text-xs text-emerald-600">Release when work is done</p>
                        </div>
                    )}

                    {step === "released" && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
                            <p className="text-2xl mb-1">🎉</p>
                            <p className="text-sm font-bold text-emerald-700">Payment Released Successfully!</p>
                            <p className="text-xs text-emerald-600">Freelancer will receive after 24hr clearance</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition cursor-pointer border-none">
                        Cancel
                    </button>

                    {step === "confirm" && (
                        <button onClick={handlePay} disabled={loading || !canPay}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm rounded-xl hover:shadow-lg transition cursor-pointer border-none disabled:opacity-60">
                            {loading ? "..." : "💳 Pay Now"}
                        </button>
                    )}

                    {step === "paying" && (
                        <button disabled className="flex-1 py-3 bg-blue-300 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 border-none cursor-wait">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </button>
                    )}

                    {step === "success" && (
                        <button onClick={handleRelease} disabled={loading}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm rounded-xl hover:shadow-lg transition cursor-pointer border-none disabled:opacity-60">
                            {loading ? "..." : "✅ Release Payment"}
                        </button>
                    )}

                    {step === "releasing" && (
                        <button disabled className="flex-1 py-3 bg-emerald-300 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 border-none cursor-wait">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Releasing...
                        </button>
                    )}

                    {step === "released" && (
                        <button disabled className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 border-none">
                            <span className="text-lg">🎉</span>
                            Released!
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentModal
