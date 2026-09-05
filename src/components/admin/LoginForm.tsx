'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="password" className="eyebrow mb-1.5 block">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
          autoComplete="current-password"
          aria-describedby={error ? 'login-error' : undefined}
          className="field"
        />
      </div>

      {error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-sm px-3 py-2.5 text-sm"
          style={{
            background: 'rgba(240,90,82,0.1)',
            border: '1px solid rgba(240,90,82,0.3)',
            color: '#ff9d97',
          }}
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-50">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
