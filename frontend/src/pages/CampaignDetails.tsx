import React, { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useWallet, requireCorrectChain } from '../context/WalletContext'
import { useToast } from '../context/ToastContext'
import { ethers } from 'ethers'
import { getContract } from '../lib/contract'
import { ENV } from '../lib/env'
import { normalizeImageUrl } from '../lib/image'
import { Shield, Target, Calendar, User, ExternalLink, AlertCircle, CheckCircle2, Heart, ArrowLeft, Loader2, Share2, Wallet, ImageOff, Clock } from 'lucide-react'

type Campaign = {
  _id: string
  title: string
  description: string
  goalAmountEth: number
  approved: boolean
  rejected?: boolean
  rejectionReason?: string
  rejectedAt?: string
  imageUrl?: string
  onChainCampaignId?: number | null
  creator?: { name: string; email: string }
  createdAt?: string
}

export default function CampaignDetails() {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [amountEth, setAmountEth] = useState('0.01')
  const [busy, setBusy] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const toast = useToast()

  const [coverImageOk, setCoverImageOk] = useState(true)
  const [raisedEth, setRaisedEth] = useState('0')
  const [supporterCount] = useState(0) // Placeholder

  const { connected, signer, chainId, connect } = useWallet()
  const correctChain = requireCorrectChain(chainId)
  const contractConfigured =
    !!ENV.VITE_CONTRACT_ADDRESS &&
    ENV.VITE_CONTRACT_ADDRESS.toLowerCase() !== '0x0000000000000000000000000000000000000000'

  const isDraft = campaign?.onChainCampaignId == null
  const isRejected = !!campaign?.rejected
  const isPendingReview = !!campaign && !campaign.approved && !isRejected && !isDraft

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await api.get<{ campaign: Campaign }>(`/campaigns/${id}`)
          if (mounted) {
            setCampaign(res.data.campaign)
            setCoverImageOk(true)
          }
        } catch (err: any) {
          if (mounted) toast('error', 'Failed to load campaign details')
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [id, toast])

  /* Fetch on-chain data */
  useEffect(() => {
    if (campaign?.onChainCampaignId == null || !contractConfigured) return

    let mounted = true
      ; (async () => {
        try {
          const provider = connected && signer ? signer : new ethers.JsonRpcProvider(ENV.VITE_RPC_URL)
          const contract = getContract(provider)
          const data = await contract.getCampaign(campaign.onChainCampaignId)
          if (mounted && data) {
            setRaisedEth(ethers.formatEther(data[3]))
          }
        } catch (err) {
          console.error('Failed to fetch on-chain campaign data', err)
        }
      })()

    return () => {
      mounted = false
    }
  }, [campaign?.onChainCampaignId, connected, signer, contractConfigured])

  const canDonateOnChain = useMemo(() => {
    return (
      contractConfigured &&
      connected &&
      !!signer &&
      correctChain &&
      campaign?.approved === true &&
      !campaign?.rejected &&
      campaign?.onChainCampaignId != null
    )
  }, [connected, signer, correctChain, campaign, contractConfigured])

  const coverUrl = useMemo(() => normalizeImageUrl(campaign?.imageUrl), [campaign?.imageUrl])
  const hasCoverImage = !!coverUrl && coverImageOk

  const progressPercentage = useMemo(() => {
    const goal = campaign?.goalAmountEth ?? 0
    const raised = Number(raisedEth)
    if (!Number.isFinite(raised) || goal <= 0) return 0
    return Math.min(100, (raised / goal) * 100)
  }, [raisedEth, campaign?.goalAmountEth])

  async function donate() {
    if (!campaign) return
    if (campaign.rejected) {
      toast('error', 'This campaign was rejected and cannot accept donations')
      return
    }
    if (!campaign.approved) {
      toast('error', 'This campaign is not approved yet')
      return
    }
    if (!signer) {
      toast('error', 'Wallet not connected')
      return
    }
    if (!correctChain) {
      toast('error', 'Wrong network. Switch MetaMask to Sepolia')
      return
    }
    if (campaign.onChainCampaignId == null) {
      toast('error', 'Campaign not mapped on-chain')
      return
    }

    setBusy(true)
    setTxHash(null)
    try {
      const amountNumber = Number(amountEth)
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        throw new Error('Donation amount must be greater than 0 ETH')
      }

      const code = await signer.provider.getCode(ENV.VITE_CONTRACT_ADDRESS)
      if (!code || code === '0x') {
        throw new Error('Platform contract is not deployed on Sepolia yet. Please try later.')
      }

      const contract = getContract(signer)
      const value = ethers.parseEther(amountEth)
      const tx = await contract.donate(campaign.onChainCampaignId, { value })
      toast('info', 'Donation sent. Waiting for confirmation...')
      const receipt = await tx.wait()
      setTxHash(receipt?.hash ?? tx.hash)

      await api.post('/donations', {
        campaignId: campaign._id,
        amountEth: Number(amountEth),
        txHash: receipt?.hash ?? tx.hash
      })
      toast('success', 'Thank you! Donation confirmed.')
    } catch (err: any) {
      toast('error', err?.shortMessage || err?.response?.data?.message || err?.message || 'Donation failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  )

  if (!campaign) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Campaign Not Found</h2>
      <Link to="/campaigns" className="tf-btn-secondary">Back to Campaigns</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">

      {/* Ambient Backlight */}
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      <div className="tf-container relative z-10">

        {/* Navigation */}
        <Link to="/campaigns" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Campaigns
        </Link>

        {/* Campaign Status */}
        {(isDraft || isPendingReview || isRejected) && (
          <div className="mb-6">
            {isRejected ? (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-300 flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Rejected</div>
                  <div className="text-sm opacity-90">This campaign is not visible on Explore and can’t accept donations.</div>
                  {campaign.rejectionReason && (
                    <div className="text-sm mt-1">Reason: {campaign.rejectionReason}</div>
                  )}
                </div>
              </div>
            ) : isDraft ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Draft (Off-Chain)</div>
                  <div className="text-sm opacity-90">Not live yet. Donations are disabled until it’s created on-chain and approved.</div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <Clock size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Pending Review</div>
                  <div className="text-sm opacity-90">Waiting for admin approval. Donations are disabled until approved.</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hero Header */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Left Column: Media & Story */}
          <div className="lg:col-span-2 space-y-8">

            {/* Main Card */}
            <div className="tf-card overflow-hidden p-0 border-0 shadow-xl shadow-black/5 bg-transparent">
              <div className={`relative ${hasCoverImage ? 'h-[400px] md:h-[500px]' : 'h-[260px] md:h-[320px]'}`}>
                <div className="absolute inset-0 bg-slate-900" /> {/* Fallback bg */}
                {hasCoverImage ? (
                  <img
                    src={coverUrl}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={() => setCoverImageOk(false)}
                  />
                ) : (
                  <div className="w-full h-full relative">
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${campaign.title.length % 2 === 0 ? 'from-primary/25 via-background/10 to-violet-500/20' : 'from-blue-500/25 via-background/10 to-teal-500/20'}`}
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0%,transparent_55%)] opacity-10" />
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                      <div className="flex items-center gap-3 rounded-xl bg-background/70 backdrop-blur border border-border px-4 py-3">
                        <ImageOff size={18} className="text-muted-foreground" />
                        <div className="text-sm">
                          <div className="font-semibold text-foreground">Cover image unavailable</div>
                          <div className="text-muted-foreground text-xs">Use a direct https image URL (jpg/png/webp).</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overlay Text */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/60 to-transparent pt-32 pb-8 px-6 sm:px-10">
                  <h1 className="font-heading text-3xl sm:text-5xl font-bold text-foreground leading-tight mb-4 drop-shadow-sm">
                    {campaign.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur border border-border text-xs font-semibold">
                      <User size={14} className="text-primary" />
                      <span>By {campaign.creator?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur border border-border text-xs font-semibold">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span>{campaign.createdAt ? new Date(campaign.createdAt).toLocaleDateString() : 'Recently'}</span>
                    </div>
                    {campaign.approved && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-semibold">
                        <Shield size={14} />
                        Verified
                      </div>
                    )}
                    {isRejected && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                        <AlertCircle size={14} />
                        Rejected
                      </div>
                    )}
                    {isPendingReview && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                        <Clock size={14} />
                        Pending
                      </div>
                    )}
                    {isDraft && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                        <AlertCircle size={14} />
                        Draft
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description Content */}
              <div className="p-6 sm:p-10 bg-card border-x border-b border-border rounded-b-2xl">
                <h2 className="text-xl font-bold mb-4 font-heading">About this Campaign</h2>
                <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-loose">
                  <p className="whitespace-pre-wrap">{campaign.description}</p>
                </div>

                {/* On Chain Info */}
                {campaign.onChainCampaignId != null && (
                  <div className="mt-8 p-4 rounded-xl bg-accent/30 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background border border-border text-primary">
                        <Shield size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Verified On-Chain on Sepolia</p>
                        <p className="text-xs text-muted-foreground">ID: #{campaign.onChainCampaignId}</p>
                      </div>
                    </div>
                    <a
                      href={`https://sepolia.etherscan.io/address/${ENV.VITE_CONTRACT_ADDRESS}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      View Contract <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Donation Panel */}
          <div className="space-y-6">
            <div className="sticky top-24 tf-card p-6 shadow-xl shadow-primary/5 bg-card/80 backdrop-blur-xl border-primary/10 ring-1 ring-primary/5">

              <div className="mb-8">
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Raised</p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold text-foreground tracking-tight">{raisedEth}</span>
                  <span className="text-lg font-medium text-muted-foreground">ETH</span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 w-full bg-accent rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs font-medium text-muted-foreground">
                  <span>{progressPercentage.toFixed(1)}% of {campaign.goalAmountEth} ETH goal</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">ETH</span>
                  <input
                    value={amountEth}
                    onChange={(e) => setAmountEth(e.target.value)}
                    className="w-full pl-14 pr-4 py-4 rounded-xl bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-bold text-lg text-foreground"
                    placeholder="0.01"
                    type="number"
                    min="0.01"
                    step="0.01"
                  />
                </div>

                {!connected ? (
                  <button
                    onClick={connect}
                    className="w-full py-4 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Wallet size={20} />
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    onClick={donate}
                    disabled={busy || !canDonateOnChain}
                    className="tf-btn-primary w-full py-4 text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Heart className="fill-current" size={20} />
                        Donate Now
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Status Messages */}
              <div className="mt-6 space-y-3">
                {!contractConfigured && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex gap-2 font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    Contract not configured. On-chain donations are disabled.
                  </div>
                )}

                {connected && !correctChain && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex gap-2 font-medium">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    Please switch to Sepolia network.
                  </div>
                )}

                {!canDonateOnChain && contractConfigured && (
                  <div className="p-3 rounded-lg bg-accent/30 border border-border text-foreground text-sm flex gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-muted-foreground" />
                    {isRejected
                      ? 'Donations disabled (rejected campaign).'
                      : isDraft
                        ? 'Donations disabled until this draft is created on-chain and approved.'
                        : isPendingReview
                          ? 'Donations disabled until admin approval.'
                          : 'Connect the correct wallet/network to donate.'}
                  </div>
                )}
                {txHash && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm flex gap-3 animate-in fade-in zoom-in-95">
                    <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                    <div className="break-all">
                      <span className="font-bold block text-sm mb-1 text-green-700 dark:text-green-300">Donation Successful!</span>
                      <span className="text-xs opacity-80">Tx: {txHash}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-center">
                <button className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                  <Share2 size={16} />
                  Share Campaign
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

