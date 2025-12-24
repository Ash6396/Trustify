import React, { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  onClose: (id: string) => void
}

const icons = {
  success: <CheckCircle2 size={20} className="text-emerald-500" />,
  error: <AlertCircle size={20} className="text-red-500" />,
  info: <Info size={20} className="text-blue-500" />
}

export default function Toast({ id, type, message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl shadow-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-in slide-in-from-right-full fade-in duration-300 pointer-events-auto min-w-[300px] max-w-md">
      <div className="shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">{message}</p>
      <button onClick={() => onClose(id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
        <X size={16} />
      </button>
    </div>
  )
}
