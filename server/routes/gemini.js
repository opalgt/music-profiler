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
  const prompt = `You are a music expert. Given the following data about an artist, return a JSON object with three fields:
1. "scores": an object with numeric scores (0-100) for: danceability, energy, mainstream, longevity
2. "narrative": a 2-3 sentence summary of the artist's significance and sound
3. "recommendedTracks": an array of 3-5 track name strings to listen to first

Artist data:
${JSON.stringify(artistData, null, 2)}

Respond ONLY with valid JSON, no markdown, no extra text.`;

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
