export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    // Fetch the HTML page with a proper User-Agent
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

    // Fallback: if og:image is relative URL, convert to absolute
    if (thumbnail && thumbnail.startsWith('/')) {
      const baseUrl = new URL(url).origin;
      thumbnail = baseUrl + thumbnail;
    }

    // Fallback: if no og:image, try favicon
    if (!thumbnail) {
      const faviconMatch = html.match(/<link\s+rel=["'](?:shortcut\s+)?icon["']\s+href=["']([^"']+)["']/i);
      if (faviconMatch) {
        const faviconUrl = faviconMatch[1];
        if (faviconUrl.startsWith('/')) {
          thumbnail = new URL(url).origin + faviconUrl;
        } else {
          thumbnail = faviconUrl;
        }
      }
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : null;

    // Fallback: if no title, use og:title
    if (!title) {
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);
      title = ogTitleMatch ? ogTitleMatch[1].trim() : null;
    }

    // Final fallback: domain name
    if (!title) {
      title = new URL(url).hostname.replace('www.', '');
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
