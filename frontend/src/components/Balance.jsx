import {
  BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export default function Balance({ data }) {
  if (!data.length) return (
    <p style={styles.empty}>No data yet.</p>
  )

  const max = Math.max(...data.map(d => d.score))

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Contribution Balance</h2>
      <p style={styles.sub}>
        Are contributions evenly spread across the team?
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <XAxis dataKey="username" stroke="#8b949e" tick={{ fill: '#8b949e' }} />
          <YAxis stroke="#8b949e" tick={{ fill: '#8b949e' }} />
          <Tooltip
            contentStyle={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.username}
                fill={entry.score === max ? '#238636' : '#1f6feb'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={styles.cards}>
        {data.map(dev => (
          <div key={dev.username} style={styles.card}>
            <span style={styles.cardName}>{dev.username}</span>
            <span style={styles.cardScore}>{dev.score} pts</span>
            <span style={styles.cardEvents}>{dev.total_events} events</span>
            {dev.last_active
              ? <span style={styles.active}>
                  Last active: {new Date(dev.last_active).toLocaleDateString()}
                </span>
              : <span style={styles.inactive}>No activity</span>
            }
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {},
  heading: {
    fontSize: '1.1rem', fontWeight: '600',
    marginBottom: '0.25rem', color: '#e6edf3'
  },
  sub: { color: '#8b949e', fontSize: '0.85rem', marginBottom: '1.5rem' },
  cards: {
    display: 'flex', flexWrap: 'wrap',
    gap: '0.75rem', marginTop: '1.5rem'
  },
  card: {
    background: '#161b22', border: '1px solid #30363d',
    borderRadius: '10px', padding: '1rem',
    display: 'flex', flexDirection: 'column', gap: '0.25rem',
    minWidth: '140px'
  },
  cardName: { fontWeight: '600', fontSize: '0.95rem' },
  cardScore: { color: '#58a6ff', fontSize: '1.1rem', fontWeight: '700' },
  cardEvents: { color: '#8b949e', fontSize: '0.8rem' },
  active: { color: '#3fb950', fontSize: '0.75rem' },
  inactive: { color: '#f85149', fontSize: '0.75rem' },
  empty: { color: '#8b949e', marginTop: '1rem' }
}