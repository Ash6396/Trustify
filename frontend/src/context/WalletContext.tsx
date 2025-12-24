import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { ENV } from '../lib/env'

type WalletContextValue = {
  connected: boolean
  account: string | null
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

function getEthereum(): any {
  return (window as any).ethereum
}

function toHexChainId(chainId: number): string {
  return `0x${chainId.toString(16)}`
}

async function ensureCorrectChain(eth: any): Promise<void> {
  const targetChainId = ENV.VITE_CHAIN_ID
  const currentHex: string = await eth.request({ method: 'eth_chainId' })
  const targetHex = toHexChainId(targetChainId)
  if (currentHex?.toLowerCase() === targetHex.toLowerCase()) return

  if (!ENV.VITE_RPC_URL) {
    throw new Error('Missing VITE_RPC_URL. Set it in Vercel Environment Variables to enable wallet switching.')
  }

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetHex }]
    })
  } catch (err: any) {
    // 4902: Unrecognized chain, add it then switch.
    if (err?.code !== 4902) throw err
    await eth.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: targetHex,
          chainName: 'Sepolia',
          nativeCurrency: { name: 'SepoliaETH', symbol: 'SEP', decimals: 18 },
          rpcUrls: [ENV.VITE_RPC_URL],
          blockExplorerUrls: ['https://sepolia.etherscan.io']
        }
      ]
    })
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  async function syncFromProvider(p: ethers.BrowserProvider) {
    const s = await p.getSigner()
    const net = await p.getNetwork()
    setProvider(p)
    setSigner(s)
    setAccount(await s.getAddress())
    setChainId(Number(net.chainId))
  }

  async function connect() {
    const eth = getEthereum()
    if (!eth) throw new Error('MetaMask not detected')

    // Proactively switch to Sepolia so pages don't fail later on "Wrong network".
    await ensureCorrectChain(eth)

    const p = new ethers.BrowserProvider(eth)
    await p.send('eth_requestAccounts', [])
    await syncFromProvider(p)
  }

  function disconnect() {
    setAccount(null)
    setChainId(null)
    setProvider(null)
    setSigner(null)
  }

  useEffect(() => {
    const eth = getEthereum()
    if (!eth) return

    const onAccountsChanged = (accounts: string[]) => {
      if (!accounts || accounts.length === 0) disconnect()
      else setAccount(accounts[0])
    }
    const onChainChanged = (hexChainId: string) => {
      const cid = Number.parseInt(hexChainId, 16)
      setChainId(cid)

      // Refresh provider/signer after a network switch to avoid stale signer.
      const next = new ethers.BrowserProvider(eth)
      syncFromProvider(next).catch(() => {
        // If user cancels or signer can't be resolved, keep minimal state.
        setProvider(next)
        setSigner(null)
      })
    }

    eth.on?.('accountsChanged', onAccountsChanged)
    eth.on?.('chainChanged', onChainChanged)

    return () => {
      eth.removeListener?.('accountsChanged', onAccountsChanged)
      eth.removeListener?.('chainChanged', onChainChanged)
    }
  }, [])

  const connected = !!account && !!provider && !!signer

  const value = useMemo<WalletContextValue>(
    () => ({ connected, account, chainId, provider, signer, connect, disconnect }),
    [connected, account, chainId, provider, signer]
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

export function requireCorrectChain(chainId: number | null): boolean {
  return chainId === ENV.VITE_CHAIN_ID
}
