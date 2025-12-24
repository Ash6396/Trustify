import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../lib/env'
import { Mail, Lock, User, Shield, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Signup() {
  const { signup, user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('donor')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signup({ name, email, password, role })
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Signup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Side - Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden p-12 text-white">
        {/* Background Layers */}
        <div className="absolute inset-0 bg-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/80 to-slate-900/80" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621504450168-38f6854cb0e6?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay" />

        {/* Orbs */}
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px] animate-pulse duration-[8s]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white/90 hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-heading text-lg">T</span>
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight">TRUSTIFY</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-heading text-4xl font-bold tracking-tight mb-4 leading-tight">Join the future of giving.</h2>
          <p className="text-slate-200 text-lg leading-relaxed mb-8">
            Create an account to verify campaigns, launch your own, or help govern the platform via DAO.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
              <div className="mt-1 p-2 rounded-lg bg-green-500/20 text-green-300">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">Verified Trust</h3>
                <p className="text-sm text-slate-300 mt-1 leading-snug">Every campaign is admin-verified to prevent fraud before going public.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition-colors">
              <div className="mt-1 p-2 rounded-lg bg-blue-500/20 text-blue-300">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 className="font-bold text-white">On-Chain Transparency</h3>
                <p className="text-sm text-slate-300 mt-1 leading-snug">All donations are recorded directly on the Sepolia blockchain.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-400 font-medium tracking-wide uppercase">
          © {new Date().getFullYear()} Trustify Inc.
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center p-6 sm:p-12 animate-in fade-in slide-in-from-right-8 duration-700">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Create an account</h1>
            <p className="text-muted-foreground">
              Start your journey with Trustify today.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    type="text"
                    className="tf-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    className="tf-input pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min 8 chars)"
                    type="password"
                    className="tf-input pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Account Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="donor">Donor (Browse & Donate)</option>
                    <option value="creator">Creator (Start Campaigns)</option>
                    <option value="admin">Admin (Approval Access)</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                    <ArrowRight size={14} className="rotate-90" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {role === 'donor' && 'Browse campaigns and make donations.'}
                  {role === 'creator' && 'Create campaigns and submit for verification.'}
                  {role === 'admin' && 'Review and approve submitted campaigns.'}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                {error}
              </div>
            )}

            <button
              disabled={busy}
              className="tf-btn-primary w-full h-11 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30"
            >
              {busy ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline transition-all">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

