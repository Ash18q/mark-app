export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname.toLowerCase();

    // ── 1. YouTube Specialized Handler (Official oEmbed API) ─────────────────
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          const title = data.title || 'YouTube Video';
          const thumbnail = data.thumbnail_url || null;
          return res.status(200).json({ thumbnail, title });
        }
      } catch (e) { /* fallback below */ }

      // YouTube Video ID extraction fallback
      let vid = urlObj.searchParams.get('v');
      if (!vid && host.includes('youtu.be')) {
        vid = urlObj.pathname.replace('/', '').split('/')[0];
      }
      if (!vid) {
        const match = urlObj.pathname.match(/\/(shorts|embed|v)\/([^/?#]+)/);
        if (match) vid = match[2];
      }
      if (vid) {
        return res.status(200).json({
          thumbnail: `https://img.youtube.com/vi/${vid}/hqdefault.jpg`,
          title: 'YouTube Video'
        });
      }
    }

    // ── 2. Instagram Specialized Handler (weserv.nl + ddinstagram) ─────────
    if (host.includes('instagram.com') || host.includes('instagr.am')) {
      const match = url.match(/\/(p|reel|reels|tv|share\/p|share\/reel)\/([^/?#'"\s]+)/);
      if (match && match[2]) {
        const shortcode = match[2];
        const instaThumb = `https://images.weserv.nl/?url=https://www.instagram.com/p/${shortcode}/media/?size=l`;

        // Try ddinstagram oEmbed for caption/title
        try {
          const ddRes = await fetch(`https://ddinstagram.com/o/p/${shortcode}.json`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(4000)
          });
          if (ddRes.ok) {
            const ddData = await ddRes.json();
            return res.status(200).json({
              thumbnail: ddData.image || instaThumb,
              title: ddData.caption || ddData.title || `Instagram Post (${shortcode})`
            });
          }
        } catch (e) { /* fallback below */ }

        return res.status(200).json({
          thumbnail: instaThumb,
          title: `Instagram Post`
        });
      }
    }

    // ── 3. Standard Webpage Handler (HTML Fetch) ───────────────────────────
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // Extract og:image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    let thumbnail = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, '&') : null;

    if (thumbnail && thumbnail.startsWith('/')) {
      thumbnail = urlObj.origin + thumbnail;
    }

    if (!thumbnail) {
      const faviconMatch = html.match(/<link\s+rel=["'](?:shortcut\s+)?icon["']\s+href=["']([^"']+)["']/i);
      if (faviconMatch) {
        const faviconUrl = faviconMatch[1];
        thumbnail = faviconUrl.startsWith('/') ? urlObj.origin + faviconUrl : faviconUrl;
      }
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : null;

    if (!title) {
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
      title = ogTitleMatch ? ogTitleMatch[1].trim() : null;
    }

    if (!title) {
      title = urlObj.hostname.replace('www.', '');
    }

    return res.status(200).json({ thumbnail, title });

  } catch (error) {
    console.error('[Thumbnail Error]', error.message);
    let hostname = 'link';
    try {
      hostname = new URL(url).hostname.replace('www.', '');
    } catch { /* ignore */ }

    return res.status(200).json({ 
      error: 'Failed to fetch thumbnail',
      thumbnail: `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`,
      title: hostname
    });
  }
}
