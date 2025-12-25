import { notFound } from 'next/navigation'
import { Snippet, LanguageValue } from '@/lib/definitions'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/server'
import {
  CalendarDays,
  Code2,
  Layers,
  Sparkles,
  Award,
  Quote,
  AtSign,
  GitBranch,
  Trophy,
  Zap,
  Star
} from 'lucide-react'
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'
import { Metadata } from 'next'
import { cn } from '@/lib/utils'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
}

// Strict DB Row Type
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

function getMemberDuration(date: Date) {
  const now = new Date()
  const years = differenceInYears(now, date)
  const months = differenceInMonths(now, date)
  const days = differenceInDays(now, date)

  if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'}`
  if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'}`
  return `${days} ${days === 1 ? 'day' : 'days'}`
}

export async function generateMetadata(props: ProfilePageProps): Promise<Metadata> {
  const params = await props.params
  const decodedUsername = decodeURIComponent(params.username)

  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('username', decodedUsername)
    .single()

  return {
    title: user?.name || 'Profile'
  }
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params
  const username = decodeURIComponent(params.username)

  const supabase = await createClient()
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()
  const currentUserId = currentUser?.id ?? null

  // 1. Get Profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, name, image, bio, created_at, username')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  // 2. Get User's Public Snippets
  const { data: snippetData, error: snippetError } = await supabase
    .from('snippets')
    .select(
      `
      *,
      users!user_id (name, image, username),
      favorites!left (user_id)
    `
    )
    .eq('user_id', profile.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .returns<SnippetRow[]>()

  if (snippetError) {
    console.error('Profile Snippets Error:', snippetError)
  }

  // 3. Transform Data
  const snippets: Snippet[] = (snippetData || []).map((item) => ({
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
    author_username: item.users?.username || '',
    is_favorited: item.favorites?.some((f) => f.user_id === currentUserId) || false,
    favorite_count: item.favorites?.length || 0
  }))

  const totalFavorites = snippets.reduce((acc, snippet) => acc + (snippet.favorite_count || 0), 0)
  const memberSince = new Date(profile.created_at)
  const joinYear = memberSince.getFullYear().toString()

  const stats = [
    {
      label: 'Snippets',
      value: snippets.length,
      icon: Code2,
      description: 'Public contributions',
      accent: 'text-foreground'
    },
    {
      label: 'Total Favorites',
      value: totalFavorites,
      icon: Sparkles,
      description: 'Community appreciation',
      accent: 'text-muted-foreground'
    },
    {
      label: 'Member Since',
      value: joinYear,
      icon: CalendarDays,
      description: `${getMemberDuration(memberSince)} with us`,
      accent: 'text-foreground'
    }
  ]

  const getRank = (count: number) => {
    if (count >= 20)
      return {
        label: 'Code Architect',
        icon: Trophy,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      }
    if (count >= 10)
      return {
        label: 'Library Builder',
        icon: Zap,
        color: 'text-violet-500 bg-violet-500/10 border-violet-500/20'
      }
    if (count >= 1)
      return {
        label: 'Contributor',
        icon: GitBranch,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
      }
    return {
      label: 'Stash Explorer',
      icon: Star,
      color: 'text-muted-foreground bg-muted/50 border-border/50'
    }
  }

  const rank = getRank(snippets.length)

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border/40 bg-muted/10 dark:bg-background overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(#888 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        ></div>

        <div className="absolute inset-0 bg-linear-to-b from-background/0 via-transparent to-background pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-6 relative">
          <div className="pt-28 pb-20">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-br from-foreground/10 via-transparent to-foreground/10 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                <Avatar className="relative h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                  <AvatarImage src={profile.image || undefined} className="object-cover" />
                  <AvatarFallback className="text-4xl font-light bg-muted text-foreground">
                    {profile.name
                      ?.split(' ')
                      .slice(0, 2)
                      .map((chunk: string) => chunk[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {totalFavorites > 10 && (
                  <div className="absolute -bottom-2 -right-2 bg-foreground text-background rounded-full p-2 border-4 border-background shadow-sm">
                    <Award className="h-5 w-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-8">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-light tracking-tight text-foreground leading-tight">
                      {profile.name}
                    </h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-muted/50 border border-border/50 transition-colors hover:bg-muted hover:border-border">
                        <AtSign className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span className="font-mono text-xs text-foreground/90 font-medium tracking-wide">
                          {profile.username}
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${rank.color} transition-all`}
                      >
                        <rank.icon className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">{rank.label}</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative max-w-2xl mx-auto md:mx-0">
                    <div
                      className={cn(
                        'flex items-start justify-center md:justify-start gap-2 italic font-light',
                        profile.bio ? 'text-muted-foreground' : 'text-muted-foreground/60'
                      )}
                    >
                      <Quote className="h-4 w-4 rotate-180 shrink-0 mt-1 opacity-50" />
                      <p className="text-lg leading-relaxed">
                        {profile.bio || 'Sharing knowledge through elegant code solutions'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl">
                  {stats.map((stat) => (
                    <div key={stat.label} className="group relative">
                      <div className="relative bg-card/50 dark:bg-card/20 backdrop-blur-sm border border-border/50 rounded-2xl p-5 transition-all duration-300 hover:border-border hover:shadow-sm hover:-translate-y-0.5">
                        <div className="flex items-center justify-between mb-3">
                          <stat.icon
                            className={`h-5 w-5 ${stat.accent} opacity-70 group-hover:opacity-100 transition-opacity`}
                          />
                          <span className="text-xs font-medium text-muted-foreground/70 bg-muted/40 px-2.5 py-1 rounded-full">
                            {stat.label}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-light text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground/70">{stat.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 py-16">
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-linear-to-r from-foreground/5 to-transparent rounded-full blur" />
                <div className="relative bg-card border border-border rounded-xl p-2.5 shadow-sm">
                  <Layers className="h-5 w-5 text-foreground/80" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-light tracking-tight text-foreground">
                  Public Contributions
                </h2>
                <p className="text-muted-foreground/70 mt-1 text-sm">
                  Code snippets shared with the community
                </p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground hidden sm:block">
              <span className="text-foreground font-medium">Latest</span> • {snippets.length} items
            </div>
          </div>

          <div className="h-px bg-linear-to-r from-border/5 via-border/40 to-border/5" />
        </div>

        {snippets.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet, index) => (
              <div
                key={snippet.id}
                className="group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute -inset-px bg-linear-to-br from-foreground/5 via-transparent to-foreground/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-border hover:shadow-lg animate-in fade-in slide-in-from-bottom-5">
                  <SnippetCard snippet={snippet} currentUserId={currentUserId} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-8 bg-linear-to-r from-foreground/5 via-transparent to-foreground/5 rounded-full blur-xl" />
              <div className="relative bg-card/60 backdrop-blur-sm border border-border/40 rounded-3xl p-12 max-w-md shadow-sm">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/30">
                  <Code2 className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-light text-foreground mb-3">No contributions yet</h3>
                <p className="text-muted-foreground/80 mb-8 leading-relaxed">
                  This space is waiting for the first snippet to be shared. Great developers start
                  by sharing their knowledge.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
