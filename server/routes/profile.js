import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import supabase from '../db/supabase.js';

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const VECTOR_KEYS = [
  'undergroundScore', 'energy', 'danceability', 'valence',
  'experimentalScore', 'vocalScore', 'acousticScore',
  'tempoScore', 'mainstreamAppeal', 'longevityScore',
];

async function fetchAndCacheArtist(name) {
  const { data: cached } = await supabase
    .from('artists')
    .select('*')
    .ilike('name', name)
    .single();

  if (cached) {
    return { row: cached, data: cached.data };
  }

  const res = await fetch(
    `http://localhost:3001/api/artists/search?name=${encodeURIComponent(name)}`
  );
  if (!res.ok) throw new Error(`Failed to fetch artist "${name}": ${res.status}`);
  const data = await res.json();

  const { data: freshRow } = await supabase
    .from('artists')
    .select('*')
    .ilike('name', name)
    .single();

  return { row: freshRow, data };
}

function averageVectors(vectors) {
  const len = VECTOR_KEYS.length;
  const sum = new Array(len).fill(0);
  for (const vec of vectors) {
    for (let i = 0; i < len; i++) {
      sum[i] += vec[i] ?? 0.5;
    }
  }
  const avg = sum.map((v) => v / vectors.length);
  return Object.fromEntries(VECTOR_KEYS.map((k, i) => [k, avg[i]]));
}

function euclideanDistance(a, b) {
  return Math.sqrt(VECTOR_KEYS.reduce((acc, _, i) => acc + (a[i] - b[i]) ** 2, 0));
}

async function callGemini(prompt) {
  const result = await model.generateContent(prompt);
  const rawText = result.response.text();
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

router.post('/analyze', async (req, res) => {
  const { artists: inputNames } = req.body;
  if (!Array.isArray(inputNames) || inputNames.length === 0) {
    return res.status(400).json({ error: '"artists" must be a non-empty array' });
  }

  // 1. FETCH & CACHE ALL ARTISTS
  let fetchResults;
  try {
    fetchResults = await Promise.all(inputNames.map(fetchAndCacheArtist));
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }

  const inputArtists = fetchResults.map((r) => r.data);

  // 2. BUILD THE TASTE VECTOR
  const vectors = fetchResults
    .map((r) => {
      if (!r.row?.vector) return null;
      return Array.isArray(r.row.vector) ? r.row.vector : JSON.parse(r.row.vector);
    })
    .filter(Boolean);

  if (vectors.length === 0) {
    return res.status(422).json({ error: 'No vector data available for provided artists' });
  }

  const tasteVector = averageVectors(vectors);
  const tasteVectorArray = VECTOR_KEYS.map((k) => tasteVector[k]);

  // 3. FIND SIMILAR ARTISTS FROM DATABASE
  const inputNamesLower = new Set(inputNames.map((n) => n.toLowerCase()));
  const { data: allStored = [] } = await supabase
    .from('artists')
    .select('*')
    .not('name', 'in', `(${inputNames.map((n) => `"${n}"`).join(',')})`);

  const vectorMatches = (allStored ?? [])
    .filter((row) => !inputNamesLower.has(row.name.toLowerCase()))
    .map((row) => {
      const vec = Array.isArray(row.vector) ? row.vector : JSON.parse(row.vector);
      return { name: row.name, distance: euclideanDistance(tasteVectorArray, vec) };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  // 4. COLLECT ALL SIGNAL-BASED CANDIDATES
  const candidates = new Set();
  for (const { data } of fetchResults) {
    for (const name of data?.lastfm?.similarArtists ?? []) {
      if (!inputNamesLower.has(name.toLowerCase())) candidates.add(name);
    }
    for (const name of data?.ai?.narrative?.influences ?? []) {
      if (!inputNamesLower.has(name.toLowerCase())) candidates.add(name);
    }
  }

  // 5. SEND TO GEMINI FOR FINAL ANALYSIS
  const prompt = `You are a music expert AI. A user loves these artists: ${inputNames.join(', ')}

Their combined taste profile scores are:
${JSON.stringify(tasteVector, null, 2)}

Based on this profile, here are candidate recommendations gathered from multiple sources: ${[...candidates].join(', ')}

And here are the top vector-similar artists already in our database: ${vectorMatches.map((m) => m.name).join(', ')}

Please return ONLY a raw JSON object with this structure:
{
  "tasteProfile": {
    "summary": "3-4 sentence description of this person's overall music taste",
    "genres": ["top 3-5 genres that define their taste"],
    "moodDescriptors": ["4-6 words describing the mood/vibe e.g. dark, hypnotic, soulful"],
    "sceneAffinity": "what music scene or world they belong to",
    "eraAffinity": "what era/decade their taste gravitates toward",
    "listenContext": ["3-4 contexts e.g. late night driving, dancefloor, focused work"]
  },
  "recommendations": [
    {
      "name": "artist name",
      "reason": "2-3 sentences explaining exactly why this fits their taste",
      "startWith": "one specific song to start with",
      "source": "one of: vector_match | lastfm | gemini_influence"
    }
  ]
}

Return 6-8 recommendations total, ranked by how well they fit.
Prioritize artists the user has probably not heard of over obvious choices.`;

  let geminiResult;
  try {
    geminiResult = await callGemini(prompt);
  } catch (err) {
    return res.status(502).json({ error: `Gemini analysis failed: ${err.message}` });
  }

  // 6. RETURN FULL RESPONSE
  res.json({
    inputArtists,
    tasteVector,
    tasteProfile: geminiResult.tasteProfile ?? null,
    recommendations: geminiResult.recommendations ?? [],
  });
});

export default router;
