import { auth } from '@/auth'
import sql from '@/app/lib/db'
import { Snippet } from '@/app/lib/definitions'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlusIcon, Code2Icon } from 'lucide-react'
import { getLanguageIcon } from '@/app/lib/icons'

export default async function Dashboard() {
  const session = await auth()

  const userId = session?.user?.id
  if (!userId) return null

  // Fetch Data
  const snippets = await sql<Snippet[]>`
    SELECT *
    FROM snippets
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `

  return (
    <main className="container mx-auto p-8 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your code snippets.</p>
        </div>

        {/* The Action Button */}
        <Button asChild>
          <Link href="/dashboard/create">
            <PlusIcon className="mr-2 h-4 w-4" />
            New Snippet
          </Link>
        </Button>
      </div>

      {/* Grid Section */}
      {snippets.length === 0 ? (
        // Empty State
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-slate-50/50">
          <div className="rounded-full bg-slate-100 p-3 mb-4">
            <Code2Icon className="h-6 w-6 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold">No snippets yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            You haven&apos;t saved any code yet. Create your first snippet to get started.
          </p>
          <Button variant="outline" asChild>
            <Link href="/dashboard/create">Create Snippet</Link>
          </Button>
        </div>
      ) : (
        // Snippet List
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {snippets.map((item) => (
            <Link key={item.id} href={`/dashboard/${item.id}`} className="block h-full">
              <Card className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg leading-tight truncate">{item.title}</CardTitle>
                    <span className="flex items-center gap-1 shrink-0 bg-slate-100 px-2 py-1 rounded border text-slate-600 uppercase font-bold text-[10px]">
                      {getLanguageIcon(item.language)}
                      {item.language}
                    </span>
                  </div>
                  <CardDescription className="line-clamp-2 min-h-[10]">
                    {item.description || 'No description provided.'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
