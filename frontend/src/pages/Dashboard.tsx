import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { normalizeImageUrl } from '../lib/image'
import { User, Shield, ArrowRight, Heart, Activity, Plus, Wallet, LayoutDashboard } from 'lucide-react'
import { useWallet } from '../context/WalletContext'

type Campaign = {
  _id: string
  title: string
  description: string
  goalAmountEth: number
  approved: boolean
  rejected?: boolean
  rejectionReason?: string
  rejectedAt?: string
  onChainCampaignId?: number | null
  imageUrl?: string
  creator?: { _id: string; name: string; email: string }
  createdAt?: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const { connected } = useWallet()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const endpoint =
            user?.role === 'creator'
              ? '/campaigns/mine'
              : user?.role === 'admin'
                ? '/admin/campaigns'
                : '/campaigns'
          const res = await api.get<{ campaigns: Campaign[] }>(endpoint)
          if (mounted) {
            setCampaigns(res.data.campaigns)
          }
        } catch (err) {
          console.error('Failed to load campaigns for dashboard', err)
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [user?.role])

  const approvedCampaigns = useMemo(() => campaigns.filter((c) => c.approved), [campaigns])
  const myCampaigns = useMemo(() => (user?.role === 'creator' ? campaigns : []), [campaigns, user?.role])

  const stats = useMemo(() => {
    return {
      total: campaigns.length,
      approved: approvedCampaigns.length,
      mine: myCampaigns.length,
      mineApproved: myCampaigns.filter(c => c.approved).length
    }
  }, [campaigns, approvedCampaigns, myCampaigns])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-12">
      <div className="tf-container">

        {/* 1. Welcome Header (Simplified) */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Hello, {user?.name}
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">
            You are logged in as a <span className="text-indigo-600 dark:text-indigo-400 font-semibold capitalize">{user?.role}</span>.
          </p>
        </div>

        {/* 2. Primary Actions (Big Cards) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          
          {user?.role === 'creator' ? (
             <Link to="/create" className="group relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                 <Plus size={120} />
               </div>
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                   <Plus size={24} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Create Campaign</h3>
                 <p className="opacity-90 mb-6">Launch a new fundraising project on the blockchain.</p>
                 <span className="inline-flex items-center gap-2 font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md transition-colors">
                   Start Now <ArrowRight size={16} />
                 </span>
               </div>
             </Link>
          ) : (
            <Link to="/campaigns" className="group relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-1">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-500">
                 <Heart size={120} />
               </div>
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6">
                   <Heart size={24} />
                 </div>
                 <h3 className="text-2xl font-bold mb-2">Donate Now</h3>
                 <p className="opacity-90 mb-6">Find verified campaigns and support them securely.</p>
                 <span className="inline-flex items-center gap-2 font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg backdrop-blur-md transition-colors">
                   Explore <ArrowRight size={16} />
                 </span>
               </div>
            </Link>
          )}

          {/* Action 2: Profile */}
          <Link to="/profile" className="group p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all">
             <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
               <User size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">My Profile</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-6">Manage your account settings and preferences.</p>
             <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline flex items-center gap-2">
               Edit Profile <ArrowRight size={16} />
             </span>
          </Link>

          {/* Action 3: Admin / DAO / Wallet */}
          {user?.role === 'admin' ? (
             <Link to="/admin" className="group p-8 rounded-3xl bg-slate-800 text-white hover:bg-slate-700 shadow-sm hover:shadow-md transition-all">
               <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                 <Shield size={24} />
               </div>
               <h3 className="text-xl font-bold mb-2">Admin Panel</h3>
               <p className="text-slate-300 mb-6">Review pending campaigns and platform security.</p>
               <span className="text-white font-semibold flex items-center gap-2">
                 Go to Admin <ArrowRight size={16} />
               </span>
             </Link>
          ) : (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10"/>
               <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                 <Wallet size={24} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Wallet Status</h3>
               <div className="mb-6">
                  {connected ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                      Connected
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-slate-400"/>
                      Not Connected
                    </div>
                  )}
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400">
                 Connect MetaMask to perform on-chain actions like donating.
               </p>
            </div>
          )}
        </div>

        {/* 3. Stats Overview */}
        <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Activity className="text-indigo-500" /> Platform Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                 <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stats.total}</div>
                 <div className="text-sm text-slate-500">Total Campaigns</div>
               </div>
               <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                 <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mb-1">{stats.approved}</div>
                 <div className="text-sm text-slate-500">Verified</div>
               </div>
               {user?.role === 'creator' && (
                 <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30">
                   <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{stats.mine}</div>
                   <div className="text-sm text-indigo-700 dark:text-indigo-300">My Campaigns</div>
                 </div>
               )}
            </div>
        </div>

        {/* 4. Recent Activity / Feed */}
        {user?.role === 'creator' && stats.mine > 0 && (
           <div className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">My Recent Campaigns</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {myCampaigns.slice(0, 4).map(c => {
                  const imageSrc = normalizeImageUrl(c.imageUrl)
                  const isDraft = !c.approved && !c.rejected && c.onChainCampaignId == null
                  return (
                    <Link key={c._id} to={`/campaigns/${c._id}`} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <LayoutDashboard size={20} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{c.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {c.approved ? (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Live</span>
                          ) : c.rejected ? (
                            <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">Rejected</span>
                          ) : isDraft ? (
                            <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">Draft</span>
                          ) : (
                            <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">Pending</span>
                          )}
                          <span className="text-xs text-slate-500">{c.goalAmountEth} ETH Goal</span>
                        </div>

                        {c.rejected && c.rejectionReason && (
                          <div className="mt-1 text-xs text-red-600 dark:text-red-400 line-clamp-1">
                            Reason: {c.rejectionReason}
                          </div>
                        )}

                        {isDraft && (
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            Draft saved off-chain (donations disabled until synced).
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
           </div>
        )}

      </div>
    </div>
  )
}
