export default function Leaderboard({ data }) {
  if (!data.length) return (
    <p style={styles.empty}>No activity yet. Send some events!</p>
  )

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Team Leaderboard</h2>
      <div style={styles.list}>
        {data.map((dev, i) => (
          <div key={dev.username} style={styles.row}>
            <span style={styles.rank}>{medals[i] || `#${i + 1}`}</span>
            <div style={styles.info}>
              <span style={styles.username}>{dev.username}</span>
              <span style={styles.events}>{dev.total_events} events</span>
            </div>
            <div style={styles.scoreBox}>
              <span style={styles.score}>{dev.score}</span>
              <span style={styles.pts}>pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '640px' },
  heading: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#e6edf3'
  },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '10px',
    padding: '1rem 1.25rem'
  },
  rank: { fontSize: '1.25rem', minWidth: '2rem' },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  username: { fontWeight: '600', fontSize: '1rem' },
  events: { fontSize: '0.8rem', color: '#8b949e' },
  scoreBox: { display: 'flex', alignItems: 'baseline', gap: '0.25rem' },
  score: { fontSize: '1.5rem', fontWeight: '700', color: '#58a6ff' },
  pts: { fontSize: '0.8rem', color: '#8b949e' },
  empty: { color: '#8b949e', marginTop: '1rem' }
}