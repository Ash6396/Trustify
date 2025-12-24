function requireEnv(key: string): string {
  const v = (import.meta.env as Record<string, any>)[key] as string | undefined
  if (!v || String(v).trim() === '') {
    throw new Error(`Missing required env var: ${key}`)
  }
  return v
}

export const ENV = {
  VITE_API_BASE_URL: requireEnv('VITE_API_BASE_URL'),
  VITE_CHAIN_ID: Number(requireEnv('VITE_CHAIN_ID')),
  VITE_RPC_URL: requireEnv('VITE_RPC_URL'),
  VITE_CONTRACT_ADDRESS: requireEnv('VITE_CONTRACT_ADDRESS')
}

export type Role = 'donor' | 'creator' | 'admin'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  createdAt?: string
  updatedAt?: string
}
