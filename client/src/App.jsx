import { useState } from 'react';
import Search from './pages/Search';
import Profile from './pages/Profile';

const NAV_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  background: 'var(--bg)',
  borderBottom: '1px solid var(--border)',
  padding: '16px 24px',
  display: 'flex',
  gap: '32px',
  zIndex: 100,
};

const LINK_BASE = {
  background: 'none',
  border: 'none',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  padding: 0,
  transition: 'color 0.15s',
};

function NavLink({ label, active, onClick }) {
  return (
    <button
      style={{ ...LINK_BASE, color: active ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: active ? 500 : 400 }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function App() {
  const [page, setPage] = useState('search');

  return (
    <>
      <nav style={NAV_STYLE}>
        <NavLink label="Search" active={page === 'search'} onClick={() => setPage('search')} />
        <NavLink label="Profile" active={page === 'profile'} onClick={() => setPage('profile')} />
      </nav>
      <div style={{ paddingTop: '60px' }}>
        {page === 'search' ? <Search /> : <Profile />}
      </div>
    </>
  );
}
