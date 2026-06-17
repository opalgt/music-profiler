import { useState, useRef, useEffect } from 'react';

const MAX_SLOTS = 5;
const MIN_SLOTS = 3;

const VECTOR_KEYS = [
  ['undergroundScore', 'underground'],
  ['energy', 'energy'],
  ['danceability', 'danceability'],
  ['valence', 'valence'],
  ['experimentalScore', 'experimental'],
  ['vocalScore', 'vocal'],
  ['acousticScore', 'acoustic'],
  ['tempoScore', 'tempo'],
  ['mainstreamAppeal', 'mainstream appeal'],
  ['longevityScore', 'longevity'],
];

const SOURCE_LABEL = {
  vector_match: 'vector match',
  lastfm: 'last.fm',
  gemini_influence: 'ai influence',
};

const S = {
  page: {
    width: '100%',
    minHeight: '100vh',
    padding: '48px 24px',
    boxSizing: 'border-box',
  },
  inner: {
    maxWidth: '720px',
    margin: '0 auto',
    width: '100%',
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
  slotList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  slotWrap: {
    position: 'relative',
  },
  slotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  slotThumb: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    background: 'var(--border)',
  },
  slotThumbEmpty: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    flexShrink: 0,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
  },
  slotInput: {
    flex: 1,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '14px 16px',
    fontSize: '15px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
    flexShrink: 0,
    transition: 'color 0.15s',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    background: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    zIndex: 20,
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
  addBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--accent)',
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    padding: '8px 0',
    marginBottom: '28px',
    display: 'block',
    transition: 'opacity 0.15s',
  },
  submitBtn: {
    width: '100%',
    background: 'var(--accent)',
    color: 'var(--bg)',
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '1rem',
    padding: '16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  error: {
    color: '#FF4D4D',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    padding: '16px 0',
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
  identityHeading: {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    fontWeight: 700,
    color: 'var(--text-primary)',
    lineHeight: 1.1,
    marginBottom: '16px',
  },
  summary: {
    fontFamily: 'var(--font-body)',
    fontSize: '1rem',
    lineHeight: 1.8,
    color: 'var(--text-secondary)',
    marginBottom: '16px',
  },
  metaRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
  },
  metaItem: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  metaValue: {
    color: 'var(--text-secondary)',
    marginLeft: '6px',
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
  sourcePill: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border)',
    borderRadius: '2px',
    padding: '2px 8px',
    fontSize: '10px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
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
  artistRow: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  artistAvatar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  artistAvatarImg: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: 'var(--border)',
  },
  artistAvatarName: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--text-muted)',
    textAlign: 'center',
    maxWidth: '60px',
    wordBreak: 'break-word',
  },
  recItem: {
    paddingBottom: '28px',
    marginBottom: '28px',
    borderBottom: '1px solid var(--border)',
  },
  recHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  recName: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.2rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  recReason: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    color: 'var(--text-secondary)',
    marginBottom: '10px',
  },
  recStartWith: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
  },
  recTrack: {
    color: 'var(--accent)',
    marginLeft: '6px',
  },
  resetBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'color 0.15s, border-color 0.15s',
  },
};

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

