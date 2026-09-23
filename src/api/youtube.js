const API_BASE = "https://www.googleapis.com/youtube/v3";

function key() {
  const value = import.meta.env.VITE_YOUTUBE_API_KEY;
  if (!value) throw new Error("Missing VITE_YOUTUBE_API_KEY. Create a .env file from .env.example.");
  return value;
}

export async function searchYouTube(query, pageToken = "") {
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: "24",
    videoEmbeddable: "true",
    key: key()
  });
  if (pageToken) params.set("pageToken", pageToken);

  const res = await fetch(`${API_BASE}/search?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "YouTube search failed");

  return {
    items: (data.items || []).map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
      publishedAt: item.snippet.publishedAt
    })),
    nextPageToken: data.nextPageToken || ""
  };
}

export async function fetchTrendingYouTube(regionCodes = ["US"]) {
  const regions = Array.isArray(regionCodes) ? regionCodes : [regionCodes];
  const responses = await Promise.all(regions.map(regionCode => fetchTrendingRegion(regionCode)));
  const seen = new Set();
  return responses.flat().filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function fetchTrendingRegion(regionCode) {
  const params = new URLSearchParams({
    part: "snippet",
    chart: "mostPopular",
    regionCode,
    videoCategoryId: "10",
    maxResults: "8",
    key: key()
  });
  const res = await fetch(`${API_BASE}/videos?${params}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Unable to load trending songs");

  return (data.items || []).map(item => ({
    id: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url,
    publishedAt: item.snippet.publishedAt
  }));
}
