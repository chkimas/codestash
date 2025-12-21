import sql from '@/db/client'
import { Snippet } from '@/lib/definitions'
import Search from '@/features/snippets/components/search'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { SearchX, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { trackSearch, getTrendingSearches } from '@/lib/analytics'

type Props = {
  searchParams?: Promise<{
    query?: string
  }>
}

export default async function Home(props: Props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''

  if (query) {
    void trackSearch(query)
  }

  const dbTrending = await getTrendingSearches()
  const trendingTags = dbTrending.length > 0 ? dbTrending : ['typescript', 'nextjs', 'supabase']

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  const userId = user?.id ?? null

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
          u.image as author_image,
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
      <section className="relative border-b border-border bg-muted/30 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

        <div className="container relative mx-auto px-6 max-w-5xl text-center z-10">
          <Badge
            variant="outline"
            className="mb-6 bg-card shadow-sm text-muted-foreground border-border py-1.5 px-3"
          >
            <Sparkles className="w-3 h-3 mr-2 text-amber-500" />
            v1.0 Now Available
          </Badge>

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter text-foreground mb-6">
            Build faster with{' '}
            <span className="relative font-bold inline-flex">
              {['C', 'o', 'd', 'e', 'S', 't', 'a', 's', 'h', '.'].map((letter, i) => (
                <span
                  key={i}
                  className="inline-block animate-bounce"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '2.5s',
                    animationIterationCount: 'infinite',
                    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <span className="bg-gradient-to-b from-red-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                    {letter}
                  </span>
                </span>
              ))}

              {/* Motion trail effect */}
              <span className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute top-0 h-full w-0.5 bg-gradient-to-b from-transparent via-purple-400/30 to-transparent animate-scanline"
                    style={{
                      left: `${30 + i * 20}%`,
                      animationDelay: `${i * 0.2}s`
                    }}
                  />
                ))}
              </span>
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            A free, open registry engineered for developers — fast, searchable, and built for
            seamless knowledge reuse. Zero cost. Public by default.
          </p>

          {/* Elevated Search Container */}
          <div className="max-w-xl mx-auto transform transition-all hover:scale-[1.01]">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-muted to-muted/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-card shadow-lg rounded-lg overflow-hidden border border-border">
                <Search placeholder="That code (you) KNOW `you` saved…" />
              </div>
            </div>

            {/* DYNAMIC TRENDING SECTION */}
            {trendingTags.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
                  Trending
                </span>

                {trendingTags.map((term) => (
                  <Link
                    key={term}
                    href={`/?query=${encodeURIComponent(term)}`}
                    className="
                      group relative flex items-center rounded-full border border-border 
                      bg-card px-3 py-1 text-xs font-medium text-muted-foreground 
                      transition-all duration-200 ease-out
                      hover:border-foreground/30 hover:text-foreground 
                      active:scale-95
                    "
                  >
                    <span className="mr-0.5 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground">
                      #
                    </span>
                    {term}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-foreground rounded-full" />
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              {query ? `Results for "${query}"` : 'Recent Community Contributions'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
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
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-border rounded-xl bg-muted/20">
            <div className="bg-card p-4 rounded-full shadow-sm mb-4 border border-border">
              <SearchX className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No results found</h3>
            <p className="text-muted-foreground text-sm max-w-xs text-center">
              We couldn&apos;t find anything matching &quot;{query}&quot;. Try adjusting your
              keywords.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
