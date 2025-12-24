import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { ethers } from 'ethers'
import { useWallet, requireCorrectChain } from '../context/WalletContext'
import { ENV } from '../lib/env'
import { getContract } from '../lib/contract'
import { useToast } from '../context/ToastContext'
import { normalizeImageUrl } from '../lib/image'
import { Rocket, Eye, AlertCircle, ArrowRight, Loader2, Sparkles, Wallet } from 'lucide-react'

export default function CreateCampaign() {
  const navigate = useNavigate()
  const { connected, signer, chainId, connect } = useWallet()
  const correctChain = requireCorrectChain(chainId)
  const toast = useToast()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalAmountEth, setGoalAmountEth] = useState('1')
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState(false)
  const [busy, setBusy] = useState(false)

  const [contractDeployed, setContractDeployed] = useState<boolean | null>(null)

  const contractConfigured =
    !!ENV.VITE_CONTRACT_ADDRESS &&
    ENV.VITE_CONTRACT_ADDRESS.toLowerCase() !== '0x0000000000000000000000000000000000000000'

  const goalNumber = Number(goalAmountEth)
  const goalValid = Number.isFinite(goalNumber) && goalNumber >= 0
  const likelyOnChain =
    connected &&
    !!signer &&
    correctChain &&
    contractConfigured &&
    contractDeployed === true &&
    goalValid &&
    goalNumber > 0

  const draftLikely = !contractConfigured || contractDeployed === false || (goalValid && goalNumber === 0)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          if (!connected || !signer || !correctChain || !contractConfigured) {
            if (mounted) setContractDeployed(null)
            return
          }
          const code = await signer.provider.getCode(ENV.VITE_CONTRACT_ADDRESS)
          if (mounted) setContractDeployed(!!code && code !== '0x')
        } catch {
          if (mounted) setContractDeployed(null)
        }
      })()
    return () => {
      mounted = false
    }
  }, [connected, signer, correctChain, contractConfigured])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (!connected || !signer) throw new Error('Connect your wallet to create a campaign')
      if (!correctChain) throw new Error('Wrong network. Switch MetaMask to Sepolia')

      const cleanTitle = title.trim()
      const cleanDescription = description.trim()
      if (cleanTitle.length < 3) throw new Error('Campaign title must be at least 3 characters')
      if (cleanDescription.length < 10) throw new Error('Description must be at least 10 characters')

      const goalNumber = Number(goalAmountEth)
      if (!Number.isFinite(goalNumber) || goalNumber < 0) {
        throw new Error('Goal amount must be 0 or greater')
      }

      // Decide whether to create on-chain or fall back to DB-only.
      // On-chain is only attempted when contract is configured + deployed and the wallet has gas.
      let shouldCreateOnChain = contractConfigured && contractDeployed === true

      // Basic gas preflight: if the connected wallet has 0 ETH, on-chain will fail.
      try {
        const walletAddress = await signer.getAddress()
        const walletBalance = await signer.provider.getBalance(walletAddress)
        if (!walletBalance || walletBalance === 0n) {
          shouldCreateOnChain = false
        }
      } catch {
        // If balance check fails, keep current decision.
      }

      if (shouldCreateOnChain) {
        if (goalNumber <= 0) throw new Error('Goal amount must be greater than 0 ETH for on-chain campaigns')

        const code = await signer.provider.getCode(ENV.VITE_CONTRACT_ADDRESS)
        if (!code || code === '0x') {
          console.error('Missing contract bytecode at', ENV.VITE_CONTRACT_ADDRESS)
          shouldCreateOnChain = false
        }
      }

      let onChainCampaignId: number | undefined

      if (shouldCreateOnChain) {
        const goalWei = ethers.parseEther(String(goalAmountEth))
        const contract = getContract(signer)

        // Step 1: Create on-chain
        const tx = await contract.createCampaign(title, goalWei)
        toast('info', 'Transaction sent. Waiting for confirmation...')
        const receipt = await tx.wait()

        // Find the CampaignCreated event
        const event = receipt.logs
          .map((log: any) => {
            try {
              return contract.interface.parseLog(log)
            } catch (e) {
              return null
            }
          })
          .find((parsed: any) => parsed?.name === 'CampaignCreated')

        if (!event) throw new Error('Transaction succeeded but failed to retrieve campaign ID from events')

        onChainCampaignId = Number(event.args[0])
      } else {
        toast('info', 'Creating an off-chain draft (donations stay disabled until on-chain + approval).')
      }

      // Save to DB
      const res = await api.post<{ campaign: { _id: string } }>('/campaigns', {
        title,
        description,
        goalAmountEth: Number(goalAmountEth),
        imageUrl,
        ...(typeof onChainCampaignId === 'number' ? { onChainCampaignId } : {})
      })

      toast('success', shouldCreateOnChain ? 'Campaign created successfully!' : 'Draft created successfully!')
      navigate(`/campaigns/${res.data.campaign._id}`)
    } catch (err: any) {
      toast('error', err?.shortMessage || err?.response?.data?.message || err?.message || 'Create campaign failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-28 pb-16">
      <div className="tf-container">

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Create Campaign</h1>
            <p className="mt-2 text-muted-foreground text-lg">Creates on-chain when possible, otherwise saves an off-chain draft.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Left Column: Editor Form */}
          <div className="space-y-8">
            <div className="p-8 rounded-3xl bg-card border border-border shadow-sm">
              <form onSubmit={onSubmit} className="space-y-8">

                {/* Steps Visualizer */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Step 1</span>
                    <div className="h-1.5 bg-primary rounded-full" />
                    <span className="text-sm font-medium text-foreground">Create (On-Chain When Available)</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2 opacity-40">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step 2</span>
                    <div className="h-1.5 bg-muted rounded-full" />
                    <span className="text-sm font-medium text-muted-foreground">Admin Review</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Campaign Title
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Community Garden Project"
                      className="tf-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Cover Image URL
                    </label>
                    <input
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value)
                        setImageError(false)
                      }}
                      placeholder="https://example.com/image.jpg"
                      type="url"
                      className="tf-input"
                    />
                    <p className="text-xs text-muted-foreground">Supports `https://`, `ipfs://`, and `ar://` URLs.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell your story. What will the funds be used for?"
                      className="tf-input min-h-[160px] py-3"
                      required
                    />
                    <p className="text-xs text-muted-foreground">Be transparent using Markdown or plain text.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Goal Amount (ETH)
                    </label>
                    <div className="relative">
                      <input
                        value={goalAmountEth}
                        onChange={(e) => setGoalAmountEth(e.target.value)}
                        placeholder="1.5"
                        type="number"
                        min="0"
                        step="0.01"
                        className="tf-input pr-12"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-right">
                        <div className="font-bold text-foreground text-sm">ETH</div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set this to 0 to save a draft (not live, donations disabled).
                    </p>
                  </div>
                </div>

                {/* Validation / Wallet States */}
                {!contractConfigured && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm flex gap-3">
                    <AlertCircle className="shrink-0" size={18} />
                    Contract address not configured.
                  </div>
                )}

                {draftLikely && (
                  <div className="p-4 rounded-xl bg-accent/40 border border-border text-foreground text-sm flex items-start gap-3">
                    <AlertCircle className="shrink-0 mt-0.5 text-muted-foreground" size={18} />
                    <div>
                      <div className="font-semibold">This will be saved as a draft.</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Drafts are not visible on Explore and can’t receive on-chain donations until they’re created on-chain and approved.
                      </div>
                    </div>
                  </div>
                )}

                {!connected ? (
                  <button
                    type="button"
                    onClick={connect}
                    className="w-full py-4 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <Wallet size={20} />
                    Connect Wallet
                  </button>
                ) : (
                  <button
                    disabled={busy || !correctChain}
                    className="tf-btn-primary w-full h-14 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40"
                  >
                    {busy ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Rocket size={24} />
                        {likelyOnChain ? 'Launch On-Chain Campaign' : 'Create Draft'}
                      </>
                    )}
                  </button>
                )}

                {connected && !correctChain && (
                  <div className="text-center text-sm text-destructive font-medium">
                    Please switch your wallet to Sepolia Network.
                  </div>
                )}

              </form>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/50 border border-border">
              <h4 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                <Sparkles size={18} className="text-primary" /> Tips for Success
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Be Real:</strong> Set a realistic goal you can clearly justify.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Visuals Matter:</strong> A high-quality cover image builds trust instantly.</span>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span><strong>Verification:</strong> Admins review every campaign to ensure safety.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Preview */}
          <div className="hidden lg:block space-y-6 sticky top-24">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-1">
              <Eye size={16} /> Live Preview
            </h3>

            <div className="transform hover:scale-[1.02] transition-transform duration-500 origin-top">
              {/* Replicating CampaignCard logic */}
              <div className="tf-card p-0 overflow-hidden h-auto bg-card border-border shadow-2xl">
                <div className="h-56 bg-accent relative overflow-hidden group">
                  {normalizeImageUrl(imageUrl) && !imageError ? (
                    <img
                      src={normalizeImageUrl(imageUrl)}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${(title || 'Untitled').length % 2 === 0 ? 'from-primary/20 to-violet-500/20' : 'from-blue-500/20 to-teal-500/20'}`}>
                      {imageUrl && imageError && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-center">
                          <div className="text-white text-xs font-semibold">
                            <AlertCircle className="mx-auto mb-1" size={16} />
                            Image failed to load.<br />Check URL.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    {likelyOnChain ? (
                      <span className="px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-semibold text-primary shadow-sm">
                        Creating On-Chain
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-semibold text-muted-foreground shadow-sm">
                        Draft
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
                      {title || 'Campaign Title'}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {description || 'Your exciting campaign description will appear here. Make it catchy!'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-foreground">0.00 ETH</span>
                      <span className="text-muted-foreground">of {goalAmountEth || '0'} ETH</span>
                    </div>
                    <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full w-[0%]" />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground font-medium">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        Y
                      </div>
                      You
                    </div>
                    <span className="flex items-center gap-1 text-sm font-semibold text-primary">
                      View <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground px-8">
              This is how your campaign will appear to donors on the Explore page.
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}
