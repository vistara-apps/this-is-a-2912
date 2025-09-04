import React, { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export const Toast = ({ 
  id,
  type = 'info', 
  title, 
  message, 
  duration = 5000,
  onClose,
  className,
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.(id)
    }, 300) // Match animation duration
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getStyles = () => {
    const baseStyles = 'border-l-4'
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-400 bg-green-500/10`
      case 'error':
        return `${baseStyles} border-red-400 bg-red-500/10`
      case 'warning':
        return `${baseStyles} border-yellow-400 bg-yellow-500/10`
      case 'info':
      default:
        return `${baseStyles} border-blue-400 bg-blue-500/10`
    }
  }

  if (!isVisible) return null

  return (
    <div
      className={clsx(
        'max-w-sm w-full bg-white/10 backdrop-blur-sm rounded-lg shadow-lg pointer-events-auto',
        'transform transition-all duration-300 ease-in-out',
        isExiting 
          ? 'translate-x-full opacity-0 scale-95' 
          : 'translate-x-0 opacity-100 scale-100',
        getStyles(),
        className
      )}
      {...props}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-medium text-white">
                {title}
              </p>
            )}
            {message && (
              <p className={clsx(
                'text-sm text-white/80',
                title && 'mt-1'
              )}>
                {message}
              </p>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-white/60 hover:text-white focus:outline-none focus:text-white transition-colors duration-150"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toast
