import Link from 'next/link'
import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl">🌙</div>
        
        <div>
          <h1 className="text-3xl font-medium text-foreground mb-2">
            Page Not Found
          </h1>
          <p className="text-muted">
            This page doesn't exist or has been moved
          </p>
        </div>

        <Link href="/today">
          <Button variant="primary">
            Go to Today
          </Button>
        </Link>
      </div>
    </div>
  )
}

