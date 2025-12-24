import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { User } from '../lib/env'
import { UserCircle, Mail, Shield, AlertCircle, CheckCircle2, Save, Loader2, Wallet, ArrowRight, LayoutDashboard } from 'lucide-react'
import { requireCorrectChain, useWallet } from '../context/WalletContext'

export default function Profile() {
  const { user, refreshMe } = useAuth()
  const { connected, account, chainId, connect } = useWallet()
  const [name, setName] = useState(user?.name || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function save() {
    setError(null)
    setOk(null)
    setBusy(true)
    try {
      await api.put<{ user: User }>('/users/profile', { name })
      await refreshMe()
      setOk('Profile updated successfully')
      setTimeout(() => setOk(null), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Update failed')
    } finally {
      setBusy(false)
    }
  }

  const onCorrectChain = requireCorrectChain(chainId)
  const shortAccount = account ? `${account.slice(0, 6)}…${account.slice(-4)}` : null

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-950/50 pt-28 pb-12">
      <div className="tf-container max-w-5xl mx-auto">

        {/* Header Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Profile</span>
        </div>

        <div className="grid md:grid-cols-12 gap-10">

          {/* Left: Identity Card */}
          <div className="md:col-span-4 space-y-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-indigo-500 to-violet-600 opacity-10" />

              <div className="relative z-10">
                <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 p-1 mb-4">
                  <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <span className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-tr from-indigo-500 to-violet-500">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{user?.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{user?.email}</p>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
                  <Shield size={12} />
                  {user?.role}
                </div>
              </div>
            </div>

            {/* Walllet Status (Simplified) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Wallet className="text-emerald-500" size={18} /> Wallet
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Status</div>
                  {connected ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                      <CheckCircle2 size={16} /> Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <div className="w-2 h-2 rounded-full bg-slate-300" /> Disconnected
                    </div>
                  )}
                </div>

                {connected && (
                  <>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Address</div>
                      <div className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate">
                        {account}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Network</div>
                      <div className={`text-sm font-medium ${!onCorrectChain ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                        {onCorrectChain ? 'Sepolia Testnet' : 'Wrong Network'}
                      </div>
                    </div>
                  </>
                )}

                {!connected && (
                  <button onClick={connect} className="w-full py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity">
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Settings Form */}
          <div className="md:col-span-8 space-y-8">

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                  <UserCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Account Details</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Update your personal information here.</p>
                </div>
              </div>

              <div className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      value={user?.email}
                      readOnly
                      disabled
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-slate-400 pl-1">Email address cannot be changed for security reasons.</p>
                </div>

                {/* Feedback Messages */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                    <AlertCircle className="shrink-0 mt-0.5" size={18} />
                    {error}
                  </div>
                )}

                {ok && (
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                    {ok}
                  </div>
                )}

                <div className="pt-4">
                  <button
                    onClick={save}
                    disabled={busy || !name.trim() || name === user?.name}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/dashboard" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <LayoutDashboard size={20} />
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">Dashboard</span>
                </div>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </Link>
              {user?.role === 'creator' && (
                <Link to="/create" className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Wallet size={20} />
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">Create Campaign</span>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </Link>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
