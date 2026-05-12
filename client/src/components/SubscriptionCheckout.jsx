import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { X, Loader } from 'lucide-react'
import { createSubscriptionOrder, verifySubscriptionPayment, fetchUserPlan } from '../features/subscription/planSlice'
import { PLANS } from '../config/planFeatures'
import { loadRazorpayCheckout } from '../utils/loadRazorpay'

const formatFeatureLabel = (key, value) => {
    switch (key) {
        case "maxBids":
            return value === "unlimited" ? "Unlimited monthly bids" : `${value} monthly bids`
        case "visibility":
            return `${String(value).charAt(0).toUpperCase()}${String(value).slice(1)} search visibility`
        case "platformFee":
            return `${Math.round(value * 100)}% platform fee`
        case "badge":
            return value ? `${value} profile badge` : "No profile badge"
        case "prioritySupport":
            return value ? "Priority support" : "Standard support"
        case "featuredListing":
            return value ? "Featured listing" : "Standard listing"
        default:
            return key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())
    }
}

const isIncludedFeature = (key, value) => {
    if (key === "badge" && !value) return false
    return value !== false && value !== null && value !== undefined
}

const SubscriptionCheckout = ({ isOpen, onClose, planId, planType }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const { loading: orderLoading, error, errorMsg } = useSelector((s) => s.subscription)
    const { user } = useSelector((s) => s.auth)

    const plan = PLANS[planId]

    const handleFreeUpgrade = useCallback(async () => {
        try {
            setLoading(true)
            await dispatch(
                createSubscriptionOrder({
                    planId: planId,
                    planType: "monthly",
                })
            ).unwrap()

            toast.success("🎉 Free plan activated! Welcome aboard 🚀")
            await new Promise((r) => setTimeout(r, 1500))
            onClose?.()
            setLoading(false)
        } catch (err) {
            toast.error(err || "Failed to activate plan")
            setLoading(false)
        }
    }, [dispatch, onClose, planId])

    useEffect(() => {
        if (!isOpen) return

        if (plan?.monthlyPrice === 0 && plan?.yearlyPrice === 0) {
            const timer = setTimeout(() => {
                handleFreeUpgrade()
            }, 0)

            return () => clearTimeout(timer)
        }
    }, [handleFreeUpgrade, isOpen, plan?.monthlyPrice, plan?.yearlyPrice])

    const handlePaymentClick = async () => {
        try {
            if (!user) {
                toast.error("Please login first")
                navigate("/login")
                return
            }

            let RazorpayCheckout
            try {
                RazorpayCheckout = await loadRazorpayCheckout()
            } catch (error) {
                toast.error(error.message)
                return
            }

            setLoading(true)

            let orderResult
            try {
                orderResult = await dispatch(
                    createSubscriptionOrder({
                        planId: planId,
                        planType: planType,
                    })
                ).unwrap()
            } catch (orderErr) {
                const errorMsg = typeof orderErr === "string" ? orderErr : orderErr?.message || "Failed to create order"
                console.error("❌ Order creation failed:", orderErr)
                toast.error(errorMsg)
                setLoading(false)
                return
            }

            if (!orderResult?.orderId || !orderResult?.razorpayKeyId) {
                console.error("❌ Invalid order response fields:", {
                    hasOrderId: !!orderResult?.orderId,
                    hasRazorpayKeyId: !!orderResult?.razorpayKeyId,
                    fullResponse: orderResult,
                    responseKeys: orderResult ? Object.keys(orderResult) : [],
                    orderId: orderResult?.orderId,
                    razorpayKeyId: orderResult?.razorpayKeyId,
                    amount: orderResult?.amount,
                    planId: orderResult?.planId,
                    planType: orderResult?.planType
                })
                toast.error("Invalid order data from server")
                setLoading(false)
                return
            }

            const options = {
                key: orderResult.razorpayKeyId,
                amount: orderResult.amount * 100, // Convert ₹ to paise
                currency: "INR",
                name: "Co.worker",
                description: `Upgrade to ${plan.name} - ${planType}`,
                order_id: orderResult.orderId,
                
                handler: async (response) => {
                    try {
                        await dispatch(
                            verifySubscriptionPayment({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            })
                        ).unwrap()

                        await dispatch(fetchUserPlan()).unwrap()

                        toast.success(
                            `✅ Payment successful! ${plan.name} plan activated 🚀`
                        )

                        // Close modal after success
                        await new Promise((r) => setTimeout(r, 1500))
                        onClose?.()
                    } catch (verifyErr) {
                        const errorMsg = typeof verifyErr === "string" ? verifyErr : verifyErr?.message || "Payment verification failed"
                        console.error("❌ Verification failed:", verifyErr)
                        toast.error(errorMsg)
                    }
                },
                
                modal: {
                    ondismiss: () => {
                        setLoading(false)
                    }
                },
                
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone || "",
                },
                
                theme: {
                    color: "#3B7FF5",
                },
            }

            const razorpayInstance = new RazorpayCheckout(options)
            
            razorpayInstance.on("payment.failed", (response) => {
                const errorMsg = response?.error?.description || "Payment failed"
                console.error("❌ Payment failed:", response)
                toast.error(`❌ ${errorMsg}`)
                setLoading(false)
            })

            razorpayInstance.open()
            setLoading(false)

        } catch (err) {
            const errorMsg = typeof err === "string" ? err : err?.message || "Failed to process payment"
            console.error("❌ Payment error:", err)
            toast.error(errorMsg)
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const amount = planType === "monthly" ? plan.monthlyPrice : plan.yearlyPrice
    const isFree = amount === 0

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 animate-scale-in dark:border-white/10 dark:bg-slate-950 dark:shadow-black/60">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.03]">
                        <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                            Upgrade to {plan?.name}
                        </h2>
                        <button
                            onClick={onClose}
                            aria-label="Close checkout"
                            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Plan Details */}
                        <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eefcff_100%)] p-5 shadow-inner shadow-white dark:border-cyan-400/20 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.98)_0%,rgba(8,47,73,0.68)_100%)] dark:shadow-none">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-slate-950 text-lg dark:text-white">
                                        {plan?.name} Plan
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1 dark:text-slate-400">
                                        {planType === "monthly"
                                            ? "Renew monthly"
                                            : "Renew yearly"}
                                    </p>
                                </div>
                                {plan?.badge && (
                                    <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-sm dark:bg-cyan-300 dark:text-slate-950">
                                        {plan.badge}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                {Object.entries(plan?.features || {}).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className={`flex items-center gap-2 text-sm ${
                                            isIncludedFeature(key, value)
                                                ? "text-slate-700 dark:text-slate-200"
                                                : "text-slate-400 dark:text-slate-500"
                                        }`}
                                    >
                                        <span className={isIncludedFeature(key, value) ? "text-emerald-500 dark:text-emerald-300" : "text-slate-400 dark:text-slate-500"}>
                                            {isIncludedFeature(key, value) ? "✓" : "×"}
                                        </span>
                                        <span>{formatFeatureLabel(key, value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        {!isFree && (
                            <div className="text-center">
                                <div className="text-4xl font-bold text-slate-950 dark:text-white">
                                    ₹{amount}
                                </div>
                                <p className="text-sm text-slate-500 mt-2 dark:text-slate-400">
                                    {planType === "monthly" ? "per month" : "per year"}
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && errorMsg && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-400/20">
                                <p className="text-sm text-red-700 dark:text-red-200">{errorMsg}</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={isFree ? handleFreeUpgrade : handlePaymentClick}
                            disabled={loading || orderLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold py-3 rounded-xl transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 dark:shadow-cyan-950/30"
                        >
                            {loading || orderLoading ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Processing...
                                </>
                            ) : isFree ? (
                                "Activate Free Plan"
                            ) : (
                                `Pay ₹${amount}`
                            )}
                        </button>

                        {/* Terms */}
                        <p className="text-xs text-slate-500 text-center dark:text-slate-400">
                            By proceeding, you agree to our terms of service.
                            <br />
                            {isFree
                                ? "You can cancel anytime."
                                : "Your subscription will renew automatically."}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SubscriptionCheckout
