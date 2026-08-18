import { getLinkPreview } from 'link-preview-js'

export async function detectContentType(url) {
  if (!url) return 'unknown'
  try {
    const videoPlatforms = [
      'youtube.com', 'youtu.be', 'instagram.com', 'tiktok.com',
      'vimeo.com', 'facebook.com/reel', 'fb.watch', 'twitter.com/i/status'
    ]
    const hostname = new URL(url).hostname.toLowerCase()
    
    if (videoPlatforms.some(p => hostname.includes(p) || url.toLowerCase().includes('/reel/') || url.toLowerCase().includes('/shorts/'))) {
      return 'video'
    }
    
    return 'text'
  } catch {
    return 'unknown'
  }
}

export async function extractTextContent(url) {
  try {
    const preview = await getLinkPreview(url, { timeout: 6000 })
    return {
      text: preview.description || preview.content || preview.title || url,
      thumbnail: preview.images?.[0] || preview.favicons?.[0] || null,
      title: preview.title || ''
    }
  } catch (error) {
    console.warn('[MARK] Text extraction fallback:', error)
    return { text: url, thumbnail: null, title: '' }
  }
}

export async function extractVideoContent(url) {
  try {
    const preview = await getLinkPreview(url, { timeout: 6000 })
    
    // Attempt to extract title/description/caption from video URL metadata
    const videoText = [
      preview.title ? `Video Title: ${preview.title}` : '',
      preview.description ? `Video Description/Caption: ${preview.description}` : '',
      `Source Video Link: ${url}`
    ].filter(Boolean).join('\n\n')

    return {
      text: videoText || url,
      thumbnail: preview.images?.[0] || preview.favicons?.[0] || null,
      title: preview.title || 'Shared Video Link'
    }
  } catch (error) {
    console.warn('[MARK] Video extraction fallback:', error)
    return {
      text: `Shared Video Link: ${url}`,
      thumbnail: null,
      title: 'Shared Video Link'
    }
  }
}
