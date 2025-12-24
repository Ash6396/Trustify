import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import CampaignCard from '../components/CampaignCard'
import { useAuth } from '../context/AuthContext'
import { Search, TrendingUp, Plus, Shield, SlidersHorizontal, Loader2 } from 'lucide-react'

type Campaign = {
  _id: string
  title: string
  description: string
  goalAmountEth: number
  approved: boolean
  imageUrl?: string
  creator?: { name: string; email: string; role: string }
  createdAt?: string
}

export default function CampaignList() {
  const { user } = useAuth()

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await api.get<{ campaigns: Campaign[] }>('/campaigns')
          if (mounted) setCampaigns(res.data.campaigns)
        } catch (err: any) {
          if (mounted) {
            setError(
              err?.response?.data?.message ||
              err?.message ||
              'Failed to load campaigns'
            )
          }
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [])

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-primary mb-4" size={40} />
        <p className="text-muted-foreground animate-pulse">Loading verified campaigns...</p>
      </div>
    )
  }

  if (error)
    return (
      <div className="tf-container py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Unavailable</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="tf-btn-primary">
          Retry Connection
        </button>
      </div>
    )

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header Section */}
      <div className="relative pt-24 pb-12 overflow-hidden border-b border-border/40 bg-accent/20">
        <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl" />
        <div className="tf-container relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2">
              <TrendingUp size={14} />
              <span>Sepolia Testnet Live</span>
            </div>

            <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              Explore Campaigns
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
              Discover verified decentralized projects. Every donation is recorded on-chain for maximum transparency.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-lg group animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover:bg-primary/30 transition-colors opacity-50" />
              <div className="relative bg-background border border-border rounded-xl shadow-lg flex items-center p-1 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <Search className="ml-3 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search by title, description, or creator..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-foreground placeholder:text-muted-foreground h-12 px-3 text-base"
                />
                <button className="p-2.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                  <SlidersHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tf-container py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">

          {/* Create Campaign Card (for Creators) */}
          {user?.role === 'creator' && !search && (
            <Link
              to="/create"
              className="group flex flex-col h-full min-h-[400px] border-2 border-dashed border-border hover:border-primary/50 relative overflow-hidden rounded-2xl p-6 items-center justify-center text-center transition-all duration-300 hover:scale-[1.01] hover:bg-accent/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                <Plus size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground">Launch New Campaign</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                Start your own fundraising journey on the blockchain.
              </p>
            </Link>
          )}

          {/* Campaign Cards */}
          {filteredCampaigns.map((c, i) => (
            <CampaignCard
              key={c._id}
              campaign={c}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-20">
            {search ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent flex items-center justify-center text-muted-foreground">
                  <Search size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No matches found</h3>
                  <p className="text-muted-foreground">We couldn't find any campaigns matching "{search}".</p>
                </div>
                <button
                  onClick={() => setSearch('')}
                  className="tf-btn-secondary"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent flex items-center justify-center text-muted-foreground">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">No campaigns yet</h3>
                  <p className="text-muted-foreground">Check back later for verified projects.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

