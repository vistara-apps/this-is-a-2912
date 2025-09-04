import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { 
  SUBSCRIPTION_PLANS, 
  createCheckoutSession, 
  createPortalSession,
  verifySubscription,
  hasProAccess,
  getFeatureAccess
} from '../config/stripe'
import { Crown, Check, X, Loader2 } from 'lucide-react'

export const SubscriptionManager = ({ className }) => {
  const { userProfile, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Check for successful subscription on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const sessionId = urlParams.get('session_id')
    
    if (sessionId) {
      handleSubscriptionSuccess(sessionId)
    }
  }, [])

  const handleSubscriptionSuccess = async (sessionId) => {
    try {
      setLoading(true)
      const subscriptionData = await verifySubscription(sessionId)
      
      if (subscriptionData.success) {
        await updateUserProfile({
          subscriptionStatus: 'pro',
          stripeCustomerId: subscriptionData.customerId,
          subscriptionId: subscriptionData.subscriptionId
        })
        
        setSuccess('Welcome to FastFlow Pro! Your subscription is now active.')
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } catch (error) {
      console.error('Error verifying subscription:', error)
      setError('There was an issue verifying your subscription. Please contact support.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      setLoading(true)
      setError(null)
      
      await createCheckoutSession(
        SUBSCRIPTION_PLANS.PRO.priceId,
        userProfile?.stripeCustomerId
      )
    } catch (error) {
      console.error('Error creating checkout session:', error)
      setError('Failed to start checkout process. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (userProfile?.stripeCustomerId) {
        await createPortalSession(userProfile.stripeCustomerId)
      } else {
        setError('No customer ID found. Please contact support.')
      }
    } catch (error) {
      console.error('Error creating portal session:', error)
      setError('Failed to open subscription management. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isPro = hasProAccess(userProfile?.subscriptionStatus)
  const features = getFeatureAccess(userProfile?.subscriptionStatus)

  return (
    <div className={className}>
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Current Plan Status */}
      <Card variant="elevated" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${isPro ? 'bg-secondary/20' : 'bg-white/10'}`}>
              <Crown className={`h-5 w-5 ${isPro ? 'text-secondary' : 'text-white/50'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {isPro ? SUBSCRIPTION_PLANS.PRO.name : SUBSCRIPTION_PLANS.FREE.name}
              </h3>
              <p className="text-white/60 text-sm">
                {isPro ? `$${SUBSCRIPTION_PLANS.PRO.price}/month` : 'Free forever'}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isPro 
              ? 'bg-secondary/20 text-secondary' 
              : 'bg-white/10 text-white/70'
          }`}>
            {isPro ? 'Pro' : 'Free'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isPro ? (
            <Button
              onClick={handleUpgrade}
              disabled={loading}
              size="lg"
              className="w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4" />
                  <span>Upgrade to Pro - ${SUBSCRIPTION_PLANS.PRO.price}/month</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              variant="outline"
              size="lg"
              className="w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Manage Subscription</span>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={`relative ${!isPro ? 'ring-2 ring-primary' : ''}`}>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">Free Plan</h3>
              <div className="text-2xl font-bold text-white">$0</div>
              <div className="text-white/60 text-sm">Forever</div>
            </div>

            <div className="space-y-3">
              {SUBSCRIPTION_PLANS.FREE.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
              
              {SUBSCRIPTION_PLANS.FREE.limitations.map((limitation, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <X className="h-4 w-4 text-red-400 flex-shrink-0" />
                  <span className="text-white/60 text-sm">{limitation}</span>
                </div>
              ))}
            </div>

            {!isPro && (
              <div className="absolute -top-2 -right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                Current
              </div>
            )}
          </div>
        </Card>

        {/* Pro Plan */}
        <Card className={`relative ${isPro ? 'ring-2 ring-secondary' : ''}`}>
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white flex items-center justify-center space-x-2">
                <Crown className="h-5 w-5 text-secondary" />
                <span>Pro Plan</span>
              </h3>
              <div className="text-2xl font-bold text-white">${SUBSCRIPTION_PLANS.PRO.price}</div>
              <div className="text-white/60 text-sm">per month</div>
            </div>

            <div className="space-y-3">
              {SUBSCRIPTION_PLANS.PRO.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span className="text-white/80 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {isPro && (
              <div className="absolute -top-2 -right-2 bg-secondary text-white text-xs px-2 py-1 rounded-full">
                Current
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Feature Access Info */}
      <Card className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-4">Your Feature Access</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-white/80">Available Features</h4>
            <div className="space-y-1">
              {Object.entries(features).filter(([_, available]) => available).map(([feature, _]) => (
                <div key={feature} className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-green-400" />
                  <span className="text-white/70 text-sm capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!isPro && (
            <div className="space-y-2">
              <h4 className="font-medium text-white/80">Upgrade to Unlock</h4>
              <div className="space-y-1">
                {Object.entries(features).filter(([_, available]) => !available).map(([feature, _]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Crown className="h-3 w-3 text-secondary" />
                    <span className="text-white/60 text-sm capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default SubscriptionManager
