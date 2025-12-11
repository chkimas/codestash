import { auth } from '@/auth'
import sql from '@/app/lib/db'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
// import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PlusIcon, Code2Icon } from 'lucide-react'
// import { getLanguageIcon } from '@/app/lib/icons'
import { SnippetCard } from '@/components/snippet-card'
import { Snippet } from '@/app/lib/definitions'

type Props = {
  searchParams?: Promise<{
    query?: string
  }>
}

export default async function Dashboard(props: Props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return null

  let snippets: Snippet[] = []

  try {
    let result

    if (query) {
      result = await sql`
        SELECT 
          s.*, 
          u.name as author_name,
          NULL as author_image,
          EXISTS(SELECT 1 FROM favorites f WHERE f.snippet_id = s.id AND f.user_id = ${userId}) as is_favorited,
          (SELECT COUNT(*) FROM favorites f WHERE f.snippet_id = s.id) as favorite_count
        FROM snippets s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 
          (
            s.user_id = ${userId} 
            OR 
            s.id IN (SELECT snippet_id FROM favorites WHERE user_id = ${userId})
          )
        AND (
          s.title ILIKE ${`%${query}%`} OR 
          s.language ILIKE ${`%${query}%`} OR
          s.description ILIKE ${`%${query}%`}
        )
        ORDER BY s.created_at DESC
      `
    } else {
      result = await sql`
        SELECT 
          s.*, 
          u.name as author_name,
          NULL as author_image,
          EXISTS(SELECT 1 FROM favorites f WHERE f.snippet_id = s.id AND f.user_id = ${userId}) as is_favorited,
          (SELECT COUNT(*) FROM favorites f WHERE f.snippet_id = s.id) as favorite_count
        FROM snippets s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 
          s.user_id = ${userId} 
          OR 
          s.id IN (SELECT snippet_id FROM favorites WHERE user_id = ${userId})
        ORDER BY s.created_at DESC
      `
    }

    snippets = result as unknown as Snippet[]
  } catch (error) {
    console.error('Database Error:', error)
  }
  const hasSnippets = snippets.length > 0

  return (
    <main className="container mx-auto p-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your code snippets.</p>
        </div>

        {hasSnippets && (
          <Button asChild className="shrink-0">
            <Link href="/dashboard/create">
              <PlusIcon className="h-4 w-4 mr-2" />
              New Snippet
            </Link>
          </Button>
        )}
      </header>

      <section aria-label="Snippet List">
        {!hasSnippets ? (
          // Empty State (This looks great as is)
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-slate-50/50 dark:bg-slate-900/20">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-4">
              <Code2Icon className="h-6 w-6 text-slate-500" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-semibold">No snippets yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-4 mt-1">
              You haven&apos;t saved any code yet. Create your first snippet to get started.
            </p>
            <Button asChild>
              <Link href="/dashboard/create">Create Snippet</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* {snippets.map((item) => (
              <li key={item.id} className="h-full">
                <Link href={`/dashboard/${item.id}`} className="block h-full group">
                  <Card className="flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer bg-card text-card-foreground">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg leading-tight truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </CardTitle>
                        <span className="flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border text-slate-600 dark:text-slate-400 uppercase font-bold text-[10px]">
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
              </li>
            ))} */}
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} currentUserId={userId} />
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
