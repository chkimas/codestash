import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Code2, Heart } from 'lucide-react'
import { AnalyticsCharts } from './analytics-charts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const dynamic = 'force-dynamic'

// Define the shape of the data returned by the join query
interface SnippetWithUser {
  id: string
  title: string
  language: string
  created_at: string
  users: {
    name: string | null
    avatar_url: string | null
  } | null
}

export default async function AdminDashboard() {
  const supabaseAuth = await createClient()
  const {
    data: { user }
  } = await supabaseAuth.auth.getUser()

  if (!user) return redirect('/login')

  const { data: dbUser } = await supabaseAuth
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (dbUser?.role !== 'admin') {
    return redirect('/')
  }
  // ----------------------

  const supabase = await createAdminClient()

  const [
    { count: userCount },
    { count: snippetCount },
    { count: favoriteCount },
    { data: recentSnippetsData }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('snippets').select('*', { count: 'exact', head: true }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }),
    supabase
      .from('snippets')
      .select('*, users(name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(5)
      .returns<SnippetWithUser[]>()
  ])

  const recentSnippets = recentSnippetsData || []

  const { data: snippets } = await supabase.from('snippets').select('language')
  const languageMap: Record<string, number> = {}

  snippets?.forEach((s) => {
    // Ensure we handle nulls strictly
    const lang = s.language ?? 'Plain Text'
    languageMap[lang] = (languageMap[lang] || 0) + 1
  })

  const languageData = Object.entries(languageMap)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, Admin.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snippetCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <AnalyticsCharts languageData={languageData} />
        </div>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Snippets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentSnippets.map((snippet) => (
                <div key={snippet.id} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={snippet.users?.avatar_url || ''} alt="Avatar" />
                    <AvatarFallback>{snippet.users?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{snippet.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {snippet.users?.name || 'Unknown'} • {snippet.language}
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    {new Date(snippet.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
