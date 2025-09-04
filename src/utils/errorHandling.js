// Error handling utilities for FastFlow

export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true
  }
}

// Error codes for different types of errors
export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_EMAIL_ALREADY_EXISTS: 'AUTH_EMAIL_ALREADY_EXISTS',
  AUTH_WEAK_PASSWORD: 'AUTH_WEAK_PASSWORD',
  AUTH_NETWORK_ERROR: 'AUTH_NETWORK_ERROR',
  
  // Firebase errors
  FIREBASE_PERMISSION_DENIED: 'FIREBASE_PERMISSION_DENIED',
  FIREBASE_NETWORK_ERROR: 'FIREBASE_NETWORK_ERROR',
  FIREBASE_QUOTA_EXCEEDED: 'FIREBASE_QUOTA_EXCEEDED',
  
  // OpenAI errors
  OPENAI_API_ERROR: 'OPENAI_API_ERROR',
  OPENAI_RATE_LIMIT: 'OPENAI_RATE_LIMIT',
  OPENAI_INVALID_REQUEST: 'OPENAI_INVALID_REQUEST',
  OPENAI_NETWORK_ERROR: 'OPENAI_NETWORK_ERROR',
  
  // Stripe errors
  STRIPE_CARD_DECLINED: 'STRIPE_CARD_DECLINED',
  STRIPE_NETWORK_ERROR: 'STRIPE_NETWORK_ERROR',
  STRIPE_INVALID_REQUEST: 'STRIPE_INVALID_REQUEST',
  
  // Media errors
  MEDIA_PERMISSION_DENIED: 'MEDIA_PERMISSION_DENIED',
  MEDIA_NOT_SUPPORTED: 'MEDIA_NOT_SUPPORTED',
  MEDIA_RECORDING_ERROR: 'MEDIA_RECORDING_ERROR',
  
  // General errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// User-friendly error messages
export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_INVALID_CREDENTIALS]: 'Invalid email or password. Please try again.',
  [ERROR_CODES.AUTH_USER_NOT_FOUND]: 'No account found with this email address.',
  [ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS]: 'An account with this email already exists.',
  [ERROR_CODES.AUTH_WEAK_PASSWORD]: 'Password should be at least 6 characters long.',
  [ERROR_CODES.AUTH_NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  
  [ERROR_CODES.FIREBASE_PERMISSION_DENIED]: 'You don\'t have permission to perform this action.',
  [ERROR_CODES.FIREBASE_NETWORK_ERROR]: 'Unable to connect to our servers. Please try again.',
  [ERROR_CODES.FIREBASE_QUOTA_EXCEEDED]: 'Service temporarily unavailable. Please try again later.',
  
  [ERROR_CODES.OPENAI_API_ERROR]: 'AI service is temporarily unavailable. Please try again.',
  [ERROR_CODES.OPENAI_RATE_LIMIT]: 'Too many requests. Please wait a moment and try again.',
  [ERROR_CODES.OPENAI_INVALID_REQUEST]: 'Invalid request to AI service. Please try again.',
  [ERROR_CODES.OPENAI_NETWORK_ERROR]: 'Unable to connect to AI service. Please check your connection.',
  
  [ERROR_CODES.STRIPE_CARD_DECLINED]: 'Your card was declined. Please try a different payment method.',
  [ERROR_CODES.STRIPE_NETWORK_ERROR]: 'Payment processing error. Please try again.',
  [ERROR_CODES.STRIPE_INVALID_REQUEST]: 'Invalid payment request. Please contact support.',
  
  [ERROR_CODES.MEDIA_PERMISSION_DENIED]: 'Microphone access denied. Please enable microphone permissions.',
  [ERROR_CODES.MEDIA_NOT_SUPPORTED]: 'Voice recording is not supported in your browser.',
  [ERROR_CODES.MEDIA_RECORDING_ERROR]: 'Recording failed. Please try again.',
  
  [ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection and try again.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ERROR_CODES.UNKNOWN_ERROR]: 'Something went wrong. Please try again.'
}

// Parse Firebase Auth errors
export const parseFirebaseAuthError = (error) => {
  const errorCode = error.code || error.message
  
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.AUTH_INVALID_CREDENTIALS],
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        401
      )
    
    case 'auth/user-not-found':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.AUTH_USER_NOT_FOUND],
        ERROR_CODES.AUTH_USER_NOT_FOUND,
        404
      )
    
    case 'auth/email-already-in-use':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS],
        ERROR_CODES.AUTH_EMAIL_ALREADY_EXISTS,
        409
      )
    
    case 'auth/weak-password':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.AUTH_WEAK_PASSWORD],
        ERROR_CODES.AUTH_WEAK_PASSWORD,
        400
      )
    
    case 'auth/network-request-failed':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.AUTH_NETWORK_ERROR],
        ERROR_CODES.AUTH_NETWORK_ERROR,
        503
      )
    
    default:
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        ERROR_CODES.UNKNOWN_ERROR,
        500
      )
  }
}

