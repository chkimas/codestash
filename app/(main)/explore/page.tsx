import { createClient } from '@/lib/supabase/server'
import { Snippet, LanguageValue } from '@/lib/definitions'
import { SnippetGrid } from '@/features/snippets/components/snippet-grid'
import Search from '@/features/snippets/components/search'
import { Metadata } from 'next'
import { TrendingUp, Star, Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Explore Community Snippets',
  description: 'Discover public code snippets from the CodeStash community.'
}

interface SnippetRow {
  id: string
  user_id: string
  title: string
  code: string
  language: string
  description: string | null
  is_public: boolean
  updated_at: string
  created_at: string
  users: { name: string; image: string | null; username: string | null } | null
  favorites: { user_id: string }[]
}

type Props = {
  searchParams?: Promise<{
    query?: string
    sort?: string
  }>
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'most_favorited', label: 'Most Favorited', icon: Star }
]

export default async function ExplorePage(props: Props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const sort = searchParams?.sort || 'newest'

  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  const currentUserId = user?.id || ''

  let queryBuilder = supabase
    .from('snippets')
    .select(
      `
      *,
      users!user_id (name, image, username),
      favorites!left (user_id)
    `
    )
    .eq('is_public', true)

  if (query) {
    queryBuilder = queryBuilder.or(
      `title.ilike.%${query}%,description.ilike.%${query}%,language.ilike.%${query}%`
    )
  }

  queryBuilder = queryBuilder.order('created_at', { ascending: false })

  const { data, error } = await queryBuilder.limit(24).returns<SnippetRow[]>()

  if (error) {
    console.error('Explore Fetch Error:', error)
  }

  let snippets: Snippet[] = (data || []).map((item) => ({
    id: item.id,
    user_id: item.user_id,
    title: item.title,
    code: item.code,
    language: item.language as LanguageValue,
    description: item.description,
    is_public: item.is_public,
    updated_at: item.updated_at,
    created_at: item.created_at,
    author_name: item.users?.name || 'Anonymous',
    author_image: item.users?.image || undefined,
    author_username: item.users?.username || undefined,
    is_favorited: user ? item.favorites?.some((f) => f.user_id === user.id) : false,
    favorite_count: item.favorites?.length || 0
  }))

  if (sort === 'most_favorited') {
    snippets = snippets.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="sticky top-14 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-backdrop-filter:bg-background/80">
        <div className="container mx-auto px-4 md:px-6 max-w-[1600px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4">
            <div className="flex-1 max-w-xl">
              <Search placeholder="Search community snippets..." className="h-10 w-full" />
            </div>

            <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon
                const isActive = sort === option.value
                return (
                  <Link
                    key={option.value}
                    href={`?${new URLSearchParams({
                      ...(query && { query }),
                      sort: option.value
                    }).toString()}`}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="md:hidden pb-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2">
              {SORT_OPTIONS.map((option) => {
                const Icon = option.icon
                const isActive = sort === option.value
                return (
                  <Link
                    key={option.value}
                    href={`?${new URLSearchParams({
                      ...(query && { query }),
                      sort: option.value
                    }).toString()}`}
                    className={cn(
                      'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-colors',
                      isActive
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-background border-border text-muted-foreground'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-[1600px]">
        {query && (
          <div className="mb-6 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Results for:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              &quot;{query}&quot;
              <Link href="/explore" className="hover:bg-primary/20 rounded-full p-0.5 ml-1">
                ✕
              </Link>
            </div>
          </div>
        )}

        {snippets.length > 0 ? (
          <SnippetGrid
            initialSnippets={snippets}
            currentUserId={currentUserId}
            query={query}
            hideToolbar={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {query ? 'No matches found' : 'No snippets yet'}
            </h3>
            <p className="text-muted-foreground max-w-md mb-8">
              {query
                ? `We couldn't find any snippets matching "${query}". Try different keywords.`
                : 'The community library is empty. Be the first to share your code!'}
            </p>
            {user && (
              <Button asChild size="lg">
                <Link href="/library/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Share Your First Snippet
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
