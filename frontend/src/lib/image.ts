export function normalizeImageUrl(raw?: string): string {
  const url = (raw || '').trim()
  if (!url) return ''

  // Protocol-relative URLs (e.g. //example.com/a.jpg)
  if (url.startsWith('//')) {
    return `https:${url}`
  }

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

  // Common Google Drive share links are not direct image URLs.
  // Convert to the "uc" endpoint so <img> can fetch it.
  try {
    const u = new URL(url)
    if (u.hostname === 'drive.google.com') {
      const m = u.pathname.match(/\/file\/d\/([^/]+)\//)
      const id = m?.[1] || u.searchParams.get('id')
      if (id) return `https://drive.google.com/uc?export=view&id=${id}`
    }

    // Avoid mixed-content issues: if the site is https and the image is http, upgrade.
    if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && u.protocol === 'http:') {
      u.protocol = 'https:'
      return u.toString()
    }

    return u.toString()
  } catch {
    // If it's not a valid URL, treat it as missing.
    return ''
  }
}
