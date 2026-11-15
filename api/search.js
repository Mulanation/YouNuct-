
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const query = String(req.query.q || "").trim();

  if (!apiKey) {
    return res.status(503).json({
      error: "YouTube API key has not been configured yet."
    });
  }

  if (!query || query.length > 100) {
    return res.status(400).json({
      error: "Please enter a valid search term."
    });
  }

  try {
    const params = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "12",
      safeSearch: "moderate",
      q: query,
      key: apiKey
    });

    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/search?" +
      params.toString()
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "YouTube search is temporarily unavailable."
      });
    }

    const items = (data.items || []).map(video => ({
      id: video.id.videoId,
      title: video.snippet.title,
      channel: video.snippet.channelTitle,
      thumbnail:
        video.snippet.thumbnails.high?.url ||
        video.snippet.thumbnails.medium?.url ||
        video.snippet.thumbnails.default?.url
    }));

    return res.status(200).json({ items });

  } catch (error) {
    return res.status(500).json({
      error: "Unable to connect to YouTube."
    });
  }
}
