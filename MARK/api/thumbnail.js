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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    let thumbnail = null;
    if (preview.images && preview.images.length > 0) {
      thumbnail = preview.images[0];
    } else if (preview.favicons && preview.favicons.length > 0) {
      thumbnail = preview.favicons[0]; // fallback
    }

    let title = preview.title || null;
    if (!title) {
      try {
        title = new URL(url).hostname;
      } catch {
        title = url;
      }
    }

    console.log('[Preview] URL:', url, 'Title:', title, 'Image:', thumbnail);

    return res.status(200).json({ thumbnail, title });
  } catch (error) {
    let domainTitle = '';
    try {
      domainTitle = new URL(url).hostname;
    } catch {
      domainTitle = url;
    }
    console.log('[Preview Error] URL:', url, 'Error:', error?.message);
    return res.status(200).json({ thumbnail: null, title: domainTitle });
  }
}
