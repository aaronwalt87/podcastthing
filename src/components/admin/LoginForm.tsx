'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'rgba(0,255,65,0.7)',
  marginBottom: '6px',
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
          className="w-full px-3 py-2.5 text-sm font-mono transition-all duration-150 outline-none"
          style={{
            background: 'rgba(0,255,65,0.04)',
            border: '1px solid rgba(0,255,65,0.2)',
            color: '#ffffff',
            borderRadius: '4px',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(0,255,65,0.6)'
            e.target.style.boxShadow = '0 0 0 3px rgba(0,255,65,0.08)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(0,255,65,0.2)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {error && (
        <div
          className="px-3 py-2 text-xs font-mono"
          style={{ background: 'rgba(255,59,59,0.08)', border: '1px solid rgba(255,59,59,0.25)', color: '#ff8080', borderRadius: '4px' }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 text-sm font-bold uppercase tracking-widest transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: '#00FF41',
          color: '#131313',
          fontFamily: "'Space Grotesk', sans-serif",
          boxShadow: '0 0 12px rgba(0,255,65,0.35)',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(0,255,65,0.6)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(0,255,65,0.35)' }}
      >
        {loading ? 'AUTHENTICATING…' : 'AUTHENTICATE >>'}
      </button>
    </form>
  )
}
