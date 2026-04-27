import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Landing() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [members, setMembers] = useState('')
  const [repos, setRepos] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async () => {
    if (!name || !members || !repos) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/workspace', {
        name,
        members: members.split(',').map(m => m.trim()),
        repos: repos.split(',').map(r => r.trim())
      })
      navigate(`/workspace/${res.data.workspace_id}`)
    } catch {
      setError('Something went wrong. Is the server running?')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏆 Git Pulse</h1>
        <p style={styles.subtitle}>
          Track your team's GitHub contributions in real time
        </p>

        <div style={styles.form}>
          <label style={styles.label}>Workspace name</label>
          <input
            style={styles.input}
            placeholder="e.g. Ramya's Team"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <label style={styles.label}>GitHub usernames (comma separated)</label>
          <input
            style={styles.input}
            placeholder="e.g. ramya, anuhya, sahiti"
            value={members}
            onChange={e => setMembers(e.target.value)}
          />

          <label style={styles.label}>Repos to track (comma separated)</label>
          <input
            style={styles.input}
            placeholder="e.g. ramya/project-a, ramya/project-b"
            value={repos}
            onChange={e => setRepos(e.target.value)}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            style={loading ? styles.btnDisabled : styles.btn}
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Workspace →'}
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '480px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '0.5rem'
  },
  subtitle: {
    color: '#8b949e',
    marginBottom: '2rem',
    fontSize: '0.95rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  label: {
    fontSize: '0.85rem',
    color: '#8b949e',
    marginBottom: '-0.25rem'
  },
  input: {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#e6edf3',
    fontSize: '0.95rem',
    outline: 'none'
  },
  btn: {
    marginTop: '0.5rem',
    background: '#238636',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600'
  },
  btnDisabled: {
    marginTop: '0.5rem',
    background: '#444',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem',
    color: '#888',
    fontSize: '1rem',
    fontWeight: '600'
  },
  error: {
    color: '#f85149',
    fontSize: '0.85rem'
  }
}