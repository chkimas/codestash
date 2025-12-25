import { Snippet, LanguageValue } from '@/lib/definitions'
import Search from '@/features/snippets/components/search'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import {
  Search as SearchIcon,
  TrendingUp,
  Code2,
  Globe,
  Database,
  Layers,
  Terminal,
  GitBranch,
  Cpu,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { trackSearch, getTrendingSearches } from '@/lib/analytics'

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
  }>
}

export const metadata: Metadata = {
  title: {
    absolute: 'CodeStash | The Open Registry for Developers'
  }
}

const FEATURE_ITEMS = [
  {
    icon: Database,
    title: 'Centralized Library',
    description: 'Stop losing code in Slack. Stash it once, find it forever.'
  },
  {
    icon: Globe,
    title: 'Public by Default',
    description: 'Share your solutions via a simple URL. No login required.'
  },
  {
    icon: Layers,
    title: 'Syntax Highlighting',
    description: 'Beautiful rendering for TypeScript, Rust, Go, and 50+ others.'
  },
  {
    icon: GitBranch,
    title: 'Version Control',
    description: 'Track changes and fork snippets from the community.'
  },
  {
    icon: Terminal,
    title: 'Developer First',
    description: 'Built for efficiency. No ads, no paywalls, just code.'
  },
  {
    icon: Cpu,
    title: 'Lightweight',
    description: 'Zero bloat. Pages load instantly.'
  }
]

