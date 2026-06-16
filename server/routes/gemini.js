import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const DEFAULT_RESULT = {
  scores: null,
  narrative: null,
  recommendedTracks: null,
};

export async function enrichArtist(artistData) {
  const prompt = `You are a music expert AI. Analyze the following artist data and return ONLY a raw JSON object with no markdown, no backticks, no explanation.
The JSON must have exactly this structure with exactly these fields:

{
  "scores": {
    "undergroundScore": <0-1, where 1 = extremely underground/obscure, 0 = mainstream pop>,
    "energy": <0-1, overall energy level of their music>,
    "danceability": <0-1, how suited for dancing>,
    "valence": <0-1, where 0 = dark/melancholic, 1 = happy/euphoric>,
    "experimentalScore": <0-1, how experimental or avant-garde>,
    "vocalScore": <0-1, where 0 = purely instrumental, 1 = heavily vocal>,
    "acousticScore": <0-1, where 0 = fully electronic, 1 = fully acoustic>,
    "tempoScore": <0-1, where 0 = very slow, 0.5 = medium, 1 = very fast>,
    "mainstreamAppeal": <0-1, crossover potential to general audiences>,
    "longevityScore": <0-1, career length and lasting influence>
  },
  "narrative": {
    "profile": "<2-3 sentences describing their sound and artistic identity>",
    "scene": "<the music scene or movement they belong to>",
    "influences": ["<artist1>", "<artist2>", "<artist3>"],
    "bestFor": ["<context1>", "<context2>", "<context3>"]
  },
  "recommendedTracks": ["<track1>", "<track2>", "<track3>", "<track4>", "<track5>"]
}

All score fields must be decimal numbers between 0 and 1.
All array fields must have at least 3 items.
Return nothing except the JSON object.

Artist data:
${JSON.stringify(artistData, null, 2)}`;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text();
    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const parsed = JSON.parse(cleaned);
    return {
      scores: parsed.scores ?? null,
      narrative: parsed.narrative ?? null,
      recommendedTracks: parsed.recommendedTracks ?? null,
    };
  } catch (err) {
    return { ...DEFAULT_RESULT, error: err.message };
  }
}
