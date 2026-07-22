import { getLinkPreview } from 'link-preview-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // ── Layer 1: link-preview-js (Primary) ──────────────────────────────────
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

  // ── Layer 2: og.space API (Fallback) ─────────────────────────────────────
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

  // ── Layer 3: Manual HTML Parse (Last Resort) ─────────────────────────────
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
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }
  const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  console.log('[Preview - Final Fallback] URL:', url, 'Title:', domain, 'Image:', fallbackFavicon);

  return res.status(200).json({
    thumbnail: fallbackFavicon,
    title: domain
  });
}
