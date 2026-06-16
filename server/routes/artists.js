import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

async function fetchSpotify(name) {
  const tokenRes = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }),
    {
      auth: {
        username: process.env.SPOTIFY_CLIENT_ID,
        password: process.env.SPOTIFY_CLIENT_SECRET,
      },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  const token = tokenRes.data.access_token;

  const searchRes = await axios.get('https://api.spotify.com/v1/search', {
    params: { q: name, type: 'artist', limit: 1 },
    headers: { Authorization: `Bearer ${token}` },
  });

  const artist = searchRes.data.artists.items[0];
  if (!artist) return null;

  console.log(artist);

  return {
    name: artist.name,
    genres: artist.genres ?? [],
    popularity: artist.popularity,
    followers: artist.followers?.total ?? 0,
    image: artist.images?.[0]?.url ?? null,
  };
}

async function fetchLastFm(name) {
  const res = await axios.get('http://ws.audioscrobbler.com/2.0/', {
    params: {
      method: 'artist.getinfo',
      artist: name,
      api_key: process.env.LASTFM_API_KEY,
      format: 'json',
    },
  });

  const artist = res.data.artist;
  return {
    tags: artist.tags.tag.map((t) => t.name),
    listeners: parseInt(artist.stats.listeners, 10),
  };
}

async function fetchDiscogs(name) {
  const res = await axios.get('https://api.discogs.com/database/search', {
    params: { q: name, type: 'artist' },
    headers: { Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}` },
  });

  const first = res.data.results[0];
  if (!first) return null;

  return { title: first.title, id: first.id };
}

router.get('/search', async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Query parameter "name" is required' });
  }

  const [spotifyResult, lastFmResult, discogsResult] = await Promise.allSettled([
    fetchSpotify(name),
    fetchLastFm(name),
    fetchDiscogs(name),
  ]);

  res.json({
    spotify: spotifyResult.status === 'fulfilled' ? spotifyResult.value : { error: spotifyResult.reason?.message },
    lastfm: lastFmResult.status === 'fulfilled' ? lastFmResult.value : { error: lastFmResult.reason?.message },
    discogs: discogsResult.status === 'fulfilled' ? discogsResult.value : { error: discogsResult.reason?.message },
  });
});

export default router;
