export default function ProfileLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-[var(--foreground-muted)]">Loading your profile...</p>
      </div>
    </div>
  )
}

