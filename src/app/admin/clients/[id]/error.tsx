'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-2xl font-bold mb-4 text-destructive">Something went wrong!</h2>
      <p className="text-muted-foreground mb-6 text-center">
        We encountered an error while loading this page. Please try again.
      </p>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => reset()}
        >
          Try again
        </Button>
        <Button asChild>
          <Link href="/admin/clients">
            Back to Clients
          </Link>
        </Button>
      </div>
    </div>
  )
}
