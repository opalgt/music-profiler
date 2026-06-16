import { useState, useRef } from 'react';

export default function Search() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  function fetchSuggestions(value) {
    clearTimeout(debounceTimer.current);

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/artists/autocomplete?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }

  function handleInputChange(e) {
    const value = e.target.value;
    setInput(value);
    fetchSuggestions(value);
  }

  async function handleSearch(name = input, spotifyId = null) {
    if (!name.trim()) return;
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const url = spotifyId
        ? `http://localhost:3001/api/artists/search?name=${encodeURIComponent(name)}&spotifyId=${encodeURIComponent(spotifyId)}`
        : `http://localhost:3001/api/artists/search?name=${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSuggestionClick(artist) {
    console.log('[handleSuggestionClick] artist received:', artist);
    setInput(artist.name);
    setShowSuggestions(false);
    setSuggestions([]);
    handleSearch(artist.name, artist.id);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  return (
    <div>
      <div
        ref={containerRef}
        tabIndex={-1}
        onBlur={() => { setTimeout(() => setShowSuggestions(false), 150); }}
        style={{ position: 'relative', display: 'inline-block' }}
      >
        <div>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search for an artist..."
          />
          <button onClick={() => handleSearch()} disabled={loading}>
            Search
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <ul style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            margin: 0,
            padding: 0,
            listStyle: 'none',
            background: 'white',
            border: '1px solid #ccc',
            width: '100%',
            zIndex: 10,
          }}>
            {console.log('[suggestions render] full array:', suggestions)}
            {suggestions.map((artist, index) => {
              console.log(`[suggestions render] index ${index}:`, artist);
              return (
              <li
                key={artist.id}
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSuggestionClick(artist); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer' }}
              >
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    width={32}
                    height={32}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee' }} />
                )}
                <span>{artist.name}</span>
              </li>
              );
            })}
          </ul>
        )}
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
