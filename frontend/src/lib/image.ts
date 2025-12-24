export function normalizeImageUrl(raw?: string): string {
  const url = (raw || '').trim()
  if (!url) return ''

  // Support common decentralized schemes by converting to gateway URLs.
  if (url.startsWith('ipfs://')) {
    // ipfs://<cid>/path OR ipfs://ipfs/<cid>/path
    let path = url.slice('ipfs://'.length)
    if (path.startsWith('ipfs/')) path = path.slice('ipfs/'.length)
    return `https://ipfs.io/ipfs/${path}`
  }

  if (url.startsWith('ar://')) {
    const id = url.slice('ar://'.length)
    return `https://arweave.net/${id}`
  }

  return url
}
