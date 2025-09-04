import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo')

export const getStripe = () => stripePromise

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    priceId: null,
    features: [
      'Basic fasting timer',
      'Progress tracking',
      'Simple statistics',
      'Community support'
    ],
    limitations: [
      'No AI coaching',
      'No voice journaling',
      'Limited analytics',
      'No adaptive plans'
    ]
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    price: 5,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_demo_pro',
    features: [
      'AI-powered coaching',
      'Adaptive plan adjustments',
      'Voice journaling with transcription',
      'Advanced mood analysis',
      'Detailed progress analytics',
      'Priority support',
      'Custom fasting schedules',
      'Export data'
    ],
    limitations: []
  }
}

// Create checkout session for subscription
export const createCheckoutSession = async (priceId, customerId = null) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId,
        successUrl: `${window.location.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/settings`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    
    const stripe = await getStripe()
    const { error } = await stripe.redirectToCheckout({ sessionId })
    
    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

// Create customer portal session for subscription management
export const createPortalSession = async (customerId) => {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        returnUrl: `${window.location.origin}/settings`,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create portal session')
    }

    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Error creating portal session:', error)
    throw error
  }
}

// Verify subscription status
export const verifySubscription = async (sessionId) => {
  try {
    const response = await fetch(`/api/verify-subscription?session_id=${sessionId}`)
    
    if (!response.ok) {
      throw new Error('Failed to verify subscription')
    }

    return await response.json()
  } catch (error) {
    console.error('Error verifying subscription:', error)
    throw error
  }
}

// Check if user has access to pro features
export const hasProAccess = (subscriptionStatus) => {
  return subscriptionStatus === 'pro' || subscriptionStatus === 'active'
}

// Get feature availability based on subscription
export const getFeatureAccess = (subscriptionStatus) => {
  const isPro = hasProAccess(subscriptionStatus)
  
  return {
    aiCoaching: isPro,
    voiceJournaling: isPro,
    adaptivePlans: isPro,
    advancedAnalytics: isPro,
    moodAnalysis: isPro,
    customSchedules: isPro,
    dataExport: isPro,
    prioritySupport: isPro,
    
    // Free features
    basicTimer: true,
    progressTracking: true,
    simpleStats: true,
    communitySupport: true
  }
}

export default {
  getStripe,
  SUBSCRIPTION_PLANS,
  createCheckoutSession,
  createPortalSession,
  verifySubscription,
  hasProAccess,
  getFeatureAccess
}
