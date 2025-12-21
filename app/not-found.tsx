import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <FileQuestion className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground">Page not found</h2>
      <p className="mt-2 text-muted-foreground max-w-sm">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed or
        renamed.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline" className="border-border hover:bg-muted">
          <Link href="/library">Go to Library</Link>
        </Button>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
