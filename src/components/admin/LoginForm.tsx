'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle: React.CSSProperties = {
  background: 'transparent',
  borderBottom: '1px solid rgba(93,63,60,0.5)',
  color: '#e5e2e1',
  outline: 'none',
  width: '100%',
  padding: '8px 0',
  fontSize: '0.875rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#67d7e1',
  marginBottom: '4px',
  fontFamily: "'Space Grotesk', sans-serif",
}

export default function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Incorrect password.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="password" style={labelStyle}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          style={inputStyle}
          onFocus={(e) => {
            e.target.style.borderBottomColor = '#FF3B3B'
            e.target.style.boxShadow = '0 4px 0 rgba(255,59,59,0.12)'
          }}
          onBlur={(e) => {
            e.target.style.borderBottomColor = 'rgba(93,63,60,0.5)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {error && (
        <div
          className="px-3 py-2 text-sm"
          style={{ background: 'rgba(255,59,59,0.08)', borderLeft: '2px solid #FF3B3B', color: '#ffb3ac' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 text-sm font-medium uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: '#FF3B3B',
          color: '#410003',
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 0 8px rgba(255,59,59,0.3)',
          letterSpacing: '0.12em',
        }}
      >
        {loading ? 'Authenticating…' : 'Authenticate >>'}
      </button>
    </form>
  )
}
