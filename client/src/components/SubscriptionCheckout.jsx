import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { X, Loader } from 'lucide-react'
import { createSubscriptionOrder, verifySubscriptionPayment, fetchUserPlan } from '../features/subscription/planSlice'
import { PLANS } from '../config/planFeatures'

/**
 * SubscriptionCheckout - Modal for subscription payment
 * Props:
 *   - isOpen: boolean (show/hide modal)
 *   - onClose: function() callback to close
 *   - planId: string (free|pro|elite)
 *   - planType: string (monthly|yearly)
 */
const SubscriptionCheckout = ({ isOpen, onClose, planId, planType }) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const { currentOrder, loading: orderLoading, error, errorMsg } = useSelector((s) => s.subscription)
    const { user } = useSelector((s) => s.auth)

    const plan = PLANS[planId]

    useEffect(() => {
        if (!isOpen) return

        // Handle free plan - direct activation
        if (plan?.monthlyPrice === 0 && plan?.yearlyPrice === 0) {
            handleFreeUpgrade()
        }
    }, [isOpen, planId])

    // ✅ FREE PLAN ACTIVATION
    const handleFreeUpgrade = async () => {
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
    }

    // ✅ PAID PLAN CHECKOUT
    const handlePaymentClick = async () => {
        try {
            if (!user) {
                toast.error("Please login first")
                navigate("/login")
                return
            }

            // Check if Razorpay is loaded
            if (typeof window.Razorpay === "undefined") {
                console.error("❌ Razorpay script not loaded!")
                toast.error("Payment gateway not loaded. Please refresh the page and try again.")
                return
            }

            setLoading(true)

            // Step 1: Create order on backend
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

            console.log("✅ Order created:", orderResult)

            // Step 2: Prepare Razorpay options
            const options = {
                key: orderResult.razorpayKeyId,
                amount: orderResult.amount * 100, // Convert ₹ to paise
                currency: "INR",
                name: "Co.worker",
                description: `Upgrade to ${plan.name} - ${planType}`,
                order_id: orderResult.orderId,
                
                handler: async (response) => {
                    try {
                        console.log("✅ Payment response received:", response)
                        
                        // Step 3: Verify payment on backend
                        const verifyResult = await dispatch(
                            verifySubscriptionPayment({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                            })
                        ).unwrap()

                        console.log("✅ Payment verified:", verifyResult)

                        // Step 4: Fetch updated plan
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
                        console.log("User dismissed payment modal")
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

            // Step 3: Open Razorpay checkout
            console.log("Opening Razorpay with options:", options)
            const razorpayInstance = new window.Razorpay(options)
            
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
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Upgrade to {plan?.name}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-6">
                        {/* Plan Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-100">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">
                                        {plan?.name} Plan
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {planType === "monthly"
                                            ? "Renew monthly"
                                            : "Renew yearly"}
                                    </p>
                                </div>
                                {plan?.badge && (
                                    <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                        {plan.badge}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 mb-4">
                                {Object.entries(plan?.features || {}).map(([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex items-center gap-2 text-sm text-gray-700"
                                    >
                                        <span className="text-green-500">✓</span>
                                        <span>
                                            {key === "maxBids"
                                                ? `${value} monthly bids`
                                                : key === "visibility"
                                                ? `${value} visibility`
                                                : key === "platformFee"
                                                ? `${Math.round(value * 100)}% platform fee`
                                                : key}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price */}
                        {!isFree && (
                            <div className="text-center">
                                <div className="text-4xl font-bold text-gray-900">
                                    ₹{amount}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    {planType === "monthly" ? "per month" : "per year"}
                                </p>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && errorMsg && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                                <p className="text-sm text-red-700">{errorMsg}</p>
                            </div>
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handlePaymentClick}
                            disabled={loading || orderLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                        <p className="text-xs text-gray-500 text-center">
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
