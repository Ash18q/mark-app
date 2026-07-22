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

    console.log('[Preview] URL:', url, 'Title:', title, 'Image:', thumbnail);

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
