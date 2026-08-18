import { getLinkPreview } from 'link-preview-js'

const COBALT_SERVERS = [
  import.meta.env?.VITE_COBALT_API_URL_1 || 'https://api.cobalt.tools',
  import.meta.env?.VITE_COBALT_API_URL_2 || 'https://cobalt.api.g7kk.com',
  import.meta.env?.VITE_COBALT_API_URL_3 || 'https://cobalt-api.kwiateknis.xyz',
  import.meta.env?.VITE_COBALT_API_URL_4 || 'https://cobalt.suwako.jp',
  import.meta.env?.VITE_COBALT_API_URL_5 || 'https://cobalt.hyperfury.xyz'
]

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

/**
 * Extracts full text from web pages, blogs, GitHub repos, news articles using Jina AI Reader API
 */
export async function extractTextContent(url) {
  let fullText = ''
  let pageTitle = ''
  let thumbnail = null

  // 1. Primary: Try Jina Reader API (r.jina.ai turns ANY webpage/blog/github repo into clean markdown text)
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      headers: {
        'Accept': 'text/plain',
        'X-With-Generated-Alt': 'true'
      },
      signal: controller.signal
    })
    clearTimeout(timeoutId)

    if (response.ok) {
      const textData = await response.text()
      if (textData && textData.length > 100) {
        fullText = textData.slice(0, 15000)
        
        // Extract Title from markdown (e.g. Title: ...)
        const titleMatch = textData.match(/^Title:\s*(.+)$/m) || textData.match(/^#\s*(.+)$/m)
        if (titleMatch) {
          pageTitle = titleMatch[1].trim()
        }
      }
    }
  } catch (err) {
    console.warn('[MARK] Jina AI Reader fetch error:', err)
  }

  // 2. Secondary: link-preview-js for metadata/thumbnail
  try {
    const preview = await getLinkPreview(url, { timeout: 4000 })
    if (preview) {
      thumbnail = preview.images?.[0] || preview.favicons?.[0] || null
      if (!pageTitle && preview.title) pageTitle = preview.title
      if (!fullText) {
        fullText = [preview.title, preview.description, preview.content].filter(Boolean).join('\n\n')
      }
    }
  } catch (err) {
    console.warn('[MARK] Link preview fallback error:', err)
  }

  // 3. Tertiary CORS Proxy fallback if Jina/link-preview failed
  if (!fullText || fullText.length < 50) {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
      const res = await fetch(proxyUrl)
      if (res.ok) {
        const json = await res.json()
        if (json.contents) {
          // Strip HTML tags
          const textOnly = json.contents.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
          
          fullText = textOnly.slice(0, 10000)
        }
      }
    } catch (e) {
      console.warn('[MARK] CORS proxy fallback error:', e)
    }
  }

  return {
    text: fullText || `Article URL: ${url}`,
    thumbnail: thumbnail || null,
    title: pageTitle || ''
  }
}

/**
 * Extracts video title, author, caption, description, and transcript from Instagram Reels, YouTube, TikTok
 */
export async function extractVideoContent(url) {
  let videoCaption = ''
  let videoTitle = ''
  let thumbnail = null

  // 1. Try oEmbed Endpoints (YouTube, Instagram)
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      if (oembedRes.ok) {
        const data = await oembedRes.json()
        videoTitle = data.title || ''
        videoCaption = `YouTube Video: ${data.title}\nChannel: ${data.author_name}`
        thumbnail = data.thumbnail_url || null
      }
    } else if (url.includes('instagram.com')) {
      // Try Instagram oEmbed
      const oembedRes = await fetch(`https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`)
      if (oembedRes.ok) {
        const data = await oembedRes.json()
        videoTitle = data.title || data.author_name ? `Instagram Reel by ${data.author_name}` : ''
        videoCaption = `Instagram Reel Caption & Details:\n${data.title || ''}\nAuthor: ${data.author_name || ''}`
        thumbnail = data.thumbnail_url || null
      }
    }
  } catch (err) {
    console.warn('[MARK] Video oEmbed error:', err)
  }

  // 2. Try Cobalt API Rotation for video metadata extraction
  if (!videoCaption || videoCaption.length < 30) {
    for (const serverUrl of COBALT_SERVERS) {
      try {
        const res = await fetch(serverUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: url,
            videoQuality: '720',
            filenamePattern: 'basic'
          })
        })

        if (res.ok) {
          const data = await res.json()
          if (data && (data.picker || data.url || data.text)) {
            if (data.text) videoCaption = data.text
            if (data.filename) videoTitle = data.filename
            break
          }
        }
      } catch (err) {
        console.warn(`[MARK] Cobalt API server ${serverUrl} attempt failed:`, err)
      }
    }
  }

  // 3. Try Jina AI Reader API on Video Page (frequently extracts full caption, comments, description of reels/shorts)
  if (!videoCaption || videoCaption.length < 50) {
    try {
      const res = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`)
      if (res.ok) {
        const textData = await res.text()
        if (textData && textData.length > 50) {
          videoCaption = textData.slice(0, 12000)

          const titleMatch = textData.match(/^Title:\s*(.+)$/m)
          if (titleMatch && !videoTitle) videoTitle = titleMatch[1].trim()
        }
      }
    } catch (e) {
      console.warn('[MARK] Jina video page reader fallback error:', e)
    }
  }

  // 4. link-preview-js fallback
  try {
    const preview = await getLinkPreview(url, { timeout: 4000 })
    if (preview) {
      if (!thumbnail) thumbnail = preview.images?.[0] || preview.favicons?.[0] || null
      if (!videoTitle && preview.title) videoTitle = preview.title
      if (!videoCaption && (preview.description || preview.title)) {
        videoCaption = `Video Details:\nTitle: ${preview.title || ''}\nDescription: ${preview.description || ''}`
      }
    }
  } catch (err) {
    console.warn('[MARK] Link preview video fallback error:', err)
  }

  const combinedContent = [
    videoTitle ? `Video Title: ${videoTitle}` : '',
    videoCaption ? `Video Transcript / Caption & Description:\n${videoCaption}` : '',
    `Source Video URL: ${url}`
  ].filter(Boolean).join('\n\n')

  return {
    text: combinedContent || `Video URL: ${url}`,
    thumbnail: thumbnail || null,
    title: videoTitle || 'Shared Video / Reel'
  }
}
