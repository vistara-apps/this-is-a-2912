# FastFlow - AI-Powered Intermittent Fasting Coach

FastFlow is a comprehensive web application that provides personalized intermittent fasting guidance using AI technology. It combines intelligent scheduling, progress tracking, voice journaling, and adaptive coaching to help users achieve their health goals.

## 🌟 Features

### Core Features
- **AI-Driven Schedule Generation**: Personalized fasting plans based on user biometrics and goals
- **Adaptive Plan Adjustments**: Dynamic schedule modifications based on daily feedback
- **Intuitive Fasting Timer**: Real-time progress tracking with visual indicators
- **Voice Journaling & Mood Analysis**: Record thoughts with automatic transcription and AI insights

### Pro Features
- Advanced AI coaching and personalized recommendations
- Voice journaling with mood trend analysis
- Detailed progress analytics and insights
- Custom fasting schedules and plan modifications
- Priority support and feature access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Firebase project with Authentication, Firestore, and Storage enabled
- OpenAI API key (or OpenRouter for alternative models)
- Stripe account for payment processing (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/fastflow.git
   cd fastflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual configuration values:
   - Firebase configuration from your Firebase console
   - OpenAI API key from OpenAI platform
   - Stripe keys from your Stripe dashboard

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend Services**: Firebase (Auth, Firestore, Storage)
- **AI Integration**: OpenAI GPT-4 for coaching and transcription
- **Payments**: Stripe for subscription management
- **Deployment**: Docker-ready with production optimizations

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (Button, Card, etc.)
│   └── SubscriptionManager.jsx
├── contexts/           # React context providers
│   ├── AuthContext.jsx
│   └── AppContext.jsx
├── pages/              # Main application pages
├── config/             # Configuration files
│   ├── firebase.js
│   ├── openai.js
│   └── stripe.js
└── utils/              # Utility functions
```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Authentication with Email/Password
3. Set up Firestore database with the following collections:
   - `users` - User profiles and settings
   - `fastingSessions` - Fasting session records
   - `journalEntries` - Voice and text journal entries
4. Configure Storage for voice recordings

### OpenAI Integration
- Get your API key from [OpenAI Platform](https://platform.openai.com/)
- Alternatively, use [OpenRouter](https://openrouter.ai/) for access to multiple models
- Configure the API key in your environment variables

### Stripe Setup (Optional)
1. Create a Stripe account and get your API keys
2. Set up subscription products and pricing
3. Configure webhooks for subscription events
4. Add the publishable key and price IDs to your environment

## 📱 Usage

### User Journey
1. **Sign Up**: Create account with email/password
2. **Onboarding**: Complete profile setup (age, goals, schedule)
3. **AI Plan Generation**: Receive personalized fasting schedule
4. **Daily Fasting**: Use timer and track progress
5. **Journaling**: Record thoughts and mood (Pro feature)
6. **Progress Tracking**: View analytics and insights
7. **Plan Adaptation**: AI adjusts schedule based on feedback

### Key Pages
- **Landing**: Marketing page with feature overview
- **Dashboard**: Main hub with current fast status and quick actions
- **Timer**: Fasting timer with progress visualization
- **Journal**: Voice and text journaling with mood analysis
- **Progress**: Detailed analytics and achievement tracking
- **Settings**: Profile management and subscription controls

## 🔒 Security & Privacy

- **Authentication**: Secure Firebase Authentication
- **Data Protection**: All personal data encrypted in transit and at rest
- **Privacy First**: Voice recordings processed securely, no data sharing
- **GDPR Compliant**: User data control and deletion capabilities

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker Deployment
```bash
docker build -t fastflow .
docker run -p 3000:3000 fastflow
```

### Environment-Specific Configs
- Development: `.env.development`
- Staging: `.env.staging`
- Production: `.env.production`

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### E2E Testing
```bash
npm run test:e2e
```

### Component Testing
```bash
npm run test:components
```

## 📊 Analytics & Monitoring

- **User Analytics**: Track engagement and feature usage
- **Performance Monitoring**: Monitor app performance and errors
- **Health Metrics**: Track user success rates and outcomes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices and hooks patterns
- Use TypeScript for type safety (when applicable)
- Write tests for new features
- Follow the existing code style and conventions
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs and request features via GitHub Issues
- **Community**: Join our Discord community for discussions
- **Pro Support**: Priority support available for Pro subscribers

## 🗺️ Roadmap

### Upcoming Features
- [ ] Social features and community challenges
- [ ] Integration with fitness trackers
- [ ] Meal planning and nutrition guidance
- [ ] Advanced biometric tracking
- [ ] Mobile app (React Native)
- [ ] Multi-language support

### Version History
- **v1.0.0**: Initial release with core fasting features
- **v1.1.0**: Voice journaling and AI coaching
- **v1.2.0**: Advanced analytics and progress tracking
- **v1.3.0**: Subscription management and Pro features

---

**FastFlow** - Transform your health with intelligent intermittent fasting guidance. 🌟
