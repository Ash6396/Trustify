const missing: string[] = []

function readEnv(key: string): string | undefined {
  const v = (import.meta.env as Record<string, any>)[key] as string | undefined
  const s = v == null ? '' : String(v)
  return s.trim() === '' ? undefined : s
}

function envString(key: string, opts?: { required?: boolean; defaultValue?: string }): string {
  const v = readEnv(key)
  if (v != null) return v
  if (opts?.required) missing.push(key)
  return opts?.defaultValue ?? ''
}

function envNumber(key: string, opts?: { required?: boolean; defaultValue?: number }): number {
  const v = readEnv(key)
  if (v != null) {
    const n = Number(v)
    if (!Number.isNaN(n)) return n
  }
  if (opts?.required) missing.push(key)
  return opts?.defaultValue ?? 0
}

export const ENV = {
  VITE_API_BASE_URL: envString('VITE_API_BASE_URL', { required: true }),
  VITE_CHAIN_ID: envNumber('VITE_CHAIN_ID', { defaultValue: 11155111 }),
  VITE_RPC_URL: envString('VITE_RPC_URL'),
  VITE_CONTRACT_ADDRESS: envString('VITE_CONTRACT_ADDRESS', {
    defaultValue: '0x0000000000000000000000000000000000000000'
  })
}

export const ENV_MISSING = missing

if (ENV_MISSING.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(`[env] Missing required Vite env vars: ${ENV_MISSING.join(', ')}`)
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
