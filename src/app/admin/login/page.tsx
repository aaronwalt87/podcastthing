import LoginForm from '@/components/admin/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-white">Admin Login</h1>
          <p className="text-neutral-500 text-sm mt-1">Enter your password to continue.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
