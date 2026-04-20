import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main className="fixed inset-0 flex items-center justify-center px-4" style={{ zIndex: 2 }}>
      <div className="w-full max-w-sm glass rounded-lg overflow-hidden">
        {/* Traffic light title bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#fdbb2c' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28c840' }} />
          </div>
          <span className="font-mono text-xs ml-2" style={{ color: 'rgba(0,255,65,0.5)', fontSize: '11px' }}>
            AUTH_GATE {'// ROOT@PODCAST_TERM'}
          </span>
        </div>

        {/* Form body */}
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1
              className="text-xl font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#ffffff' }}
            >
              ADMIN ACCESS
            </h1>
            <p
              className="text-xs mt-2 uppercase tracking-wider"
              style={{ color: 'rgba(0,255,65,0.55)', fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ENTER CREDENTIALS TO CONTINUE
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
