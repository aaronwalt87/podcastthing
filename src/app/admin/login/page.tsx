import type { Metadata } from 'next'
import Link from 'next/link'
import LoginForm from '@/components/admin/LoginForm'
import PageMasthead from '@/components/ui/PageMasthead'
import styles from '@/components/ui/PageMasthead.module.css'

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className={`shell ${styles.page} ${styles.adminPage}`}>
      <PageMasthead index="A" eyebrow="Restricted access" title="Admin" />
      <div className={styles.login}>
        <div>
          <p className={styles.loginTitle}>A little work behind the scenes.</p>
          <Link href="/" className="btn btn-ghost mt-8">← Back to the site</Link>
        </div>
        <div className={styles.loginPanel}>
          <h2 className="text-2xl font-medium tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-paper-3">
            Enter the shared password to manage the episode archive.
          </p>

          <div className="mt-8">
            <LoginForm />
          </div>
        </div>

      </div>
    </div>
  )
}
