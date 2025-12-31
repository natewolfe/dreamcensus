export default function JournalLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="animate-pulse">
        <div className="h-12 w-64 bg-[var(--background-elevated)] rounded mb-8" />
        <div className="h-32 bg-[var(--background-elevated)] rounded-2xl mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--background-elevated)] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

