import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="panel p-8" style={{ boxShadow: 'var(--shadow-panel)' }}>
          <p className="eyebrow eyebrow-accent">Restricted</p>
          <h1 className="display mt-3 text-3xl">Admin</h1>
          <p className="mt-2 text-sm text-paper-3">
            Enter the shared password to manage the episode archive.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-xs text-paper-3 transition-colors hover:text-paper-2"
        >
          ← Back to the site
        </Link>
      </div>
    </div>
  )
}
