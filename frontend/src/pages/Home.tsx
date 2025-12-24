import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { Shield, Activity, ArrowRight, LayoutDashboard, Globe, Sparkles, Clock, Zap, Wallet, Users } from 'lucide-react'

type Campaign = {
  _id: string
  title: string
  description: string
  goalAmountEth: number
  approved: boolean
  createdAt?: string
}

export default function Home() {
  const { user } = useAuth()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        setLoading(true)
        setLoadError(null)
        try {
          const res = user?.role === 'admin'
            ? await api.get<{ campaigns: Campaign[] }>('/admin/campaigns')
            : await api.get<{ campaigns: Campaign[] }>('/campaigns')
          if (mounted) setCampaigns(res.data.campaigns)
        } catch (err: any) {
          if (mounted) setLoadError(err?.response?.data?.message || err?.message || 'Failed to load homepage data')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [user?.role])

  const homeStats = useMemo(() => {
    const total = campaigns.length
    const approved = campaigns.filter((c) => c.approved).length
    const pending = total - approved

    const now = Date.now()
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    const newThisWeek = campaigns.filter((c) => {
      if (!c.createdAt) return false
      const t = new Date(c.createdAt).getTime()
      return Number.isFinite(t) && now - t <= sevenDays
    }).length

    const latest = campaigns
      .filter((c) => c.createdAt)
      .slice()
      .sort((a, b) => (new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()))[0]

    return {
      total,
      approved,
      pending,
      newThisWeek,
      latestDate: latest?.createdAt ? new Date(latest.createdAt).toLocaleDateString() : null
    }
  }, [campaigns])

  const roleLabel = user?.role === 'admin' ? 'Admin Access' : user?.role === 'creator' ? 'Creator Tools' : user?.role === 'donor' ? 'Donor View' : null
  const roleHint =
    user?.role === 'admin'
      ? 'Review campaigns and keep the platform safe.'
      : user?.role === 'creator'
        ? 'Create campaigns and track approval status.'
        : user?.role === 'donor'
          ? 'Discover verified campaigns and donate securely.'
          : ''

  const nextSteps = useMemo(() => {
    if (!user) return []

    if (user.role === 'admin') {
      return [
        {
          icon: Shield,
          title: 'Review Submissions',
          desc: `Pending campaigns: ${loading ? '…' : homeStats.pending}. Approve clean campaigns and reject misleading ones.`,
          cta: 'Open Admin Panel',
          to: '/admin'
        },
        {
          icon: LayoutDashboard,
          title: 'Check Platform Health',
          desc: `Live campaigns: ${loading ? '…' : homeStats.approved}. Keep Explore trustworthy and up to date.`,
          cta: 'Go to Dashboard',
          to: '/dashboard'
        },
        {
          icon: Globe,
          title: 'Validate Public Experience',
          desc: 'Preview what donors see on Explore and ensure campaigns have clear titles and cover images.',
          cta: 'Open Explore',
          to: '/campaigns'
        }
      ]
    }

    if (user.role === 'creator') {
      return [
        {
          icon: Sparkles,
          title: 'Create a Campaign',
          desc: 'Write a clear story, add a cover image, and set your goal. If on-chain isn’t available, a draft will be saved.',
          cta: 'Create Campaign',
          to: '/create'
        },
        {
          icon: Clock,
          title: 'Track Approval Status',
          desc: 'After you submit, admins review it. Pending and rejected campaigns appear in your Dashboard.',
          cta: 'Open Dashboard',
          to: '/dashboard'
        },
        {
          icon: Users,
          title: 'Get Donor-Ready',
          desc: 'Use a direct image URL and a transparent budget. Approved campaigns show on Explore.',
          cta: 'Browse Explore',
          to: '/campaigns'
        }
      ]
    }

    // donor
    return [
      {
        icon: Globe,
        title: 'Explore Verified Campaigns',
        desc: 'Only approved campaigns appear publicly. Read the story, goal, and verification badge before donating.',
        cta: 'Explore Campaigns',
        to: '/campaigns'
      },
      {
        icon: Wallet,
        title: 'Connect Wallet (MetaMask)',
        desc: 'On-chain donations require Sepolia network and a small amount of test ETH for gas.',
        cta: 'Go to Dashboard',
        to: '/dashboard'
      },
      {
        icon: Activity,
        title: 'Track Your Impact',
        desc: 'After donating, keep your transaction hash for verification and follow campaign progress.',
        cta: 'View Profile',
        to: '/profile'
      }
    ]
  }, [user, homeStats.pending, homeStats.approved, loading])

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-40 md:pt-40 md:pb-52">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute -top-32 left-10 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse duration-[4000ms]" />
          <div className="absolute top-20 right-10 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[100px] animate-pulse duration-[5000ms]" />
        </div>

        <div className="tf-container relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/50 border border-primary/20 backdrop-blur-md text-sm font-medium animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-violet-500 font-bold">Live on Sepolia Testnet</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-tight">
              Crowdfunding built on <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500">Trust & Transparency</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Launch verifying campaigns, donate securely via MetaMask, and track every transaction on-chain. The future of giving is decentralized.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 pt-4">
              {!user ? (
                <>
                  <Link
                    to="/campaigns"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    Start Exploring
                    <ArrowRight size={20} />
                  </Link>
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-background border border-input text-foreground font-semibold hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
                  >
                    Create Account
                    <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight size={12} />
                    </div>
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <LayoutDashboard size={20} />
                </Link>
              )}
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{loading ? '…' : homeStats.approved}</div>
                <div className="text-sm text-muted-foreground font-medium">Live Campaigns</div>
              </div>
              <div className="space-y-1 border-x border-border/50">
                <div className="text-3xl font-bold text-foreground">{loading ? '…' : homeStats.newThisWeek}</div>
                <div className="text-sm text-muted-foreground font-medium">New This Week</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{loading ? '…' : homeStats.total}</div>
                <div className="text-sm text-muted-foreground font-medium">Total Campaigns</div>
              </div>
            </div>

            {loadError && (
              <div className="mt-8 text-sm text-destructive/90">
                {loadError}
              </div>
            )}
          </div>
        </div>
      </section>

      {!user && (
        <>
          {/* How It Works Section */}
          <section className="py-24 bg-background relative border-y border-border/50">
            <div className="tf-container">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-3xl font-bold tracking-tight mb-4">How Trustify Works</h2>
                <p className="text-muted-foreground text-lg">Four simple steps to decentralized fundraising. Secure, transparent, and easy.</p>
              </div>

              <div className="grid md:grid-cols-4 gap-8 relative">
                <div className="hidden md:block absolute top-12 left-[10%] content-[''] w-[80%] h-[2px] bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 -z-10" />

                <div className="relative group text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-lg flex items-center justify-center text-primary mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <Wallet size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">1. Connect Wallet</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Connect MetaMask to access the platform. No personal data required initially.
                  </p>
                </div>

                <div className="relative group text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-lg flex items-center justify-center text-violet-500 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <LayoutDashboard size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">2. Create Campaign</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Describe your cause, set a goal in ETH, and add visuals. We help you every step.
                  </p>
                </div>

                <div className="relative group text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-lg flex items-center justify-center text-amber-500 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <Shield size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">3. Get Verified</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our admins review every submission to filter out spam and ensure safety.
                  </p>
                </div>

                <div className="relative group text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-lg flex items-center justify-center text-emerald-500 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">4. Receive Funds</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Donors support you on-chain. Funds are secured by smart contracts.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Uses & Impact Section */}
          <section className="py-24 bg-accent/20">
            <div className="tf-container">
              <div className="grid lg:grid-cols-2 gap-16 items-center">

                <div className="space-y-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Empowering Everyone</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Trustify isn't just for tech experts. Whether you are an artist, a charity, or a supporter, we provide the tools you need.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0">
                        <Sparkles size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">For Creators & Innovators</h3>
                        <p className="text-muted-foreground">Raise funds for your startup, art project, or community event globally without banking restrictions.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 shrink-0">
                        <Activity size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">For Non-Profits</h3>
                        <p className="text-muted-foreground">Prove where every cent goes. Build trust with your donors through immutable on-chain records.</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 shrink-0">
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">For Donors</h3>
                        <p className="text-muted-foreground">Support causes you love with confidence. Verify campaign authenticity and track implementation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-violet-500 to-fuchsia-500 rounded-3xl blur-2xl opacity-20" />
                  <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold mb-6">Platform Features</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: Shield, title: 'Admin Verification', desc: 'Manual audits' },
                        { icon: Zap, title: 'Instant Transfer', desc: 'No bank delays' },
                        { icon: Globe, title: 'Global Access', desc: 'Anywhere, anytime' },
                        { icon: Clock, title: '24/7 Uptime', desc: 'Always available' },
                        { icon: LayoutDashboard, title: 'Smart Dashboard', desc: 'Real-time analytics' },
                        { icon: ArrowRight, title: 'Direct Impact', desc: '0% Platform fees' }
                      ].map((feature, i) => (
                        <div key={i} className="p-4 rounded-xl bg-background border border-border/50 hover:border-primary/30 transition-colors">
                          <div className="flex items-center gap-3 mb-2">
                            <feature.icon size={18} className="text-primary" />
                            <span className="font-semibold text-sm">{feature.title}</span>
                          </div>
                          <p className="text-xs text-muted-foreground pl-7">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        </>
      )}

      {/* Role-Based Dashboard Section (if logged in) */}
      {user && (
        <section className="py-24 relative overflow-hidden">
          <div className="tf-container relative z-10">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden border border-white/10">

              {/* Decorative background blobs */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium mb-6">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span>{roleLabel}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Welcome back, {user.name}</h2>
                  <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                    You are logged in as a <span className="text-white font-bold px-2 py-0.5 rounded bg-white/10">{user.role}</span>.
                    {' '}
                    {roleHint}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <Link to="/dashboard" className="px-6 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
                      Open Dashboard
                      <ArrowRight size={18} />
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    {user.role === 'creator' && (
                      <Link to="/create" className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors">
                        New Campaign
                      </Link>
                    )}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                      <LayoutDashboard size={20} />
                      <span className="text-sm font-medium">Total Campaigns</span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{loading ? '…' : homeStats.total}</div>
                    <div className="text-xs text-slate-300/80 mt-1">Last update {homeStats.latestDate ?? '—'}</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                      <Activity size={20} />
                      <span className="text-sm font-medium">Live Campaigns</span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{loading ? '…' : homeStats.approved}</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                      <Activity size={20} />
                      <span className="text-sm font-medium">New This Week</span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{loading ? '…' : homeStats.newThisWeek}</div>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                    <div className="flex items-center gap-3 mb-2 text-slate-400">
                      <Clock size={20} />
                      <span className="text-sm font-medium">Pending Review</span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight">{loading ? '...' : (user.role === 'admin' ? homeStats.pending : '--')}</div>
                  </div>
                </div>
              </div>

              {/* Role-based Next Steps */}
              {nextSteps.length > 0 && (
                <div className="relative z-10 mt-10">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h3 className="text-lg font-bold">Next steps for {user.role}</h3>
                    <div className="text-xs text-slate-300/80">Choose one to continue</div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {nextSteps.map((item) => (
                      <Link
                        key={item.title}
                        to={item.to}
                        className="group bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                            <item.icon size={22} />
                          </div>
                          <ArrowRight size={18} className="text-slate-300/70 group-hover:text-white transition-colors shrink-0" />
                        </div>
                        <div className="mt-4">
                          <div className="font-bold text-white text-base">{item.title}</div>
                          <div className="mt-1 text-sm text-slate-300 leading-relaxed">{item.desc}</div>
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                          {item.cta}
                          <ArrowRight size={14} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action (Guest) */}
      {!user && (
        <section className="py-24">
          <div className="tf-container">
            <div className="bg-primary/5 rounded-3xl p-12 text-center border border-primary/10">
              <h2 className="text-3xl font-bold mb-6">Ready to make an impact?</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
                Join thousands of donors and creators building a better future on the blockchain.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup" className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:shadow-lg hover:shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Get Started Now
                </Link>
                <Link to="/about" className="px-8 py-4 rounded-full bg-background border border-input font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
