import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { AdminSnippetRow } from './snippet-row'
import Search from '@/features/snippets/components/search'

type SnippetWithProfile = Database['public']['Tables']['snippets']['Row'] & {
  profiles: Pick<Database['public']['Tables']['users']['Row'], 'username' | 'email'> | null
}

export default async function AdminSnippetsPage({
  searchParams
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const params = await searchParams
  const query = params.query || ''
  const supabase = await createAdminClient()

  const orConditions = [`title.ilike.%${query}%`, `language.ilike.%${query}%`]

  if (query) {
    const { data: matchingUsers } = await supabase
      .from('users')
      .select('id')
      .ilike('username', `%${query}%`)
      .limit(20)

    if (matchingUsers && matchingUsers.length > 0) {
      const ids = matchingUsers.map((u) => u.id).join(',')
      orConditions.push(`user_id.in.(${ids})`)
    }
  }

  let dbQuery = supabase
    .from('snippets')
    .select(
      `
      *,
      profiles:users!user_id (username, email)
    `
    )
    .order('created_at', { ascending: false })
    .limit(50)

  if (query) {
    dbQuery = dbQuery.or(orConditions.join(','))
  }

  const { data: snippets = [] } = await dbQuery

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Snippet Moderation</h1>
      </div>

      <div className="max-w-sm">
        <Search placeholder="Search title, language, or author..." />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(snippets ?? []).map((snippet) => (
              <AdminSnippetRow key={snippet.id} snippet={snippet as SnippetWithProfile} />
            ))}
            {(snippets ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No snippets found matching &quot;{query}&quot;
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
