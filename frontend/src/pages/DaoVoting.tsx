import React, { useState } from 'react'
import { api } from '../lib/api'
import { Vote, CheckCircle2, AlertCircle, Send, Hash } from 'lucide-react'

export default function DaoVoting() {
  const [campaignId, setCampaignId] = useState('')
  const [support, setSupport] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function vote() {
    setBusy(true)
    setError(null)
    setOk(null)
    try {
      await api.post('/dao/vote', { campaignId, support })
      setOk('Vote recorded successfully')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Vote failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600 text-white mb-6 shadow-xl shadow-violet-500/25">
            <Vote size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">DAO Governance</h1>
          <p className="text-slate-600 dark:text-slate-400">Participate in platform decisions by casting your authenticated vote.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Hash size={16} /> Campaign Database ID
              </label>
              <input
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                placeholder="e.g. 64f2a..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all outline-none"
              />
              <p className="mt-2 text-xs text-slate-500">
                Found in the URL of a campaign or admin dashboard.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Your Vote
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSupport(true)}
                  className={`px-4 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 ${support
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <CheckCircle2 size={18} /> Support
                </button>
                <button
                  onClick={() => setSupport(false)}
                  className={`px-4 py-3 rounded-xl border font-medium transition-all flex items-center justify-center gap-2 ${!support
                    ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <AlertCircle size={18} /> Oppose
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                {error}
              </div>
            )}

            {ok && (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                {ok}
              </div>
            )}

            <button
              onClick={vote}
              disabled={busy || campaignId.trim().length === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 text-white font-bold hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/20"
            >
              {busy ? 'Submitting Vote...' : (
                <>
                  <Send size={18} /> Submit Vote
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
