import { useState, useRef, useEffect } from 'react';

const S = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg)',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: '720px',
  },
  eyebrow: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.3em',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    lineHeight: 1.1,
    marginBottom: '12px',
  },
  subtitle: {
    fontFamily: 'var(--font-body)',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    marginBottom: '40px',
  },
  searchWrap: {
    position: 'relative',
    width: '100%',
    marginBottom: '48px',
  },
  input: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '16px 20px',
    fontSize: '16px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    zIndex: 10,
    overflow: 'hidden',
  },
  suggestion: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'background 0.1s ease',
  },
  suggestionImg: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: 'var(--border)',
    flexShrink: 0,
  },
  suggestionName: {
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontFamily: 'var(--font-body)',
  },
  loading: {
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    letterSpacing: '0.1em',
    padding: '32px 0',
  },
  error: {
    color: '#FF4D4D',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '16px 0',
  },
  card: {
    width: '100%',
  },
  hero: {
    position: 'relative',
    width: '100%',
    height: '320px',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0',
  },
  heroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  heroGradient: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, #0A0A0A 0%, transparent 60%)',
  },
  heroText: {
    position: 'absolute',
    bottom: '24px',
    left: '24px',
    right: '24px',
  },
  heroName: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.1,
    marginBottom: '8px',
  },
  heroScene: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--accent)',
    letterSpacing: '0.1em',
    textTransform: 'lowercase',
  },
  section: {
    padding: '28px 0',
    borderTop: '1px solid var(--border)',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    letterSpacing: '0.2em',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  narrative: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    lineHeight: 1.8,
    color: 'var(--text-secondary)',
  },
  pillRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  accentPill: {
    background: 'var(--accent-dim)',
    color: 'var(--accent)',
    border: '1px solid rgba(0, 255, 135, 0.2)',
    borderRadius: '2px',
    padding: '4px 10px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  mutedPill: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '2px',
    padding: '4px 10px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  clickablePill: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '2px',
    padding: '4px 10px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    transition: 'color 0.15s, border-color 0.15s',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '14px',
  },
  scoreLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-secondary)',
    width: '140px',
    flexShrink: 0,
  },
  scoreTrack: {
    flex: 1,
    height: '2px',
    background: 'var(--border)',
    borderRadius: '1px',
    overflow: 'hidden',
  },
  scoreValue: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--accent)',
    width: '36px',
    textAlign: 'right',
    flexShrink: 0,
  },
  trackList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  trackItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '16px',
  },
  trackNum: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--accent)',
    width: '24px',
    flexShrink: 0,
  },
  trackName: {
    fontFamily: 'var(--font-body)',
    fontSize: '15px',
    color: 'var(--text-primary)',
  },
  similarRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
};

const SCORE_KEYS = [
  ['undergroundScore', 'underground'],
  ['energy', 'energy'],
  ['danceability', 'danceability'],
  ['valence', 'valence'],
  ['experimentalScore', 'experimental'],
];

function ScoreBar({ value, delay }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth((value ?? 0) * 100), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return (
    <div style={S.scoreTrack}>
      <div
        style={{
          height: '100%',
          width: `${width}%`,
          background: 'var(--accent)',
          borderRadius: '1px',
          transition: 'width 0.8s ease',
        }}
      />
    </div>
  );
}

function ArtistCard({ results, onArtistClick }) {
  const { spotify, lastfm, ai } = results;
  const scores = ai?.scores ?? {};
  const narrative = ai?.narrative ?? {};
  const tracks = ai?.recommendedTracks ?? [];
  const tags = lastfm?.tags ?? [];
  const similar = lastfm?.similarArtists ?? [];

  return (
    <div style={S.card}>
      {/* HERO */}
      {spotify?.image && (
        <div style={S.hero}>
          <img src={spotify.image} alt={spotify.name} style={S.heroImg} />
          <div style={S.heroGradient} />
          <div style={S.heroText}>
            <div style={S.heroName}>{spotify.name}</div>
            {narrative.scene && (
              <div style={S.heroScene}>{narrative.scene}</div>
            )}
          </div>
        </div>
      )}

      {/* NARRATIVE */}
      {narrative.profile && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Profile</div>
          <p style={S.narrative}>{narrative.profile}</p>
        </div>
      )}

      {/* MOOD TAGS */}
      {narrative.bestFor?.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Mood</div>
          <div style={S.pillRow}>
            {narrative.bestFor.map((m) => (
              <span key={m} style={S.accentPill}>{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* SONIC DNA */}
      {Object.keys(scores).length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Sonic DNA</div>
          {SCORE_KEYS.map(([key, label], i) => (
            <div key={key} style={S.scoreRow}>
              <span style={S.scoreLabel}>{label}</span>
              <ScoreBar value={scores[key]} delay={i * 120} />
              <span style={S.scoreValue}>
                {scores[key] != null ? scores[key].toFixed(2) : '—'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* LAST.FM TAGS */}
      {tags.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Tags</div>
          <div style={S.pillRow}>
            {tags.slice(0, 8).map((t) => (
              <span key={t.name} style={S.mutedPill}>{t.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDED TRACKS */}
      {tracks.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Start With</div>
          <ul style={S.trackList}>
            {tracks.map((track, i) => (
              <li key={track} style={S.trackItem}>
                <span style={S.trackNum}>{String(i + 1).padStart(2, '0')}</span>
                <span style={S.trackName}>{track}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* SIMILAR ARTISTS */}
      {similar.length > 0 && (
        <div style={S.section}>
          <div style={S.sectionLabel}>Sounds Like</div>
          <div style={S.similarRow}>
            {similar.map((name) => (
              <button
                key={name}
                style={S.clickablePill}
                onClick={() => onArtistClick(name)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.borderColor = 'rgba(0, 255, 135, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Search() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

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
    setInput(artist.name);
    setShowSuggestions(false);
    setSuggestions([]);
    handleSearch(artist.name, artist.id);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleSimilarClick(name) {
    setInput(name);
    handleSearch(name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div style={S.page}>
      <div style={S.inner}>
        <div style={S.eyebrow}>Music Profiler</div>
        <h1 style={S.heading}>Discover your sound.</h1>
        <p style={S.subtitle}>Enter an artist to explore their sonic DNA.</p>

        <div
          ref={containerRef}
          tabIndex={-1}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          style={S.searchWrap}
        >
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setInputFocused(true);
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => setInputFocused(false)}
            placeholder="Search an artist..."
            style={{
              ...S.input,
              borderColor: inputFocused ? 'var(--accent)' : 'var(--border)',
            }}
          />

          {showSuggestions && suggestions.length > 0 && (
            <div style={S.dropdown}>
              {suggestions.map((artist) => (
                <div
                  key={artist.id}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleSuggestionClick(artist); }}
                  style={S.suggestion}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-dim)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {artist.image ? (
                    <img src={artist.image} alt={artist.name} style={S.suggestionImg} />
                  ) : (
                    <div style={S.suggestionImg} />
                  )}
                  <span style={S.suggestionName}>{artist.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && <div style={S.loading}>Analyzing...</div>}
        {error && <div style={S.error}>Error: {error}</div>}
        {results && (
          <ArtistCard results={results} onArtistClick={handleSimilarClick} />
        )}
      </div>
    </div>
  );
}
