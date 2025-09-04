import React from 'react'
import { clsx } from 'clsx'

export const Input = ({ 
  label,
  error,
  type = 'text',
  className,
  ...props 
}) => {
  const inputClasses = clsx(
    'w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150',
    error && 'border-red-400 focus:ring-red-400',
    className
  )

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-white/80">
          {label}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}