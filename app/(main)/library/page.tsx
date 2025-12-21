import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Code2, SearchX, Filter } from 'lucide-react'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import Search from '@/features/snippets/components/search'
import { Snippet } from '@/lib/definitions'

type Props = {
  searchParams?: Promise<{
    query?: string
  }>
}

export default async function Library(props: Props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id

  let snippets: Snippet[] = []

  try {
    const searchQuery = query ? `%${query}%` : null

    if (searchQuery) {
      snippets = await sql`
        SELECT 
          s.*, 
          u.name as author_name, 
          u.image as author_image,
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
          s.title ILIKE ${searchQuery} OR 
          s.language ILIKE ${searchQuery} OR 
          s.description ILIKE ${searchQuery}
        )
        ORDER BY s.created_at DESC
      `
    } else {
      snippets = await sql`
        SELECT 
          s.*, 
          u.name as author_name, 
          u.image as author_image,
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
  } catch (error) {
    console.error('Database Error:', error)
  }

  const hasSnippets = snippets.length > 0

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="sticky top-14 z-20 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 max-w-[1600px] h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{snippets.length}</span>
            <span>items</span>
          </div>

          <div className="w-full max-w-xs">
            <Search placeholder="Filter library..." />
          </div>
        </div>
      </div>

      <section className="container mx-auto px-6 py-8 max-w-[1600px]">
        {!hasSnippets ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm border border-border mb-6">
              {query ? (
                <SearchX className="h-7 w-7 text-muted-foreground" />
              ) : (
                <Code2 className="h-7 w-7 text-muted-foreground" />
              )}
            </div>

            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {query ? 'No matching snippets' : 'Library is empty'}
            </h2>

            <p className="text-muted-foreground max-w-md text-center mt-2 mb-8 leading-relaxed">
              {query
                ? `We couldn't find any snippets matching "${query}". Try different keywords.`
                : 'Your personal knowledge base starts here. Save your first reusable component or query.'}
            </p>

            {!query && (
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <Link href="/library/create">
                  <Plus className="h-4 w-4" />
                  Create First Snippet
                </Link>
              </Button>
            )}

            {query && (
              <Button variant="outline" asChild>
                <Link href="/library">Clear Search</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} currentUserId={userId} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
