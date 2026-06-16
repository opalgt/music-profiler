import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { enrichArtist } from './gemini.js';
import db from '../db/database.js';

dotenv.config();

const router = express.Router();

async function getSpotifyToken() {
  const res = await axios.post(
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
  return res.data.access_token;
}

function spotifyArtistShape(artist) {
  return {
    name: artist.name,
    genres: artist.genres ?? [],
    popularity: artist.popularity,
    followers: artist.followers?.total ?? 0,
    image: artist.images?.[0]?.url ?? null,
  };
}

async function fetchSpotify(name) {
  const token = await getSpotifyToken();

  const searchRes = await axios.get('https://api.spotify.com/v1/search', {
    params: { q: name, type: 'artist', limit: 1 },
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log('[spotify] first result:', JSON.stringify(searchRes.data.artists.items[0]?.name));

  const artist = searchRes.data.artists.items[0];
  if (!artist) return null;

  console.log(artist);

  return spotifyArtistShape(artist);
}

async function fetchSpotifyById(spotifyId) {
  const token = await getSpotifyToken();

  const res = await axios.get(`https://api.spotify.com/v1/artists/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log(res.data);

  return spotifyArtistShape(res.data);
}

async function fetchLastFm(name) {
  const params = { artist: name, api_key: process.env.LASTFM_API_KEY, format: 'json' };

  const [infoRes, tracksRes] = await Promise.all([
    axios.get('http://ws.audioscrobbler.com/2.0/', { params: { ...params, method: 'artist.getinfo' } }),
    axios.get('http://ws.audioscrobbler.com/2.0/', { params: { ...params, method: 'artist.gettoptracks', limit: 10 } }),
  ]);

  const artist = infoRes.data.artist;

  return {
    tags: artist.tags.tag.map((t) => ({ name: t.name, weight: t.weight ? parseInt(t.weight, 10) : 0 })),
    listeners: parseInt(artist.stats.listeners, 10),
    playcount: parseInt(artist.stats.playcount, 10),
    bio: artist.bio.summary.replace(/<a[^>]*>.*?<\/a>/g, '').trim(),
    similarArtists: artist.similar.artist.map((a) => a.name),
    topTracks: tracksRes.data.toptracks.track.map((t) => ({
      name: t.name,
      playcount: parseInt(t.playcount, 10),
    })),
  };
}

async function fetchDiscogs(name) {
  const authHeader = { Authorization: `Discogs token=${process.env.DISCOGS_TOKEN}` };

  const searchRes = await axios.get('https://api.discogs.com/database/search', {
    params: { q: name, type: 'artist' },
    headers: authHeader,
  });

  const first = searchRes.data.results[0];
  if (!first) return null;

  const id = first.id;

  const [artistRes, releasesRes] = await Promise.all([
    axios.get(`https://api.discogs.com/artists/${id}`, { headers: authHeader }),
    axios.get(`https://api.discogs.com/artists/${id}/releases`, {
      params: { sort: 'year', per_page: 50 },
      headers: authHeader,
    }),
  ]);

  const artist = artistRes.data;
  const releases = releasesRes.data.releases ?? [];

  const labels = [...new Set(releases.map((r) => r.label).filter(Boolean))];
  const styles = [...new Set(
    releases
      .flatMap((r) => [
        ...(Array.isArray(r.style) ? r.style : r.style ? [r.style] : []),
        ...(Array.isArray(r.genre) ? r.genre : r.genre ? [r.genre] : []),
      ])
      .filter(Boolean)
  )];
  const releaseYears = [...new Set(releases.map((r) => r.year).filter((y) => y && y !== 0))].sort((a, b) => a - b);

  return {
    id,
    name: artist.name,
    profile: artist.profile ?? '',
    nameVariations: artist.namevariations ?? [],
    totalReleases: releasesRes.data.pagination?.items ?? 0,
    labels,
    styles,
    releaseYears,
    firstReleaseYear: releaseYears[0] ?? null,
  };
}

router.get('/autocomplete', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  try {
    const token = await getSpotifyToken();

    const searchRes = await axios.get('https://api.spotify.com/v1/search', {
      params: { q, type: 'artist', limit: 5 },
      headers: { Authorization: `Bearer ${token}` },
    });

    const artists = searchRes.data.artists.items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url ?? null,
    }));

    res.json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildVector(scores) {
  const s = scores ?? {};
  return [
    s.undergroundScore ?? 0.5,
    s.energy ?? 0.5,
    s.danceability ?? 0.5,
    s.valence ?? 0.5,
    s.experimentalScore ?? 0.5,
    s.vocalScore ?? 0.5,
    s.acousticScore ?? 0.5,
    s.tempoScore ?? 0.5,
    s.mainstreamAppeal ?? 0.5,
    s.longevityScore ?? 0.5,
  ];
}

router.get('/search', async (req, res) => {
  const { name, spotifyId } = req.query;
  if (!name) {
    return res.status(400).json({ error: 'Query parameter "name" is required' });
  }

  console.log('[search] received name:', name);

  try {
    const cached = spotifyId
      ? db.prepare('SELECT * FROM artists WHERE spotify_id = ?').get(spotifyId)
      : db.prepare('SELECT * FROM artists WHERE LOWER(name) = LOWER(?)').get(name);

    if (cached) {
      return res.json({ ...JSON.parse(cached.data), source: 'cache' });
    }
  } catch (err) {
    console.error('[db] cache read error:', err.message);
  }

  const [spotifyResult, lastFmResult, discogsResult] = await Promise.allSettled([
    spotifyId ? fetchSpotifyById(spotifyId) : fetchSpotify(name),
    fetchLastFm(name),
    fetchDiscogs(name),
  ]);

  const spotify = spotifyResult.status === 'fulfilled' ? spotifyResult.value : { error: spotifyResult.reason?.message };
  const lastfm = lastFmResult.status === 'fulfilled' ? lastFmResult.value : { error: lastFmResult.reason?.message };
  const discogs = discogsResult.status === 'fulfilled' ? discogsResult.value : { error: discogsResult.reason?.message };

  const ai = await enrichArtist({ spotify, lastfm, discogs });

  const responseData = { spotify, lastfm, discogs, ai };

  try {
    const vector = buildVector(ai.scores);
    const dbSpotifyId = spotifyId || spotify?.id || null;
    const dbName = spotify?.name || name;
    db.prepare(
      'INSERT OR REPLACE INTO artists (spotify_id, name, data, vector) VALUES (?, ?, ?, ?)'
    ).run(dbSpotifyId, dbName, JSON.stringify(responseData), JSON.stringify(vector));
  } catch (err) {
    console.error('[db] cache write error:', err.message);
  }

  res.json({ ...responseData, source: 'api' });
});

export default router;
