import { getLinkPreview } from 'link-preview-js';

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
      // Extract Video ID for guaranteed high-res thumbnail
      let vid = urlObj.searchParams.get('v');
      if (!vid && host.includes('youtu.be')) {
        vid = urlObj.pathname.replace('/', '').split('/')[0];
      }
      if (!vid) {
        const match = urlObj.pathname.match(/\/(shorts|embed|v)\/([^/?#]+)/);
        if (match) vid = match[2];
      }

      let ytThumbnail = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null;
      let ytTitle = null;

      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          ytTitle = data.title ? data.title.replace(/ - YouTube$/i, '').trim() : null;
          if (!ytThumbnail && data.thumbnail_url) {
            ytThumbnail = data.thumbnail_url;
          }
        }
      } catch (e) {
        console.log('[YouTube oEmbed Failed]', e?.message);
      }

      if (ytThumbnail || ytTitle) {
        const finalTitle = ytTitle || 'YouTube Video';
        const finalThumb = ytThumbnail || 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128';
        console.log('[Preview - YouTube] Title:', finalTitle, 'Image:', finalThumb);
        return res.status(200).json({ thumbnail: finalThumb, title: finalTitle });
      }
    }

    // ── 2. Instagram Specialized Handler (weserv.nl + ddinstagram) ─────────
    if (host.includes('instagram.com') || host.includes('instagr.am')) {
      const match = url.match(/\/(p|reel|reels|tv|share\/p|share\/reel)\/([^/?#'"\s]+)/);
      if (match && match[2]) {
        const shortcode = match[2];
        const instaThumb = `https://images.weserv.nl/?url=https://www.instagram.com/p/${shortcode}/media/?size=l`;
        let instaTitle = null;

        // Try ddinstagram oEmbed API for real post caption / title
        try {
          const ddRes = await fetch(`https://ddinstagram.com/o/p/${shortcode}.json`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(4000)
          });
          if (ddRes.ok) {
            const ddData = await ddRes.json();
            instaTitle = ddData.caption || ddData.title || null;
          }
        } catch (e) {
          console.log('[Instagram ddinstagram Failed]', e?.message);
        }

        const finalTitle = instaTitle || `Instagram Post`;
        console.log('[Preview - Instagram] Title:', finalTitle, 'Image:', instaThumb);
        return res.status(200).json({ thumbnail: instaThumb, title: finalTitle });
      }
    }

    // ── 3. General Websites & Twitter / X (link-preview-js) ────────────────
    const preview = await getLinkPreview(url, {
      timeout: 5000,
      followRedirects: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    let thumbnail = (preview.images && preview.images.length > 0) ? preview.images[0] : ((preview.favicons && preview.favicons.length > 0) ? preview.favicons[0] : null);

    let title = preview.title || preview.siteName || null;
    if (!title) {
      try {
        title = new URL(url).hostname.replace('www.', '');
      } catch {
        title = url;
      }
    }

    console.log('[Preview - General] URL:', url, 'Title:', title, 'Image:', thumbnail);
    return res.status(200).json({ thumbnail, title });

  } catch (error) {
    let domain = '';
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch {
      domain = url;
    }
    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    console.log('[Preview Error] URL:', url, 'Title:', domain, 'Image:', fallbackFavicon, 'Error:', error?.message);

    return res.status(200).json({ thumbnail: fallbackFavicon, title: domain });
  }
}
