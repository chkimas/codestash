import { notFound } from 'next/navigation'
import sql from '@/db/client'
import { Snippet } from '@/lib/definitions'
import { SnippetCard } from '@/features/snippets/components/snippet-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/server'
import { CalendarDays, Code2, Layers } from 'lucide-react'

interface ProfilePageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function ProfilePage(props: ProfilePageProps) {
  const params = await props.params
  const userId = params.userId

  // 1. Fetch Current Viewer (to check if they favorited things)
  const supabase = await createClient()
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser()
  const currentUserId = currentUser?.id ?? null

  // 2. Fetch Target User Profile
  // We use "limit 1" because ID is unique
  const [profile] = await sql`
    SELECT id, name, image, created_at 
    FROM users 
    WHERE id = ${userId}
  `

  if (!profile) {
    notFound() // This triggers the 404 page (which we will build next)
  }

  // 3. Fetch Their Public Snippets
  const snippets: Snippet[] = await sql`
    SELECT 
      s.*, 
      u.name as author_name,
      u.image as author_image,
      EXISTS(SELECT 1 FROM favorites f WHERE f.snippet_id = s.id AND f.user_id = ${currentUserId}) as is_favorited,
      (SELECT COUNT(*) FROM favorites f WHERE f.snippet_id = s.id) as favorite_count
    FROM snippets s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ${userId} 
    AND s.is_public = true
    ORDER BY s.created_at DESC
  `

  const stats = [
    { label: 'Snippets', value: snippets.length, icon: Code2 },
    // You could add 'Total Favorites' here if you wrote a complex query for it
    { label: 'Member Since', value: new Date(profile.created_at).getFullYear(), icon: CalendarDays }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* --- Header Section --- */}
      <div className="border-b border-neutral-200 bg-neutral-50/40">
        <div className="container max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            {/* Large Avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-sm">
              <AvatarImage src={profile.image || undefined} />
              <AvatarFallback className="text-4xl bg-neutral-200 text-neutral-500">
                {profile.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                  {profile.name}
                </h1>
                <p className="text-neutral-500 text-sm mt-1 font-mono">
                  User ID: <span className="text-neutral-400">{profile.id.slice(0, 8)}...</span>
                </p>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-center md:justify-start gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-2 text-sm text-neutral-600"
                  >
                    <stat.icon className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium text-neutral-900">{stat.value}</span>
                    <span className="text-neutral-500">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Content Grid --- */}
      <div className="container max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center gap-2 mb-8">
          <Layers className="h-5 w-5 text-neutral-400" />
          <h2 className="text-lg font-semibold text-neutral-900">Public Contributions</h2>
        </div>

        {snippets.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} currentUserId={currentUserId} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <p className="text-neutral-500">This user hasn&apos;t published any snippets yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
