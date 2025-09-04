import React from 'react'
import { clsx } from 'clsx'
import { User, Bot } from 'lucide-react'

export const ChatBubble = ({ 
  message, 
  variant = 'user', 
  timestamp, 
  className,
  ...props 
}) => {
  const isUser = variant === 'user'
  const isAssistant = variant === 'assistant'

  return (
    <div 
      className={clsx(
        'flex items-start space-x-3 max-w-4xl',
        isUser && 'flex-row-reverse space-x-reverse ml-auto',
        className
      )}
      {...props}
    >
      {/* Avatar */}
      <div className={clsx(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser && 'bg-primary/20',
        isAssistant && 'bg-accent/20'
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-primary" />
        ) : (
          <Bot className="h-4 w-4 text-accent" />
        )}
      </div>

      {/* Message Content */}
      <div className={clsx(
        'flex-1 space-y-2',
        isUser && 'text-right'
      )}>
        {/* Message Bubble */}
        <div className={clsx(
          'inline-block px-4 py-3 rounded-lg max-w-xs sm:max-w-md lg:max-w-lg',
          isUser && 'bg-primary text-white rounded-br-sm',
          isAssistant && 'bg-white/10 text-white rounded-bl-sm border border-white/20'
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className={clsx(
            'text-xs text-white/50',
            isUser && 'text-right'
          )}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  )
}

// Predefined variants for common use cases
ChatBubble.User = (props) => <ChatBubble variant="user" {...props} />
ChatBubble.Assistant = (props) => <ChatBubble variant="assistant" {...props} />

export default ChatBubble
