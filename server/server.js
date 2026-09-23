import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (GEMINI_API_KEY) {
  console.log("✅ Gemini API key loaded");
} else {
  console.log("❌ Gemini API key missing");
}

if (YOUTUBE_API_KEY) {
  console.log("✅ YouTube API key loaded");
} else {
  console.log("❌ YouTube API key missing");
}

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// ========================================
// HOME
// ========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎵 AI Music Generator Backend Running",
  });
});

// ========================================
// GEMINI FUNCTION
// ========================================

async function generateWithGemini(prompt) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Gemini attempt ${attempt}/${maxAttempts}`);

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      return response;
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed:`,
        error?.message || error
      );

      if (
        (error?.status === 503 || error?.status === 429) &&
        attempt < maxAttempts
      ) {
        console.log("⏳ Gemini temporarily unavailable. Retrying...");

        await new Promise((resolve) =>
          setTimeout(resolve, 1500 * attempt)
        );

        continue;
      }

      throw error;
    }
  }

  throw new Error("Gemini request failed after retries");
}

// ========================================
// GENERATE AI SONG VIBE
// ========================================

app.post("/api/generate-song", async (req, res) => {
  try {
    const {
      name,
      age,
      relationship,
      language,
    } = req.body;

    console.log("");
    console.log("================================");
    console.log("🤖 GEMINI REQUEST");
    console.log("================================");
    console.log("Name:", name);
    console.log("Age:", age);
    console.log("Relationship:", relationship);
    console.log("Language:", language);
    console.log("================================");

    if (!name || !age || !relationship || !language) {
      return res.status(400).json({
        success: false,
        message:
          "Name, age, relationship and language are required",
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message:
          "GEMINI_API_KEY is missing. Check server/.env",
      });
    }

    const selectedLanguage =
      language.toLowerCase() === "english"
        ? "English"
        : "Tamil";

    const prompt = `
You are a fun AI music recommendation assistant.

User details:
Name: ${name}
Age: ${age}
Relationship status: ${relationship}
Selected music language: ${selectedLanguage}

Create a playful fictional music vibe for this person.

IMPORTANT RULES:

1. The name and age do NOT reveal the person's real personality.
2. Do not claim that you know their actual personality from their name or age.
3. This is only a creative and fictional music interpretation.
4. Keep the response friendly and suitable for a general audience.
5. The selected music language MUST be respected.
6. If the selected language is Tamil, recommend Tamil music only.
7. If the selected language is English, recommend English music only.
8. The relationship status can influence the fictional music mood.
9. Do not make sensitive personal assumptions.
10. Return ONLY valid JSON.
11. Do not use markdown.
12. Do not use code fences.

Create:

- vibe: short music vibe
- description: 2 short fun sentences
- songSearch: a YouTube search phrase for a ${selectedLanguage} song
- reason: one short sentence explaining the music choice

Return exactly:

{
  "vibe": "short vibe",
  "description": "short description",
  "songSearch": "${selectedLanguage} song search phrase",
  "reason": "short reason"
}
`;

    const response = await generateWithGemini(prompt);

    console.log("");
    console.log("Gemini response:");
    console.log(response.text);
    console.log("");

    if (!response.text) {
      return res.status(500).json({
        success: false,
        message: "Gemini returned an empty response",
      });
    }

    let data;

    try {
      data = JSON.parse(response.text);
    } catch (error) {
      console.error("❌ Gemini JSON parse error");

      return res.status(500).json({
        success: false,
        message: "Gemini returned invalid JSON",
      });
    }

    return res.json({
      success: true,

      name,
      age,
      relationship,
      language: selectedLanguage,

      data: {
        vibe: data.vibe || "Feel Good",
        description:
          data.description ||
          "A fun music vibe created just for you.",

        songSearch:
          data.songSearch ||
          `${selectedLanguage} feel good song`,

        reason:
          data.reason ||
          "This music style matches the generated vibe.",
      },
    });
  } catch (error) {
    console.error("");
    console.error("❌ GEMINI ERROR");
    console.error(error);
    console.error("");

    if (error?.status === 503) {
      return res.status(503).json({
        success: false,
        message:
          "Gemini is temporarily busy. Please try again.",
      });
    }

    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        message:
          "Gemini request limit reached. Please try again later.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Gemini API failed",
    });
  }
});

