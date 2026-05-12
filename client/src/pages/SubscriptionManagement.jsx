import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Clock, CheckCircle2, AlertCircle, Trash2, ChevronRight, Loader, Calendar } from 'lucide-react'
import { fetchUserPlan, fetchSubscriptionHistory, cancelSubscription } from '../features/subscription/planSlice'
import { PLANS } from '../config/planFeatures'
import SubscriptionCheckout from '../components/SubscriptionCheckout'

const SubscriptionManagement = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector(s => s.auth)
  const { currentPlan, planExpiresAt, planType, history, loading } = useSelector(s => s.subscription)

  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradePlan, setUpgradePlan] = useState(null)
  const [upgradePlanType, setUpgradePlanType] = useState('monthly')
  const [cancelLoading, setCancelLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    dispatch(fetchUserPlan())
    dispatch(fetchSubscriptionHistory())
  }, [user, dispatch, navigate])

  const handleUpgrade = (planId, planType) => {
    setUpgradePlan(planId)
    setUpgradePlanType(planType)
    setShowUpgradeModal(true)
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will be downgraded to the free plan immediately.')) {
      return
    }

    try {
      setCancelLoading(true)
      await dispatch(cancelSubscription({
        reason: 'User requested cancellation',
      })).unwrap()

      toast.success('Subscription cancelled successfully')
      dispatch(fetchUserPlan())
      setCancelLoading(false)
    } catch (error) {
      toast.error(error || 'Failed to cancel subscription')
      setCancelLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const daysUntilExpiry = () => {
    if (!planExpiresAt) return null
    const days = Math.ceil((new Date(planExpiresAt) - new Date()) / (1000 * 60 * 60 * 24))
    return days
  }

  const plan = PLANS[currentPlan] || PLANS.free
  const days = daysUntilExpiry()
  const isExpiringSoon = days && days <= 7 && days > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-gray-900 dark:from-[#020617] dark:via-[#071427] dark:to-[#020617] dark:text-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-white/10 dark:bg-[#020617]/95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Management</h1>
          <p className="text-gray-500 mt-2 dark:text-white/55">Manage your plan, upgrade, or cancel anytime</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Plan Card */}
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                {plan.name} Plan
              </h2>
              <p className="text-gray-500 dark:text-white/55">{plan.description}</p>
            </div>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-200">
              {planType === 'monthly' ? 'Monthly Billing' : 'Annual Billing'}
            </span>
          </div>

          {/* Plan Details Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 border-b border-gray-100 pb-8 dark:border-white/10 sm:grid-cols-2">
            {/* Price */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 dark:text-white/50">Current Price</p>
              <div className="flex items-baseline gap-1">
                {currentPlan === 'free' ? (
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ₹{planType === 'monthly'
                        ? plan.monthlyPrice
                        : plan.yearlyPrice
                      }
                    </span>
                    <span className="text-gray-500 dark:text-white/45">
                      /{planType === 'monthly' ? 'month' : 'year'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Expiry */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1 dark:text-white/50">Renewal Date</p>
              {planExpiresAt ? (
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600 dark:text-cyan-300" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatDate(planExpiresAt)}
                    </p>
                    {isExpiringSoon && (
                      <p className="text-sm text-amber-600 font-medium">
                        Expires in {days} day{days !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-white/45">No expiry date</p>
              )}
            </div>
          </div>

          {/* Features List */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-4 dark:text-white/65">Plan Features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(plan.features || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-white/65">
                    {key === 'maxBids' ? `${value} monthly bids` :
                     key === 'visibility' ? `${value} visibility` :
                     key === 'platformFee' ? `${Math.round(value * 100)}% platform fee` :
                     key === 'prioritySupport' ? (value ? 'Priority support' : '') :
                     key === 'featuredListing' ? (value ? 'Featured listing' : '') :
                     key === 'badge' ? `${value} badge` : key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-Renewal Status */}
        {currentPlan !== 'free' && (
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Auto-Renewal Enabled</p>
                <p className="text-sm text-gray-500 dark:text-white/50">Your plan will automatically renew on the renewal date</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {/* Upgrade/Downgrade */}
          {currentPlan !== 'elite' && (
            <button
              onClick={() => {
                const nextPlan = currentPlan === 'free' ? 'pro' : 'elite'
                handleUpgrade(nextPlan, planType || 'monthly')
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              <ChevronRight size={18} />
              Upgrade Plan
            </button>
          )}

          {/* Renew */}
          {currentPlan !== 'free' && (
            <button
              onClick={() => handleUpgrade(currentPlan, planType)}
              className="flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 font-medium text-emerald-700 transition-all hover:bg-emerald-100 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-100 dark:hover:bg-emerald-400/15"
            >
              <Clock size={18} />
              Renew Now
            </button>
          )}

          {/* Cancel */}
          {currentPlan !== 'free' && (
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-medium text-red-700 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-300/20 dark:bg-red-400/10 dark:text-red-100 dark:hover:bg-red-400/15"
            >
              {cancelLoading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Trash2 size={18} />
                  Cancel Plan
                </>
              )}
            </button>
          )}
        </div>

        {/* Subscription History */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">
          <h3 className="text-xl font-bold text-gray-900 mb-6 dark:text-white">Subscription History</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader size={24} className="animate-spin text-blue-600" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((transaction, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 dark:border-white/10 dark:bg-white/[0.05] dark:hover:border-white/20">
                  <div className="flex items-center gap-4">
                    {transaction.status === 'success' ? (
                      <CheckCircle2 size={20} className="text-green-500" />
                    ) : transaction.status === 'pending' ? (
                      <Clock size={20} className="text-amber-500" />
                    ) : transaction.status === 'failed' ? (
                      <AlertCircle size={20} className="text-red-500" />
                    ) : (
                      <Trash2 size={20} className="text-gray-400" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.plan?.charAt(0).toUpperCase() + transaction.plan?.slice(1)} Plan
                      </p>
                      <p className="text-sm text-gray-500 dark:text-white/45">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {transaction.amount === 0 ? 'Free' : `₹${transaction.amount}`}
                    </p>
                    <p className={`text-xs font-semibold capitalize ${
                      transaction.status === 'success' ? 'text-green-600' :
                      transaction.status === 'pending' ? 'text-amber-600' :
                      transaction.status === 'failed' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8 dark:text-white/45">No subscription history yet</p>
          )}
        </div>
      </div>

      {/* Subscription Checkout Modal */}
      <SubscriptionCheckout
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        planId={upgradePlan}
        planType={upgradePlanType}
      />
    </div>
  )
}

export default SubscriptionManagement
