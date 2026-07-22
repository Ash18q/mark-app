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

    // check agar preview.images array hai toh pehli image le lo
    let thumbnail = null;
    if (preview.images && preview.images.length > 0) {
      thumbnail = preview.images[0];
    } else if (preview.favicons && preview.favicons.length > 0) {
      thumbnail = preview.favicons[0]; // fallback
    }

    if (thumbnail) {
      return res.status(200).json({ thumbnail });
    }
    return res.status(404).json({ error: 'Thumbnail not found' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
}
