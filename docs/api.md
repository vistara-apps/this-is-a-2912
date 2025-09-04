# FastFlow API Documentation

This document describes the API integrations and backend requirements for FastFlow.

## Overview

FastFlow integrates with several external APIs and requires a backend service for payment processing. The application uses:

- **Firebase**: Authentication, database, and storage
- **OpenAI**: AI coaching and transcription
- **Stripe**: Payment processing and subscriptions
- **Backend API**: Custom endpoints for Stripe integration

## Firebase Integration

### Authentication

FastFlow uses Firebase Authentication with email/password sign-in.

#### User Registration
```javascript
import { createUserWithEmailAndPassword } from 'firebase/auth'

const signup = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  return userCredential.user
}
```

#### User Login
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth'

const login = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password)
  return userCredential.user
}
```

### Firestore Database

#### Data Models

**User Profile**
```javascript
{
  userId: string,
  email: string,
  age: number,
  gender: 'male' | 'female' | 'other',
  weight: number,
  goal: 'Fat Loss' | 'Increased Energy' | 'Gut Health' | 'Mental Clarity' | 'General Wellness',
  sleepTime: string, // HH:MM format
  wakeTime: string,  // HH:MM format
  currentFastingPlan: {
    fastingHours: number,
    eatingHours: number,
    schedule: string,
    startTime: string,
    endTime: string,
    rationale: string,
    tips: string[]
  },
  subscriptionStatus: 'free' | 'pro',
  stripeCustomerId: string,
  subscriptionId: string,
  onboardingCompleted: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Fasting Session**
```javascript
{
  sessionId: string,
  userId: string,
  startTime: timestamp,
  endTime: timestamp,
  duration: number, // hours
  status: 'active' | 'completed' | 'missed',
  createdAt: timestamp
}
```

**Journal Entry**
```javascript
{
  entryId: string,
  userId: string,
  timestamp: timestamp,
  mood: 'positive' | 'neutral' | 'negative',
  notes: string,
  voiceRecordingUrl: string, // Firebase Storage URL
  transcribedText: string,
  createdAt: timestamp
}
```

#### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /fastingSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### Firebase Storage

Voice recordings are stored in Firebase Storage with the following structure:
```
voice-recordings/
  {userId}/
    {entryId}.webm
```

#### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /voice-recordings/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## OpenAI Integration

### Fasting Plan Generation

**Endpoint**: `/v1/chat/completions`

**Request**:
```javascript
const generateFastingPlan = async (userProfile) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are an expert intermittent fasting coach...'
      }, {
        role: 'user',
        content: `Create a personalized fasting plan for: ${JSON.stringify(userProfile)}`
      }],
      temperature: 0.7,
      max_tokens: 1000
    })
  })
  
  return response.json()
}
```

### Voice Transcription

**Endpoint**: `/v1/audio/transcriptions`

**Request**:
```javascript
const transcribeAudio = async (audioBlob) => {
  const formData = new FormData()
  formData.append('file', audioBlob, 'recording.webm')
  formData.append('model', 'whisper-1')
  
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  })
  
  return response.json()
}
```

### Daily Check-in Analysis

**Request**:
```javascript
const analyzeDailyFeedback = async (feedback, currentPlan) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'system',
        content: 'You are an AI fasting coach. Analyze user feedback and suggest plan adjustments...'
      }, {
        role: 'user',
        content: `Feedback: ${feedback}, Current Plan: ${JSON.stringify(currentPlan)}`
      }],
      temperature: 0.5,
      max_tokens: 500
    })
  })
  
  return response.json()
}
```

## Stripe Integration

### Required Backend Endpoints

#### Create Checkout Session

**Endpoint**: `POST /api/create-checkout-session`

**Request Body**:
```json
{
  "priceId": "price_1234567890",
  "customerId": "cus_1234567890",
  "successUrl": "https://app.com/settings?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://app.com/settings"
}
```

**Response**:
```json
{
  "sessionId": "cs_1234567890"
}
```

**Implementation**:
```javascript
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerId, successUrl, cancelUrl } = req.body
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    })
    
    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

#### Create Portal Session

**Endpoint**: `POST /api/create-portal-session`

**Request Body**:
```json
{
  "customerId": "cus_1234567890",
  "returnUrl": "https://app.com/settings"
}
```

**Response**:
```json
{
  "url": "https://billing.stripe.com/session/..."
}
```

#### Verify Subscription

**Endpoint**: `GET /api/verify-subscription?session_id={sessionId}`

**Response**:
```json
{
  "success": true,
  "customerId": "cus_1234567890",
  "subscriptionId": "sub_1234567890",
  "status": "active"
}
```

#### Webhook Handler

**Endpoint**: `POST /api/stripe-webhook`

**Headers**: 
- `stripe-signature`: Webhook signature for verification

**Events to Handle**:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

**Implementation**:
```javascript
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object
      await updateUserSubscription(subscription.customer, 'pro', subscription.id)
      break
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object
      await updateUserSubscription(deletedSubscription.customer, 'free', null)
      break
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object
      await handlePaymentFailure(failedInvoice.customer)
      break
      
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  
  res.json({received: true})
})
```

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  }
}
```

