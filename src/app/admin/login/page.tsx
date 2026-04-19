import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#131313' }}>
      <div className="w-full max-w-sm p-8" style={{ background: '#353534', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        <div className="mb-8 text-center">
          <h1
            className="text-xl font-bold tracking-widest uppercase"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#e5e2e1' }}
          >
            ADMIN ACCESS
          </h1>
          <p
            className="text-xs mt-2 uppercase tracking-wider"
            style={{ color: '#67d7e1', opacity: 0.7, fontFamily: "'Space Grotesk', sans-serif" }}
          >
            ENTER CREDENTIALS TO CONTINUE
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
