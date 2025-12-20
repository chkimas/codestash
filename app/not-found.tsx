import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-center">
      <div className="rounded-full bg-neutral-100 p-4 mb-4">
        <FileQuestion className="h-10 w-10 text-neutral-500" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Page not found</h2>
      <p className="mt-2 text-neutral-500 max-w-sm">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed or renamed.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline">
          <Link href="/library">Go to Library</Link>
        </Button>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}