### Common Error Codes

- `AUTH_INVALID_CREDENTIALS`: Invalid login credentials
- `AUTH_USER_NOT_FOUND`: User account not found
- `FIREBASE_PERMISSION_DENIED`: Insufficient permissions
- `OPENAI_RATE_LIMIT`: API rate limit exceeded
- `STRIPE_CARD_DECLINED`: Payment method declined
- `VALIDATION_ERROR`: Invalid input data

## Rate Limiting

### OpenAI API Limits
- **GPT-4**: 10,000 tokens per minute
- **Whisper**: 50 requests per minute

### Recommended Strategies
- Implement exponential backoff for retries
- Cache AI responses when possible
- Use request queuing for high-traffic scenarios

## Security Considerations

### API Key Management
- Store API keys in environment variables
- Use different keys for development and production
- Rotate keys regularly
- Never expose keys in client-side code

### Authentication
- Verify Firebase ID tokens on backend
- Implement proper CORS policies
- Use HTTPS in production

### Data Validation
- Validate all input data
- Sanitize user-generated content
- Implement rate limiting on endpoints

## Monitoring and Analytics

### Recommended Metrics
- API response times
- Error rates by endpoint
- User engagement metrics
- Subscription conversion rates

### Logging
- Log all API requests and responses
- Track user actions for analytics
- Monitor system performance

## Testing

### Unit Tests
```javascript
// Example test for fasting plan generation
describe('generateFastingPlan', () => {
  it('should generate a valid fasting plan', async () => {
    const userProfile = {
      age: 30,
      gender: 'male',
      weight: 75,
      goal: 'Fat Loss',
      sleepTime: '23:00',
      wakeTime: '07:00'
    }
    
    const plan = await generateFastingPlan(userProfile)
    
    expect(plan).toHaveProperty('fastingHours')
    expect(plan).toHaveProperty('eatingHours')
    expect(plan.fastingHours).toBeGreaterThan(12)
  })
})
```

### Integration Tests
```javascript
// Example test for Stripe integration
describe('Stripe Integration', () => {
  it('should create checkout session', async () => {
    const response = await request(app)
      .post('/api/create-checkout-session')
      .send({
        priceId: 'price_test_123',
        customerId: 'cus_test_123',
        successUrl: 'https://test.com/success',
        cancelUrl: 'https://test.com/cancel'
      })
      .expect(200)
    
    expect(response.body).toHaveProperty('sessionId')
  })
})
```

## Deployment

### Environment Variables

**Required**:
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook endpoint secret
- `OPENAI_API_KEY`: OpenAI API key
- `FIREBASE_ADMIN_SDK`: Firebase Admin SDK credentials

**Optional**:
- `SENTRY_DSN`: Error tracking
- `REDIS_URL`: Caching and sessions
- `DATABASE_URL`: Additional database if needed

### Health Checks

Implement health check endpoints:
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      stripe: 'connected',
      openai: 'connected'
    }
  })
})
```

---

For more detailed implementation examples, see the `/examples` directory in the repository.
