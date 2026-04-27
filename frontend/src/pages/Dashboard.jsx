import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import Leaderboard from '../components/Leaderboard'
import Balance from '../components/Balance'
import PRTracker from '../components/PRTracker'
import Navbar from '../components/Navbar'

export default function Dashboard() {
  const { id } = useParams()
  const [workspace, setWorkspace] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [balance, setBalance] = useState([])
  const [prTimings, setPrTimings] = useState([])
  const [tab, setTab] = useState('leaderboard')

  useEffect(() => {
    const load = async () => {
      const [ws, lb, bal, pr] = await Promise.all([
        axios.get(`/api/workspace/${id}`),
        axios.get(`/api/workspace/${id}/leaderboard`),
        axios.get(`/api/workspace/${id}/balance`),
        axios.get(`/api/workspace/${id}/pr-timings`)
      ])
      setWorkspace(ws.data)
      setLeaderboard(lb.data.leaderboard || [])
      setBalance(bal.data.balance || [])
      setPrTimings(pr.data.pr_timings || [])
    }
    load()
  }, [id])

  if (!workspace) return (
    <div style={styles.loading}>Loading workspace...</div>
  )

  return (
    <div style={styles.container}>
      <Navbar name={workspace.name} workspaceId={id} />

      <div style={styles.tabs}>
        {['leaderboard', 'balance', 'pr-tracker'].map(t => (
          <button
            key={t}
            style={tab === t ? styles.activeTab : styles.tab}
            onClick={() => setTab(t)}
          >
            {t === 'leaderboard' ? '🏆 Leaderboard'
              : t === 'balance' ? '📊 Balance'
              : '⏱ PR Tracker'}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === 'leaderboard' && <Leaderboard data={leaderboard} />}
        {tab === 'balance' && <Balance data={balance} />}
        {tab === 'pr-tracker' && <PRTracker data={prTimings} />}
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', padding: '0 0 3rem' },
  loading: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', height: '100vh',
    color: '#8b949e'
  },
  tabs: {
    display: 'flex', gap: '0.5rem',
    padding: '1.5rem 2rem 0'
  },
  tab: {
    background: 'transparent',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    color: '#8b949e',
    fontSize: '0.9rem'
  },
  activeTab: {
    background: '#161b22',
    border: '1px solid #58a6ff',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    color: '#58a6ff',
    fontSize: '0.9rem'
  },
  content: { padding: '1.5rem 2rem' }
}