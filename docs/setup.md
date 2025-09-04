# FastFlow Setup Guide

This guide will walk you through setting up FastFlow for development and production.

## Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account
- OpenAI API account (or OpenRouter)
- Stripe account (for payments)

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/your-org/fastflow.git
cd fastflow
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - Configure authorized domains for production

3. **Set up Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own fasting sessions
    match /fastingSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Users can read/write their own journal entries
    match /journalEntries/{entryId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

4. **Configure Storage**
   - Go to Storage
   - Set up storage bucket
   - Configure storage rules:

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

5. **Get Firebase Config**
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Add a web app
   - Copy the config object and add to your `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:your_app_id
```

### 4. OpenAI Setup

1. **Get API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/)
   - Create an account and get your API key
   - Add to `.env`:

```env
VITE_OPENAI_API_KEY=sk-your_openai_api_key
```

2. **Alternative: OpenRouter**
   - For access to multiple models, use [OpenRouter](https://openrouter.ai/)
   - Get your API key and add:

```env
VITE_OPENROUTER_API_KEY=sk-or-your_openrouter_key
```

### 5. Stripe Setup (Optional)

1. **Create Stripe Account**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Complete account setup

2. **Get API Keys**
   - Go to Developers > API keys
   - Copy the publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

3. **Create Products and Prices**
   - Go to Products
   - Create a "Pro Plan" product
   - Add a recurring price ($5/month)
   - Copy the price ID:

```env
VITE_STRIPE_PRO_PRICE_ID=price_your_pro_price_id
```

4. **Set up Webhooks** (for production)
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the app.

## Production Deployment

### 1. Build the Application

```bash
npm run build
```

### 2. Environment Variables

Set up production environment variables:

```env
NODE_ENV=production
VITE_APP_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api

# Use production Firebase config
VITE_FIREBASE_API_KEY=prod_api_key
# ... other prod Firebase config

# Use production OpenAI key
VITE_OPENAI_API_KEY=sk-prod_openai_key

# Use production Stripe keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
VITE_STRIPE_PRO_PRICE_ID=price_live_pro_price_id
```

### 3. Deploy Options

#### Option A: Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Option B: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

#### Option C: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Option D: Docker
```bash
docker build -t fastflow .
docker run -p 3000:3000 fastflow
```

### 4. Backend API (Required for Stripe)

For Stripe functionality, you'll need a backend API. Here's a minimal Express.js setup:

```javascript
// server.js
const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const app = express()

app.use(express.json())

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerId } = req.body
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: req.body.successUrl,
      cancel_url: req.body.cancelUrl,
    })
    
    res.json({ sessionId: session.id })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create portal session
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })
    
    res.json({ url: session.url })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Webhook handler
app.post('/api/stripe-webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature']
  let event
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed.`)
  }
  
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      // Update user subscription status in Firebase
      break
    case 'customer.subscription.deleted':
      // Cancel user subscription in Firebase
      break
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
  
  res.json({received: true})
})

app.listen(3001, () => {
  console.log('Server running on port 3001')
})
```

## Testing

### Run Tests
```bash
npm run test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Onboarding flow with AI plan generation
- [ ] Fasting timer functionality
- [ ] Voice recording and playback
- [ ] Progress tracking and analytics
- [ ] Subscription upgrade flow
- [ ] Settings and profile management

## Troubleshooting

### Common Issues

1. **Firebase Permission Denied**
   - Check Firestore security rules
   - Ensure user is authenticated
   - Verify user ID matches document owner

2. **OpenAI API Errors**
   - Check API key validity
   - Monitor usage limits
   - Handle rate limiting gracefully

3. **Stripe Checkout Issues**
   - Verify publishable key
   - Check price ID exists
   - Ensure webhook endpoint is accessible

4. **Voice Recording Not Working**
   - Check browser permissions
   - Ensure HTTPS in production
   - Test microphone access

### Debug Mode

Enable debug mode for detailed logging:
```env
VITE_DEBUG=true
```

## Security Considerations

1. **API Keys**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Firebase Security**
   - Implement proper security rules
   - Use Firebase Auth for user verification
   - Validate data on both client and server

3. **Stripe Security**
   - Use webhook signatures
   - Validate events server-side
   - Never trust client-side payment data

## Performance Optimization

1. **Code Splitting**
   - Lazy load routes
   - Split vendor bundles
   - Use dynamic imports

2. **Caching**
   - Cache API responses
   - Use service workers
   - Implement offline functionality

3. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor performance metrics
   - Track user analytics

## Support

- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues
- **Community**: Discord/Slack
- **Email**: support@fastflow.app

---

**Need help?** Join our [Discord community](https://discord.gg/fastflow) or [open an issue](https://github.com/your-org/fastflow/issues).
