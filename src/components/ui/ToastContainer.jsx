import React from 'react'
import { createPortal } from 'react-dom'
import { Toast } from './Toast'

export const ToastContainer = ({ toasts, onRemoveToast }) => {
  if (!toasts || toasts.length === 0) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onRemoveToast}
        />
      ))}
    </div>,
    document.body
  )
}

export default ToastContainer
