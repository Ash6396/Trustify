import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="w-full py-20 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
      <Loader2 className="animate-spin text-indigo-600" size={32} />
      <div className="text-sm font-medium animate-pulse">{label}</div>
    </div>
  )
}
