import { notFound } from 'next/navigation'
import sql from '@/db/client'
import { Snippet } from '@/lib/definitions'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/server'
import { CalendarDays, Code2, Layers, Sparkles, Award, Globe, Quote } from 'lucide-react'
import { differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'
import { Metadata } from 'next'

interface ProfilePageProps {
  params: Promise<{
    username: string
  }>
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

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { username } = await params
  const decodedUsername = decodeURIComponent(username)

  const [user] = await sql`
    SELECT name FROM users WHERE username = ${decodedUsername}
  `

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

  const [profile] = await sql`
    SELECT id, name, image, bio, created_at, username
    FROM users 
    WHERE username = ${username}
  `

  if (!profile) {
    notFound()
  }

  const snippets: Snippet[] = await sql`
    SELECT 
      s.*, 
      u.name as author_name,
      u.image as author_image,
      u.username as author_username,
      EXISTS(SELECT 1 FROM favorites f WHERE f.snippet_id = s.id AND f.user_id = ${currentUserId}) as is_favorited,
      (SELECT COUNT(*) FROM favorites f WHERE f.snippet_id = s.id) as favorite_count
    FROM snippets s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ${profile.id} 
    AND s.is_public = true
    ORDER BY s.created_at DESC
  `

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

        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-transparent to-background pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-6 relative">
          <div className="pt-28 pb-20">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-br from-foreground/10 via-transparent to-foreground/10 rounded-full blur opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                <Avatar className="relative h-32 w-32 md:h-40 md:w-40 border-[4px] border-background shadow-xl">
                  <AvatarImage src={profile.image || undefined} className="object-cover" />
                  <AvatarFallback className="text-4xl font-light bg-muted text-foreground">
                    {profile.name?.charAt(0).toUpperCase()}
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
                    <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-xs font-medium text-muted-foreground border border-border/50">
                        <Globe className="h-3 w-3" />
                        <code className="font-mono tracking-wider">@{profile.username}</code>
                      </div>
                      <span className="text-sm text-muted-foreground/80">
                        {snippets.length === 0 ? 'New Member' : 'Active Contributor'}
                      </span>
                    </div>
                  </div>

                  <div className="relative max-w-2xl mx-auto md:mx-0">
                    {profile.bio ? (
                      <p className="text-lg text-foreground/80 leading-relaxed font-light">
                        {profile.bio}
                      </p>
                    ) : (
                      <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground/60 italic">
                        <Quote className="h-4 w-4 rotate-180" />
                        <span>Sharing knowledge through elegant code solutions</span>
                      </div>
                    )}
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
                <div className="absolute -inset-1 bg-gradient-to-r from-foreground/5 to-transparent rounded-full blur" />
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

          <div className="h-px bg-gradient-to-r from-border/5 via-border/40 to-border/5" />
        </div>

        {snippets.length > 0 ? (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet, index) => (
              <div
                key={snippet.id}
                className="group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute -inset-px bg-gradient-to-br from-foreground/5 via-transparent to-foreground/5 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative bg-card/40 backdrop-blur-sm border border-border/60 rounded-xl overflow-hidden transition-all duration-300 hover:border-border hover:shadow-lg animate-in fade-in slide-in-from-bottom-5">
                  <SnippetCard snippet={snippet} currentUserId={currentUserId} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-8 bg-gradient-to-r from-foreground/5 via-transparent to-foreground/5 rounded-full blur-xl" />
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
