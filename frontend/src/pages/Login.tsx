import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      await login({ email, password })
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Login failed')
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
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-violet-600/80" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-ad714291f22c?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />

        {/* Animated Orbs */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse duration-[5s]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-500/30 rounded-full blur-3xl animate-pulse duration-[7s]" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3 text-white/90 hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold shadow-lg group-hover:scale-105 transition-transform">
              <span className="font-heading text-lg">T</span>
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight">TRUSTIFY</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="font-heading text-5xl font-bold tracking-tight mb-6 leading-tight">
            Verification meets <br />Crowdfunding.
          </h2>
          <p className="text-slate-200 text-lg leading-relaxed mb-10 font-light">
            Join the platform where transparency is built-in. Verify campaigns, donate on-chain, and track every impact in real-time.
          </p>

          <div className="flex gap-8">
            <div className="pl-4 border-l-4 border-white/30 backdrop-blur-sm">
              <p className="font-bold text-2xl">10k+</p>
              <p className="text-sm text-slate-300 uppercase tracking-wider font-medium mt-1">Campaigns</p>
            </div>
            <div className="pl-4 border-l-4 border-white/30 backdrop-blur-sm">
              <p className="font-bold text-2xl">$5M+</p>
              <p className="text-sm text-slate-300 uppercase tracking-wider font-medium mt-1">Volume</p>
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
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-5">
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Password</label>
                  <Link to="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    type="password"
                    className="tf-input pl-10"
                    required
                  />
                </div>
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
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-primary hover:underline transition-all">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

