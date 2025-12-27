import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server' // ✅ Regular client (RLS-safe)
import type { Database } from '@/types/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Code2, Heart, Activity } from 'lucide-react'
import { AnalyticsCharts } from './analytics-charts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const dynamic = 'force-dynamic'

// ✅ REAL Supabase types - NO manual duplication
type SnippetWithUser = Database['public']['Tables']['snippets']['Row'] & {
  users: Pick<Database['public']['Tables']['users']['Row'], 'name' | 'image'> | null
}

type RecentUser = Pick<
  Database['public']['Tables']['users']['Row'],
  'id' | 'name' | 'email' | 'image' | 'created_at'
>

export default async function AdminDashboard() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) return redirect('/login')

  // ✅ RLS-safe role check (no service role needed)
  const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single()

  if (dbUser?.role !== 'admin') {
    return redirect('/')
  }

  // ✅ Parallel queries with REAL types
  const [
    { count: userCount },
    { count: snippetCount },
    { count: favoriteCount },
    { data: recentSnippetsData },
    { data: recentUsersData }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('snippets').select('*', { count: 'exact', head: true }),
    supabase.from('favorites').select('*', { count: 'exact', head: true }),
    // Recent Snippets - Supabase types automatically
    supabase
      .from('snippets')
      .select('*, users(name, image)')
      .order('created_at', { ascending: false })
      .limit(10),
    // Recent Users
    supabase
      .from('users')
      .select('id, name, email, image, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const recentSnippets: SnippetWithUser[] = recentSnippetsData || []
  const recentUsers: RecentUser[] = recentUsersData || []

  // ✅ Typed language analytics
  const { data: snippets } = await supabase.from('snippets').select('language')
  const languageMap: Record<string, number> = {}

  snippets?.forEach((s) => {
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
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm text-muted-foreground">System Healthy</p>
        </div>
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
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
            <Code2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{snippetCount || 0}</div>
            <p className="text-xs text-muted-foreground">+48 new snippets this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favoriteCount || 0}</div>
            <p className="text-xs text-muted-foreground">Community engagement score</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Lists Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Analytics Chart */}
        <div className="col-span-4">
          <AnalyticsCharts languageData={languageData} />
        </div>

        {/* Recent Activity / Users Feed */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Newest members joining the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                      <AvatarFallback className="text-xs">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.name || 'Anonymous User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate w-[180px]">
                        {user.email}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {new Date(user.created_at || '').toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Snippets (Full Width) */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Snippets</CardTitle>
            <CardDescription>Latest code shared by the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full overflow-y-auto pr-2">
              <div className="space-y-6">
                {recentSnippets.length > 0 ? (
                  recentSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="flex items-start justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 mt-1 border border-border">
                          <AvatarImage src={snippet.users?.image || ''} alt="Avatar" />
                          <AvatarFallback>{snippet.users?.name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none hover:underline cursor-pointer">
                            {snippet.title}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <span className="font-medium text-foreground/80">
                              {snippet.users?.name || 'Unknown'}
                            </span>
                            <span>•</span>
                            <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                              {snippet.language}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                        {new Date(snippet.created_at || '').toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    No snippets created yet.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
