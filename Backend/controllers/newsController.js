// News controller — fetches from GNews API with 15-min server-side cache

let cache = { data: null, fetchedAt: 0 };
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

async function fetchFromGNews(apiKey) {
  const { default: fetch } = await import("node-fetch");
  const url = `https://gnews.io/api/v4/top-headlines?category=general&lang=en&max=10&apikey=${apiKey}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`GNews ${r.status}`);
  const json = await r.json();
  return (json.articles || []).map(a => ({
    title:       a.title,
    description: a.description,
    url:         a.url,
    image:       a.image,
    source:      a.source?.name || "GNews",
    publishedAt: a.publishedAt,
    category:    "General",
  }));
}

async function fetchFromNewsAPI(apiKey) {
  const { default: fetch } = await import("node-fetch");
  const url = `https://newsapi.org/v2/top-headlines?language=en&pageSize=10&apiKey=${apiKey}`;
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`NewsAPI ${r.status}`);
  const json = await r.json();
  return (json.articles || [])
    .filter(a => a.title && a.title !== "[Removed]")
    .map(a => ({
      title:       a.title,
      description: a.description,
      url:         a.url,
      image:       a.urlToImage,
      source:      a.source?.name || "NewsAPI",
      publishedAt: a.publishedAt,
      category:    "General",
    }));
}

exports.getNews = async (req, res) => {
  try {
    const now = Date.now();

    // Return cached data if still fresh
    if (cache.data && now - cache.fetchedAt < CACHE_TTL) {
      return res.json({ articles: cache.data, cached: true, nextRefresh: cache.fetchedAt + CACHE_TTL });
    }

    let articles = null;

    // Try GNews
    if (process.env.GNEWS_API_KEY) {
      try { articles = await fetchFromGNews(process.env.GNEWS_API_KEY); } catch (e) {
        console.error("[News] GNews failed:", e.message);
      }
    }

    // Try NewsAPI as fallback
    if ((!articles || !articles.length) && process.env.NEWSAPI_KEY) {
      try { articles = await fetchFromNewsAPI(process.env.NEWSAPI_KEY); } catch (e) {
        console.error("[News] NewsAPI failed:", e.message);
      }
    }

    // Final fallback
    if (!articles || !articles.length) {
      return res.json({ articles: getFallbackNews(), cached: false, fallback: true });
    }

    cache = { data: articles, fetchedAt: now };
    console.log(`[News] Fetched ${articles.length} articles`);
    res.json({ articles, cached: false, nextRefresh: now + CACHE_TTL });
  } catch (err) {
    console.error("[News] Error:", err.message);
    res.json({ articles: getFallbackNews(), cached: false, fallback: true });
  }
};

// Curated fallback news when no API key is set
function getFallbackNews() {
  return [
    {
      title: "Tech Giants Report Record Quarterly Earnings",
      description: "Major technology companies exceeded analyst expectations with strong revenue growth driven by AI and cloud services.",
      url: "#",
      source: "Tech News",
      publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      category: "Technology",
    },
    {
      title: "Global Climate Summit Reaches New Agreement",
      description: "World leaders agreed on ambitious new targets to reduce carbon emissions by 2030 at the international climate conference.",
      url: "#",
      source: "World News",
      publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
      category: "World",
    },
    {
      title: "Sports: Championship Finals Set for This Weekend",
      description: "The two top-ranked teams will face off in what promises to be an exciting championship match this Saturday.",
      url: "#",
      source: "Sports Daily",
      publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
      category: "Sports",
    },
    {
      title: "New AI Model Breaks Performance Records",
      description: "Researchers unveiled a new artificial intelligence model that outperforms previous benchmarks across multiple tasks.",
      url: "#",
      source: "AI Weekly",
      publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      category: "Technology",
    },
    {
      title: "Markets Rally on Positive Economic Data",
      description: "Stock markets surged after better-than-expected employment figures and consumer confidence data were released.",
      url: "#",
      source: "Finance Today",
      publishedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
      category: "Finance",
    },
  ];
}
