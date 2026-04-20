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
  const { currentPlan, planExpiresAt, planType, planStartedAt, history, loading } = useSelector(s => s.subscription)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-500 mt-2">Manage your plan, upgrade, or cancel anytime</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name} Plan
              </h2>
              <p className="text-gray-500">{plan.description}</p>
            </div>
            <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
              {planType === 'monthly' ? 'Monthly Billing' : 'Annual Billing'}
            </span>
          </div>

          {/* Plan Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-100">
            {/* Price */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Current Price</p>
              <div className="flex items-baseline gap-1">
                {currentPlan === 'free' ? (
                  <span className="text-3xl font-bold text-gray-900">Free</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900">
                      ₹{planType === 'monthly'
                        ? plan.monthlyPrice
                        : plan.yearlyPrice
                      }
                    </span>
                    <span className="text-gray-500">
                      /{planType === 'monthly' ? 'month' : 'year'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Expiry */}
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Renewal Date</p>
              {planExpiresAt ? (
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
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
                <p className="text-gray-500">No expiry date</p>
              )}
            </div>
          </div>

          {/* Features List */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-4">Plan Features</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(plan.features || {}).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {true ? (
                <>
                  <CheckCircle2 size={20} className="text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Auto-Renewal Enabled</p>
                    <p className="text-sm text-gray-500">Your plan will automatically renew on the renewal date</p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle size={20} className="text-amber-500" />
                  <div>
                    <p className="font-medium text-gray-900">Auto-Renewal Disabled</p>
                    <p className="text-sm text-gray-500">You will need to manually renew your plan</p>
                  </div>
                </>
              )}
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
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium hover:bg-emerald-100 transition-all"
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
              className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Subscription History</h3>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader size={24} className="animate-spin text-blue-600" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((transaction, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
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
                      <p className="font-medium text-gray-900">
                        {transaction.plan?.charAt(0).toUpperCase() + transaction.plan?.slice(1)} Plan
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
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
            <p className="text-center text-gray-500 py-8">No subscription history yet</p>
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
