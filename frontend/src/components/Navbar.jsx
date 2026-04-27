export default function Navbar({ name, workspaceId }) {
  return (
    <div style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.logo}>🏆 Git Pulse</span>
        <span style={styles.divider}>|</span>
        <span style={styles.wsName}>{name}</span>
      </div>
      <div style={styles.right}>
        <span style={styles.id}>ID: {workspaceId}</span>
      </div>
    </div>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    borderBottom: '1px solid #30363d',
    background: '#161b22'
  },
  left: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  logo: { fontWeight: '700', fontSize: '1.1rem' },
  divider: { color: '#30363d' },
  wsName: { color: '#8b949e', fontSize: '0.95rem' },
  right: {},
  id: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '0.25rem 0.75rem',
    fontSize: '0.8rem',
    color: '#8b949e'
  }
}