function ArtistSlot({ slot, index, canRemove, onInputChange, onSelect, onRemove, onBlur }) {
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  return (
    <div
      ref={containerRef}
      style={S.slotWrap}
      tabIndex={-1}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) {
          setTimeout(() => onBlur(index), 150);
        }
      }}
    >
      <div style={S.slotRow}>
        {slot.selected?.image ? (
          <img src={slot.selected.image} alt={slot.selected.name} style={S.slotThumb} />
        ) : (
          <div style={S.slotThumbEmpty} />
        )}
        <input
          type="text"
          value={slot.input}
          onChange={(e) => onInputChange(index, e.target.value)}
          onFocus={() => {
            setFocused(true);
            if (slot.suggestions.length > 0 && slot.input.length >= 2) {
              onInputChange(index, slot.input);
            }
          }}
          onBlur={() => setFocused(false)}
          placeholder={`Artist ${index + 1}...`}
          style={{
            ...S.slotInput,
            borderColor: focused ? 'var(--accent)' : 'var(--border)',
          }}
        />
        {canRemove && (
          <button
            style={S.removeBtn}
            onClick={() => onRemove(index)}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FF4D4D'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            ×
          </button>
        )}
      </div>

      {slot.showSuggestions && slot.suggestions.length > 0 && (
        <div style={S.dropdown}>
          {slot.suggestions.map((artist) => (
            <div
              key={artist.id}
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(index, artist); }}
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
  );
}

function Results({ results, onReset }) {
  const { tasteProfile, tasteVector, recommendations, inputArtists } = results;

  return (
    <>
      <div style={S.eyebrow}>Music Profiler</div>

        {/* TASTE IDENTITY */}
        <div style={{ paddingBottom: '28px' }}>
          <h1 style={S.identityHeading}>{tasteProfile?.sceneAffinity ?? 'Your Taste'}</h1>
          {tasteProfile?.summary && (
            <p style={S.summary}>{tasteProfile.summary}</p>
          )}
          <div style={S.metaRow}>
            {tasteProfile?.eraAffinity && (
              <span style={S.metaItem}>
                era<span style={S.metaValue}>{tasteProfile.eraAffinity}</span>
              </span>
            )}
            {tasteProfile?.listenContext?.length > 0 && (
              <span style={S.metaItem}>
                best for<span style={S.metaValue}>{tasteProfile.listenContext.join(' · ')}</span>
              </span>
            )}
          </div>
        </div>

        {/* YOUR SOUND */}
        {tasteProfile?.moodDescriptors?.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>Your Sound</div>
            <div style={S.pillRow}>
              {tasteProfile.moodDescriptors.map((m) => (
                <span key={m} style={S.accentPill}>{m}</span>
              ))}
            </div>
          </div>
        )}

        {/* GENRES */}
        {tasteProfile?.genres?.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>Genres</div>
            <div style={S.pillRow}>
              {tasteProfile.genres.map((g) => (
                <span key={g} style={S.mutedPill}>{g}</span>
              ))}
            </div>
          </div>
        )}

        {/* TASTE VECTOR */}
        {tasteVector && (
          <div style={S.section}>
            <div style={S.sectionLabel}>Taste Vector</div>
            {VECTOR_KEYS.map(([key, label], i) => (
              <div key={key} style={S.scoreRow}>
                <span style={S.scoreLabel}>{label}</span>
                <ScoreBar value={tasteVector[key]} delay={i * 80} />
                <span style={S.scoreValue}>
                  {tasteVector[key] != null ? tasteVector[key].toFixed(2) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* BASED ON */}
        {inputArtists?.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>Based On</div>
            <div style={S.artistRow}>
              {inputArtists.map((artist, i) => {
                const img = artist?.spotify?.image;
                const name = artist?.spotify?.name ?? `Artist ${i + 1}`;
                return (
                  <div key={i} style={S.artistAvatar}>
                    {img ? (
                      <img src={img} alt={name} style={S.artistAvatarImg} />
                    ) : (
                      <div style={S.artistAvatarImg} />
                    )}
                    <span style={S.artistAvatarName}>{name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {recommendations?.length > 0 && (
          <div style={S.section}>
            <div style={S.sectionLabel}>Recommended For You</div>
            {recommendations.map((rec, i) => (
              <div key={i} style={i === recommendations.length - 1 ? { ...S.recItem, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 } : S.recItem}>
                <div style={S.recHeader}>
                  <span style={S.recName}>{rec.name}</span>
                  {rec.source && (
                    <span style={S.sourcePill}>{SOURCE_LABEL[rec.source] ?? rec.source}</span>
                  )}
                </div>
                {rec.reason && <p style={S.recReason}>{rec.reason}</p>}
                {rec.startWith && (
                  <div style={S.recStartWith}>
                    start with<span style={S.recTrack}>{rec.startWith}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          style={S.resetBtn}
          onClick={onReset}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          Start Over
        </button>
    </>
  );
}

function makeSlot(id) {
  return { id, input: '', selected: null, suggestions: [], showSuggestions: false };
}

export default function Profile() {
  const [slots, setSlots] = useState([makeSlot(0), makeSlot(1), makeSlot(2)]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timers = useRef({});

  function updateSlot(index, updates) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }

  function handleInputChange(index, value) {
    updateSlot(index, { input: value, selected: null });

    clearTimeout(timers.current[index]);
    if (value.length < 2) {
      updateSlot(index, { suggestions: [], showSuggestions: false });
      return;
    }

    timers.current[index] = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/api/artists/autocomplete?q=${encodeURIComponent(value)}`
        );
        const data = await res.json();
        setSlots((prev) =>
          prev.map((s, i) =>
            i === index
              ? { ...s, suggestions: Array.isArray(data) ? data : [], showSuggestions: true }
              : s
          )
        );
      } catch {
        // ignore fetch errors
      }
    }, 300);
  }

  function handleSelect(index, artist) {
    updateSlot(index, {
      input: artist.name,
      selected: { name: artist.name, image: artist.image, spotifyId: artist.id },
      suggestions: [],
      showSuggestions: false,
    });
  }

  function handleBlur(index) {
    updateSlot(index, { showSuggestions: false });
  }

  function addSlot() {
    if (slots.length >= MAX_SLOTS) return;
    setSlots((prev) => [...prev, makeSlot(Date.now())]);
  }

  function removeSlot(index) {
    if (slots.length <= MIN_SLOTS) return;
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    const names = slots
      .map((s) => s.selected?.name || s.input.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch('http://localhost:3001/api/profile/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artists: names }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filledCount = slots.filter((s) => s.selected?.name || s.input.trim()).length;

  return (
    <div style={S.page}>
      <div style={S.inner}>
        {results ? (
          <Results results={results} onReset={() => setResults(null)} />
        ) : (
          <>
            <div style={S.eyebrow}>Music Profiler</div>
            <h1 style={S.heading}>What's your sound?</h1>
            <p style={S.subtitle}>Add 3 to 5 artists you love. We'll map your taste.</p>

            <div style={S.slotList}>
              {slots.map((slot, index) => (
                <ArtistSlot
                  key={slot.id}
                  slot={slot}
                  index={index}
                  canRemove={slots.length > MIN_SLOTS}
                  onInputChange={handleInputChange}
                  onSelect={handleSelect}
                  onRemove={removeSlot}
                  onBlur={handleBlur}
                />
              ))}
            </div>

            {slots.length < MAX_SLOTS && (
              <button style={S.addBtn} onClick={addSlot}>
                + Add another artist
              </button>
            )}

            {error && <div style={S.error}>Error: {error}</div>}

            <button
              style={{ ...S.submitBtn, opacity: loading || filledCount === 0 ? 0.5 : 1, cursor: loading || filledCount === 0 ? 'not-allowed' : 'pointer' }}
              onClick={handleSubmit}
              disabled={loading || filledCount === 0}
            >
              {loading ? 'Analysing...' : 'Map my taste'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
