import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-8 overflow-hidden relative">
          <AlertCircle size={32} className="relative z-10" />
          <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 opacity-20 animate-ping" />
        </div>

        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Page not found</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity"
        >
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  )
}
