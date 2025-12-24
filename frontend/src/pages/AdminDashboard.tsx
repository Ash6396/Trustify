import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import Loading from '../components/Loading'
import { Shield, CheckCircle2, AlertCircle, Clock, Check, ExternalLink, XCircle, Trash2 } from 'lucide-react'

type Campaign = {
  _id: string
  title: string
  description: string
  goalAmountEth: number
  approved: boolean
  rejected?: boolean
  rejectionReason?: string
  rejectedAt?: string
  creator?: { name: string; email: string; role: string }
}

export default function AdminDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  async function load() {
    const res = await api.get<{ campaigns: Campaign[] }>('/admin/campaigns')
    setCampaigns(res.data.campaigns)
  }

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          await load()
        } catch (err: any) {
          if (mounted) setError(err?.response?.data?.message || err?.message || 'Failed to load admin data')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  async function approve(id: string) {
    setBusyId(id)
    try {
      await api.put(`/admin/campaigns/${id}/approve`)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function reject(id: string) {
    const reason = window.prompt('Rejection reason (optional):') || ''
    setBusyId(id)
    try {
      await api.put(`/admin/campaigns/${id}/reject`, { reason })
      await load()
    } finally {
      setBusyId(null)
    }
  }

  async function remove(id: string) {
    const ok = window.confirm('Delete this campaign permanently? This cannot be undone.')
    if (!ok) return
    setBusyId(id)
    try {
      await api.delete(`/admin/campaigns/${id}`)
      await load()
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Loading label="Loading admin dashboard…" />
  if (error) return <div className="tf-container py-10 flex flex-col items-center justify-center text-red-600 gap-2"><AlertCircle size={32} />{error}</div>

  const total = campaigns.length
  const approved = campaigns.filter((c) => c.approved).length
  const rejected = campaigns.filter((c) => c.rejected).length
  const pending = campaigns.filter((c) => !c.approved && !c.rejected).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-12">
      <div className="tf-container">

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">Manage campaign approvals and platform safety.</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Admin character: you’re the verification layer. Approve when details are consistent; reject when information is missing or misleading.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-4 gap-6 mb-10">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-sm font-medium text-slate-500 mb-1">Total Campaigns</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{total}</div>
          </div>
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 mb-1 font-medium text-sm">
              <Clock size={16} /> Pending Review
            </div>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">{pending}</div>
          </div>
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 mb-1 font-medium text-sm">
              <CheckCircle2 size={16} /> Approved
            </div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{approved}</div>
          </div>
          <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1 font-medium text-sm">
              <XCircle size={16} /> Rejected
            </div>
            <div className="text-3xl font-bold text-red-700 dark:text-red-400">{rejected}</div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Admin Playbook</h2>
          <div className="mt-3 grid md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">1) Validate story and goal clarity.</div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">2) Check creator details and consistency.</div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">3) Approve only safe campaigns to publish.</div>
          </div>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">Approvals make campaigns visible to donors on the public list.</p>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Campaign Submission Queue</h2>

        <div className="space-y-4">
          {campaigns.map((c) => (
            <div
              key={c._id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${!c.approved
                ? 'border-amber-200 dark:border-amber-900/50 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{c.title}</h3>
                    {c.approved ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Approved
                      </span>
                    ) : c.rejected ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-1">
                        <XCircle size={12} /> Rejected
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs font-semibold flex items-center gap-1">
                        <Clock size={12} /> Pending Review
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      Goal: <span className="font-medium text-slate-700 dark:text-slate-300">{c.goalAmountEth} ETH</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      Creator: <span className="font-medium text-slate-700 dark:text-slate-300">{c.creator?.name}</span>
                      <span className="text-xs opacity-75">({c.creator?.email})</span>
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-3xl">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:self-center shrink-0">
                  {!c.approved && !c.rejected && (
                    <button
                      onClick={() => approve(c._id)}
                      disabled={busyId === c._id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {busyId === c._id ? 'Approving…' : (
                        <>
                          <Check size={18} /> Approve
                        </>
                      )}
                    </button>
                  )}

                  {!c.approved && !c.rejected && (
                    <button
                      onClick={() => reject(c._id)}
                      disabled={busyId === c._id}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-500/20"
                    >
                      {busyId === c._id ? 'Rejecting…' : (
                        <>
                          <XCircle size={18} /> Reject
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => remove(c._id)}
                    disabled={busyId === c._id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    title="Delete Campaign"
                  >
                    <Trash2 size={18} /> Delete
                  </button>

                  <Link
                    to={`/campaigns/${c._id}`}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    title="View Details"
                  >
                    <ExternalLink size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {campaigns.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-500">
              No campaigns found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
