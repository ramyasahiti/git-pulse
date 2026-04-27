export default function PRTracker({ data }) {
  if (!data.length) return (
    <p style={styles.empty}>
      No PR data yet. Open and merge a PR to see timing data!
    </p>
  )

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>PR Review Tracker</h2>
      <p style={styles.sub}>How long are PRs taking to get reviewed?</p>
      <div style={styles.list}>
        {data.map((pr, i) => (
          <div key={i} style={styles.row}>
            <div style={styles.left}>
              <span style={styles.repo}>{pr.repo}</span>
              <span style={styles.pr}>PR #{pr.pr_number}</span>
              <span style={styles.meta}>
                Opened by {pr.opened_by || 'unknown'}
              </span>
            </div>
            <div style={styles.right}>
              {pr.review_time_hours != null
                ? <>
                    <span style={styles.time}>
                      {pr.review_time_hours}h
                    </span>
                    <span style={styles.label}>to merge</span>
                  </>
                : <span style={styles.open}>Open</span>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '720px' },
  heading: {
    fontSize: '1.1rem', fontWeight: '600',
    marginBottom: '0.25rem', color: '#e6edf3'
  },
  sub: { color: '#8b949e', fontSize: '0.85rem', marginBottom: '1.5rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  row: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    background: '#161b22', border: '1px solid #30363d',
    borderRadius: '10px', padding: '1rem 1.25rem'
  },
  left: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  repo: { fontSize: '0.8rem', color: '#8b949e' },
  pr: { fontWeight: '600', fontSize: '1rem' },
  meta: { fontSize: '0.8rem', color: '#8b949e' },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  time: { fontSize: '1.5rem', fontWeight: '700', color: '#3fb950' },
  label: { fontSize: '0.75rem', color: '#8b949e' },
  open: {
    background: '#1f6feb33', color: '#58a6ff',
    borderRadius: '6px', padding: '0.25rem 0.75rem',
    fontSize: '0.8rem', fontWeight: '600'
  },
  empty: { color: '#8b949e', marginTop: '1rem' }
}