export default async function Home(props: Props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''

  if (query) {
    void trackSearch(query)
  }

  const dbTrending = await getTrendingSearches()
  const trendingTags =
    dbTrending.length > 0 ? dbTrending : ['typescript', 'react', 'nextjs', 'rust']

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  // 1. Check if user has created ANY snippets (to conditionally hide CTA)
  let hasCreatedSnippets = false
  if (userId) {
    const { count } = await supabase
      .from('snippets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    hasCreatedSnippets = (count || 0) > 0
  }

  let snippets: Snippet[] = []

  try {
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
      .limit(24)

    if (query) {
      queryBuilder = queryBuilder
        .or(`title.ilike.%${query}%,language.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
    } else {
      queryBuilder = queryBuilder.order('created_at', { ascending: false })
    }

    const { data, error } = await queryBuilder.returns<SnippetRow[]>()

    if (error) {
      console.error('Database Error:', error.message)
    }

    if (data) {
      snippets = data.map((item) => ({
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
        is_favorited: item.favorites?.some((f) => f.user_id === userId) || false,
        favorite_count: item.favorites?.length || 0
      }))
    }
  } catch (error) {
    console.error('Server Error:', error)
  }

  return (
    <main className="min-h-screen bg-background text-foreground relative selection:bg-primary/20 isolate">
      {/* 1. TECHNICAL GRID BACKGROUND */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background pointer-events-none">
        <svg
          className="absolute inset-0 h-full w-full stroke-black/10 dark:stroke-white/10"
          style={{
            maskImage: 'radial-gradient(100% 100% at top center, white, transparent)',
            WebkitMaskImage: 'radial-gradient(100% 100% at top center, white, transparent)'
          }}
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="home-grid-pattern"
              width="40"
              height="40"
              x="50%"
              y="-1"
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 40V.5H40" fill="none" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" strokeWidth="0" fill="url(#home-grid-pattern)" />
        </svg>

        {/* Top Spotlight Glow */}
        <div className="absolute left-0 right-0 top-0 m-auto h-[500px] w-[500px] rounded-full bg-primary/20 opacity-20 blur-[100px] pointer-events-none" />
      </div>

      <section className="relative pb-12 md:pb-20 overflow-hidden">
        <div className="pt-6 md:pt-12" />
        <div className="container relative mx-auto px-4 sm:px-6 max-w-5xl z-10 text-center">
          <div className="flex justify-center mb-8 md:mb-10 mt-2 md:mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-xs transition-transform hover:scale-105 cursor-default">
              <span className="block font-mono text-muted-foreground text-xs md:text-sm lg:text-base">
                <span className="text-purple-500 dark:text-purple-400">import</span>{' '}
                <span className="text-foreground/60">{'{'}</span>{' '}
                <span className="text-foreground font-semibold">CodeStash</span>{' '}
                <span className="text-foreground/60">{'}'}</span>{' '}
                <span className="text-purple-500 dark:text-purple-400">from</span>{' '}
                <span className="text-foreground ">&apos;chkimas&apos;</span>
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 mt-4 leading-tight">
            <span className="text-foreground">Reusable code, at </span>
            <span className="bg-linear-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              zero cost.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 leading-relaxed font-light px-4">
            A centralized, searchable library for versioned code—designed for fast lookup, reuse,
            and community sharing.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 md:mb-10 relative z-20 px-4">
            <div className="p-1 rounded-2xl bg-linear-to-b shadow-sm backdrop-blur-sm">
              <Search
                placeholder="Search registry (e.g. 'auth hook', 'dockerfile')..."
                redirectUrl="/explore"
                key={query}
              />
            </div>

            {/* Quick Links / Trending */}
            {trendingTags.length > 0 && (
              <div className="mt-3 md:mt-4 flex flex-wrap items-center justify-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground font-mono">
                <div className="flex items-center gap-1.5 opacity-70">
                  <TrendingUp className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-xs uppercase tracking-wider">Trending:</span>
                </div>

                {trendingTags.map((term) => (
                  <Link
                    key={term}
                    href={`/?query=${encodeURIComponent(term)}`}
                    className="group hover:text-primary transition-colors flex items-center"
                  >
                    <span className="text-muted-foreground/40 mr-0.5 group-hover:text-primary/50">
                      #
                    </span>
                    <span className="underline-offset-4 group-hover:underline truncate max-w-20 md:max-w-none">
                      {term}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
            <Link
              href="/register"
              className="w-full sm:w-auto h-11 px-4 md:px-6 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-foreground/5"
            >
              <Terminal className="w-4 h-4 shrink-0" />
              <span className="truncate">Start Stashing</span>
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto h-11 px-4 md:px-6 rounded-lg border border-border bg-background hover:bg-muted/50 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="truncate">Explore Registry</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12 border-t border-dashed border-border/40 bg-muted/5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_ITEMS.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-xl border border-border/40 bg-card/40 hover:bg-card hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                  <feature.icon className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-base">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-[1600px]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Code2 className="w-5 h-5 text-primary" />
              {query ? `Results for "${query}"` : 'Fresh from the Community'}
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {query
                ? `Found ${snippets.length} matching snippets`
                : 'Discover what developers are building and sharing today.'}
            </p>
          </div>
        </div>

        {snippets.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} currentUserId={userId} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border/50 rounded-2xl bg-muted/5">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <SearchIcon className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No snippets found</h3>
            <p className="text-muted-foreground max-w-md text-center mt-2 text-sm">
              We couldn&apos;t find anything for &quot;{query}&quot;. Try a different keyword or
              browse the registry.
            </p>
            <div className="mt-6">
              <Link href="/" className="text-primary hover:underline text-sm font-medium">
                Clear Search
              </Link>
            </div>
          </div>
        )}

        {!query && snippets.length >= 24 && (
          <div className="mt-12 text-center">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded-full px-6 py-2 hover:bg-muted"
            >
              View all snippets
              <span className="text-xs">→</span>
            </Link>
          </div>
        )}
      </section>

      {!hasCreatedSnippets && (
        <section className="border-t border-border/40 py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-muted/30 -z-10" />

          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-6 animate-pulse">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Join the Open Registry</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Contribute reusable snippets, discover community-maintained utilities, and help create
              a shared library of production-ready code.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="h-11 px-6 rounded-lg bg-foreground text-background font-medium hover:opacity-90 transition-opacity flex items-center justify-center shadow-xl shadow-primary/10"
              >
                Always free. Get started
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