// ========================================
// YOUTUBE SEARCH
// ========================================

async function searchYouTube(query, language) {
  if (!YOUTUBE_API_KEY) {
    throw new Error(
      "YOUTUBE_API_KEY is missing in server/.env"
    );
  }

  console.log("");
  console.log("================================");
  console.log("🎵 YOUTUBE SEARCH");
  console.log("================================");
  console.log("Language:", language);
  console.log("Query:", query);
  console.log("================================");

  let finalQuery = query;

  if (language === "Tamil") {
    finalQuery = `${query} Tamil song`;
  } else {
    finalQuery = `${query} English song`;
  }

  const url =
    "https://www.googleapis.com/youtube/v3/search" +
    "?part=snippet" +
    `&q=${encodeURIComponent(finalQuery)}` +
    "&type=video" +
    "&maxResults=10" +
    "&order=relevance" +
    "&regionCode=IN" +
    `&relevanceLanguage=${
      language === "Tamil" ? "ta" : "en"
    }` +
    "&videoEmbeddable=true" +
    "&videoSyndicated=true" +
    `&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url);

  const result = await response.json();

  if (!response.ok) {
    console.error("❌ YouTube API error:");
    console.error(result);

    throw new Error(
      result?.error?.message ||
        "YouTube API request failed"
    );
  }

  const videos = (result.items || [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      videoId: item.id.videoId,

      title:
        item.snippet?.title ||
        "Song",

      channel:
        item.snippet?.channelTitle ||
        "YouTube",

      description:
        item.snippet?.description ||
        "",

      thumbnail:
        item.snippet?.thumbnails?.high?.url ||
        item.snippet?.thumbnails?.medium?.url ||
        item.snippet?.thumbnails?.default?.url ||
        "",

      publishedAt:
        item.snippet?.publishedAt ||
        "",
    }));

  return videos;
}

// ========================================
// GET SONGS
// ========================================

app.get("/api/music/search", async (req, res) => {
  try {
    const query = req.query.name?.trim();
    const language =
      req.query.language === "English"
        ? "English"
        : "Tamil";

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Song search query is required",
      });
    }

    let results = await searchYouTube(
      query,
      language
    );

    // Backup searches
    if (results.length < 3) {
      const extraQueries =
        language === "Tamil"
          ? [
              `${query} Tamil melody`,
              `${query} Tamil hit song`,
              `${query} Tamil music`,
            ]
          : [
              `${query} English melody`,
              `${query} English hit song`,
              `${query} English music`,
            ];

      for (const extraQuery of extraQueries) {
        const extra = await searchYouTube(
          extraQuery,
          language
        );

        results.push(...extra);

        if (results.length >= 10) {
          break;
        }
      }
    }

    // Remove duplicate videos
    const unique = [];
    const seen = new Set();

    for (const video of results) {
      if (!seen.has(video.videoId)) {
        seen.add(video.videoId);
        unique.push(video);
      }
    }

    if (unique.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          `No ${language} songs found`,
      });
    }

    console.log(
      `✅ Found ${unique.length} ${language} songs`
    );

    return res.json({
      success: true,
      query,
      language,
      data: unique.slice(0, 10),
    });
  } catch (error) {
    console.error("");
    console.error("❌ YOUTUBE ERROR");
    console.error(error);
    console.error("");

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Song search failed",
    });
  }
});

// ========================================
// OLD ENDPOINT SUPPORT
// ========================================

app.get("/api/music/tamil", async (req, res) => {
  try {
    const query = req.query.name?.trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Song search query is required",
      });
    }

    const results = await searchYouTube(
      query,
      "Tamil"
    );

    return res.json({
      success: true,
      query,
      language: "Tamil",
      data: results.slice(0, 10),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Tamil song search failed",
    });
  }
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log("");
  console.log("================================");
  console.log("🚀 AI MUSIC GENERATOR SERVER");
  console.log("================================");
  console.log(
    `Server: http://localhost:${PORT}`
  );
  console.log(
    GEMINI_API_KEY
      ? "✅ Gemini API key loaded"
      : "❌ Gemini API key missing"
  );
  console.log(
    YOUTUBE_API_KEY
      ? "✅ YouTube API key loaded"
      : "❌ YouTube API key missing"
  );
  console.log("================================");
  console.log("");
});