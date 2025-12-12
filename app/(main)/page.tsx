import sql from '@/db/client'
import { Snippet } from '@/lib/definitions'
import Search from '@/features/snippets/components/search'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { SearchX, Sparkles } from 'lucide-react'
import { auth } from '@/auth'
import { Badge } from '@/components/ui/badge'

type Props = {
  searchParams?: Promise<{
    query?: string
  }>
}

export default async function Home(props: Props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const session = await auth()
  const userId = session?.user?.id ?? null

  let snippets: Snippet[] = []

  try {
    const searchQuery = query ? `%${query}%` : null

    // Optimized Query Construction
    if (searchQuery) {
      snippets = await sql`
        SELECT 
          s.*, 
          u.name as author_name,
          NULL as author_image,
          EXISTS(SELECT 1 FROM favorites f WHERE f.snippet_id = s.id AND f.user_id = ${userId}) as is_favorited,
          (SELECT COUNT(*) FROM favorites f WHERE f.snippet_id = s.id) as favorite_count
        FROM snippets s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.is_public = true 
        AND (
          s.title ILIKE ${searchQuery} OR 
          s.language ILIKE ${searchQuery} OR
          s.description ILIKE ${searchQuery}
        )
        ORDER BY s.created_at DESC
        LIMIT 24
      `
    } else {
      snippets = await sql`
        SELECT 
          s.*, 
          u.name as author_name,
          NULL as author_image,
          EXISTS(SELECT 1 FROM favorites f WHERE f.snippet_id = s.id AND f.user_id = ${userId}) as is_favorited,
          (SELECT COUNT(*) FROM favorites f WHERE f.snippet_id = s.id) as favorite_count
        FROM snippets s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE s.is_public = true 
        ORDER BY s.created_at DESC
        LIMIT 24
      `
    }
  } catch (error) {
    console.error('Database Error:', error)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="relative border-b border-neutral-200 bg-neutral-50/50 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

        <div className="container relative mx-auto px-6 max-w-5xl text-center z-10">
          <Badge
            variant="outline"
            className="mb-6 bg-white shadow-sm text-neutral-600 border-neutral-200 py-1.5 px-3"
          >
            <Sparkles className="w-3 h-3 mr-2 text-amber-500" />
            v1.0 Now Available
          </Badge>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-neutral-900 mb-6">
            Build faster with <span className="text-neutral-500">CodeStash.</span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-10">
            A free, open registry engineered for developers — fast, searchable, and built for
            seamless knowledge reuse. Zero cost. Public by default.
          </p>

          {/* Elevated Search Container */}
          <div className="max-w-xl mx-auto transform transition-all hover:scale-[1.01]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-neutral-200 to-neutral-100 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-white shadow-lg rounded-lg overflow-hidden border border-neutral-200">
                <Search placeholder="Search snippets (e.g. 'Postgres Index', 'React Table')..." />
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-neutral-400 font-mono">
              <span>Suggested:</span>
              <span className="hover:text-neutral-900 cursor-pointer transition-colors">
                rust-axum
              </span>
              <span className="hover:text-neutral-900 cursor-pointer transition-colors">
                next-auth
              </span>
              <span className="hover:text-neutral-900 cursor-pointer transition-colors">
                shadcn-ui
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Results Grid - Styled as "Dashboard" */}
      <section className="container mx-auto px-6 py-16 max-w-[1600px]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-neutral-900 rounded-full" />
            <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
              {query ? `Results for "${query}"` : 'Recent Community Contributions'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-neutral-500">
              Showing {snippets.length} resources
            </span>
          </div>
        </div>

        {/* Content Grid */}
        {snippets.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} currentUserId={userId} />
            ))}
          </div>
        ) : (
          /* Empty State - Minimalist */
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4 border border-neutral-100">
              <SearchX className="h-6 w-6 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No results found</h3>
            <p className="text-neutral-500 text-sm max-w-xs text-center">
              We couldn&apos;t find anything matching &quot;{query}&quot;. Try adjusting your
              keywords.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
