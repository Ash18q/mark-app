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

    // ── 2. Instagram Specialized Handler (Meta Graph oEmbed + Fallback) ──────
    if (url.includes('instagram.com') || url.includes('instagr.am')) {
      const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN || process.env.FACEBOOK_ACCESS_TOKEN || process.env.INSTAGRAM_TOKEN || process.env.INSTA_TOKEN;
      console.log('[Instagram] Token exists:', !!accessToken);

      // Extract shortcode cleanly from any Instagram URL format
      const shortcodeMatch = url.match(/\/(?:p|reel|reels|tv|share\/p|share\/reel)\/([^/?#'"\s]+)/);
      const shortcode = shortcodeMatch ? shortcodeMatch[1] : null;

      if (shortcode) {
        const canonicalUrl = `https://www.instagram.com/p/${shortcode}/`;

        if (accessToken) {
          try {
            const oembedUrl = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(canonicalUrl)}&access_token=${accessToken}`;
            const resp = await fetch(oembedUrl);
            console.log('[Instagram oEmbed Status]', resp.status);
            if (resp.ok) {
              const data = await resp.json();
              if (data.thumbnail_url) {
                const titleText = data.title || (data.author_name ? `@${data.author_name} on Instagram` : 'Instagram Post');
                console.log('[Instagram oEmbed Success] Title:', titleText, 'Image:', data.thumbnail_url);
                return res.status(200).json({
                  thumbnail: data.thumbnail_url,
                  title: titleText
                });
              }
            } else {
              const errBody = await resp.text();
              console.log('[Instagram oEmbed Error Response]', errBody);
            }
          } catch (e) {
            console.error('[Instagram oEmbed] Error:', e.message);
          }
        }

        // Fallback using clean canonical URL image proxy
        const instaThumb = `https://images.weserv.nl/?url=https://www.instagram.com/p/${shortcode}/media/?size=l`;
        console.log('[Preview - Instagram Fallback] Shortcode:', shortcode, 'Image:', instaThumb);
        return res.status(200).json({ thumbnail: instaThumb, title: 'Instagram Post' });
      }
    }

    // ── 3. Layer 1: link-preview-js (Primary General) ──────────────────────
    try {
      const preview = await getLinkPreview(url, {
        timeout: 5000,
        followRedirects: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      let thumbnail = (preview.images && preview.images.length > 0) ? preview.images[0] : ((preview.favicons && preview.favicons.length > 0) ? preview.favicons[0] : null);
      let title = preview.title || preview.siteName || null;

      const isBadTitle = title && (title.includes('403') || title.toLowerCase().includes('forbidden') || title.toLowerCase().includes('access denied'));

      if (thumbnail && title && !isBadTitle) {
        console.log('[Preview - Layer 1 Success] URL:', url, 'Title:', title, 'Image:', thumbnail);
        return res.status(200).json({ thumbnail, title });
      }
    } catch (e) {
      console.log('[Preview - Layer 1 Failed] URL:', url, 'Error:', e?.message);
    }

    // ── 4. Layer 2: og.space API (Fallback) ─────────────────────────────────
    try {
      const resp = await fetch(`https://og.space/api/v1/og?url=${encodeURIComponent(url)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.image) {
          console.log('[Preview - Layer 2 Success] URL:', url, 'Title:', data.title, 'Image:', data.image);
          return res.status(200).json({ thumbnail: data.image, title: data.title || '' });
        }
      }
    } catch (e) {
      console.log('[Preview - Layer 2 Failed] URL:', url, 'Error:', e?.message);
    }

    // ── 5. Layer 3: Manual HTML Parse (Last Resort) ─────────────────────────
    try {
      const htmlResp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (htmlResp.ok) {
        const html = await htmlResp.text();
        const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);

        const title = titleMatch ? titleMatch[1].trim() : null;
        const thumbnail = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, '&') : null;

        if (thumbnail) {
          console.log('[Preview - Layer 3 Success] URL:', url, 'Title:', title, 'Image:', thumbnail);
          return res.status(200).json({ thumbnail, title: title || new URL(url).hostname });
        }
      }
    } catch (e) {
      console.log('[Preview - Layer 3 Failed] URL:', url, 'Error:', e?.message);
    }

    // ── Final Fallback: Favicon + Domain Name ──────────────────────────────
    let domain = '';
    try {
      domain = new URL(url).hostname.replace('www.', '');
    } catch {
      domain = url;
    }
    const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    console.log('[Preview - Final Fallback] URL:', url, 'Title:', domain, 'Image:', fallbackFavicon);

    return res.status(200).json({
      thumbnail: fallbackFavicon,
      title: domain
    });

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
