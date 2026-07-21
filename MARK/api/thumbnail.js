export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();

    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (match && match[1]) {
      const rawImgUrl = match[1].replace(/&amp;/g, '&');
      const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(rawImgUrl)}`;
      return res.status(200).json({ thumbnail: proxiedUrl });
    }

    const codeMatch = url.match(/\/(p|reel|reels|tv)\/([^/?#'"\s]+)/);
    if (codeMatch) {
      return res.status(200).json({ thumbnail: `https://ddinstagram.com/o/p/${codeMatch[2]}.jpg` });
    }

    return res.status(404).json({ error: 'Thumbnail not found' });
  } catch (error) {
    const codeMatch = url.match(/\/(p|reel|reels|tv)\/([^/?#'"\s]+)/);
    if (codeMatch) {
      return res.status(200).json({ thumbnail: `https://ddinstagram.com/o/p/${codeMatch[2]}.jpg` });
    }
    return res.status(500).json({ error: 'Failed to fetch thumbnail' });
  }
}
