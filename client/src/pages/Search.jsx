import { useState } from 'react';

export default function Search() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(
        `http://localhost:3001/api/artists/search?name=${encodeURIComponent(input)}`
      );
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for an artist..."
        />
        <button onClick={handleSearch} disabled={loading}>
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}

      {results && (
        <div>
          {results.spotify && !results.spotify.error && (
            <div>
              {results.spotify.image && (
                <img src={results.spotify.image} alt={results.spotify.name} width={200} />
              )}
              <h2>{results.spotify.name}</h2>
            </div>
          )}

          {results.lastfm && !results.lastfm.error && results.lastfm.tags?.length > 0 && (
            <div>
              <h3>Tags</h3>
              <ul>
                {results.lastfm.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          )}

          {results.discogs && !results.discogs.error && (
            <div>
              <p>Discogs ID: {results.discogs.id}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
