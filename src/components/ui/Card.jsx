import React from 'react'
import { clsx } from 'clsx'

export const Card = ({ 
  children, 
  variant = 'default', 
  className,
  ...props 
}) => {
  const baseClasses = 'rounded-xl p-6'
  
  const variantClasses = {
    default: 'glass backdrop-blur-xl',
    elevated: 'glass-dark backdrop-blur-xl shadow-raised'
  }

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}