// Parse Firestore errors
export const parseFirestoreError = (error) => {
  const errorCode = error.code || error.message
  
  switch (errorCode) {
    case 'permission-denied':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.FIREBASE_PERMISSION_DENIED],
        ERROR_CODES.FIREBASE_PERMISSION_DENIED,
        403
      )
    
    case 'unavailable':
    case 'deadline-exceeded':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.FIREBASE_NETWORK_ERROR],
        ERROR_CODES.FIREBASE_NETWORK_ERROR,
        503
      )
    
    case 'resource-exhausted':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.FIREBASE_QUOTA_EXCEEDED],
        ERROR_CODES.FIREBASE_QUOTA_EXCEEDED,
        429
      )
    
    default:
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
        ERROR_CODES.UNKNOWN_ERROR,
        500
      )
  }
}

// Parse OpenAI errors
export const parseOpenAIError = (error) => {
  const status = error.status || error.statusCode
  const message = error.message || error.error?.message || ''
  
  if (status === 429 || message.includes('rate limit')) {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.OPENAI_RATE_LIMIT],
      ERROR_CODES.OPENAI_RATE_LIMIT,
      429
    )
  }
  
  if (status === 400 || message.includes('invalid')) {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.OPENAI_INVALID_REQUEST],
      ERROR_CODES.OPENAI_INVALID_REQUEST,
      400
    )
  }
  
  if (!navigator.onLine || message.includes('network')) {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.OPENAI_NETWORK_ERROR],
      ERROR_CODES.OPENAI_NETWORK_ERROR,
      503
    )
  }
  
  return new AppError(
    ERROR_MESSAGES[ERROR_CODES.OPENAI_API_ERROR],
    ERROR_CODES.OPENAI_API_ERROR,
    500
  )
}

// Parse Stripe errors
export const parseStripeError = (error) => {
  const type = error.type
  const code = error.code
  
  switch (type) {
    case 'card_error':
      if (code === 'card_declined') {
        return new AppError(
          ERROR_MESSAGES[ERROR_CODES.STRIPE_CARD_DECLINED],
          ERROR_CODES.STRIPE_CARD_DECLINED,
          402
        )
      }
      break
    
    case 'invalid_request_error':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.STRIPE_INVALID_REQUEST],
        ERROR_CODES.STRIPE_INVALID_REQUEST,
        400
      )
    
    case 'api_connection_error':
    case 'api_error':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.STRIPE_NETWORK_ERROR],
        ERROR_CODES.STRIPE_NETWORK_ERROR,
        503
      )
  }
  
  return new AppError(
    ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    ERROR_CODES.UNKNOWN_ERROR,
    500
  )
}

// Parse media/recording errors
export const parseMediaError = (error) => {
  const name = error.name
  const message = error.message || ''
  
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.MEDIA_PERMISSION_DENIED],
        ERROR_CODES.MEDIA_PERMISSION_DENIED,
        403
      )
    
    case 'NotSupportedError':
    case 'NotFoundError':
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.MEDIA_NOT_SUPPORTED],
        ERROR_CODES.MEDIA_NOT_SUPPORTED,
        400
      )
    
    default:
      return new AppError(
        ERROR_MESSAGES[ERROR_CODES.MEDIA_RECORDING_ERROR],
        ERROR_CODES.MEDIA_RECORDING_ERROR,
        500
      )
  }
}

// Generic error handler
export const handleError = (error, context = 'unknown') => {
  console.error(`Error in ${context}:`, error)
  
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error
  }
  
  // Parse different types of errors
  if (error.code && error.code.startsWith('auth/')) {
    return parseFirebaseAuthError(error)
  }
  
  if (error.code && (error.code.includes('firestore') || error.code.includes('permission'))) {
    return parseFirestoreError(error)
  }
  
  if (error.status || error.error || error.message?.includes('OpenAI')) {
    return parseOpenAIError(error)
  }
  
  if (error.type && error.type.includes('stripe')) {
    return parseStripeError(error)
  }
  
  if (error.name && (error.name.includes('NotAllowed') || error.name.includes('Media'))) {
    return parseMediaError(error)
  }
  
  // Network errors
  if (!navigator.onLine || error.message?.includes('network') || error.message?.includes('fetch')) {
    return new AppError(
      ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR],
      ERROR_CODES.NETWORK_ERROR,
      503
    )
  }
  
  // Default to unknown error
  return new AppError(
    ERROR_MESSAGES[ERROR_CODES.UNKNOWN_ERROR],
    ERROR_CODES.UNKNOWN_ERROR,
    500
  )
}

// Retry logic for failed operations
export const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry certain types of errors
      const appError = handleError(error)
      if (appError.statusCode === 400 || appError.statusCode === 401 || appError.statusCode === 403) {
        throw appError
      }
      
      if (attempt === maxRetries) {
        throw appError
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw handleError(lastError)
}

export default {
  AppError,
  ERROR_CODES,
  ERROR_MESSAGES,
  handleError,
  withRetry,
  parseFirebaseAuthError,
  parseFirestoreError,
  parseOpenAIError,
  parseStripeError,
  parseMediaError
}
