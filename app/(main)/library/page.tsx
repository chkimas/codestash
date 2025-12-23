import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import sql from '@/db/client'
import { Snippet } from '@/lib/definitions'
import { Metadata } from 'next'
import { SnippetGrid } from '@/features/snippets/components/snippet-grid'

type Props = {
  searchParams?: Promise<{
    query?: string
    sort?: string
  }>
}

export const metadata: Metadata = {
  title: 'Library'
}

export default async function Library(props: Props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const sort = searchParams?.sort || 'newest'

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const userId = user.id
  let snippets: Snippet[] = []

  // Dynamic Ordering
  const orderBy =
    sort === 'oldest'
      ? sql`s.created_at ASC`
      : sort === 'alpha'
      ? sql`s.title ASC`
      : sql`s.created_at DESC`

  // Base Logic
  const searchQuery = query ? `%${query}%` : null

  try {
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
        WHERE
          (
            s.user_id = ${userId}
            OR
            s.id IN (SELECT snippet_id FROM favorites WHERE user_id = ${userId})
          )
        AND (
          s.title ILIKE ${searchQuery} OR
          s.language ILIKE ${searchQuery} OR
          s.description ILIKE ${searchQuery}
        )
        ORDER BY ${orderBy}
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
        WHERE
          s.user_id = ${userId}
          OR
          s.id IN (SELECT snippet_id FROM favorites WHERE user_id = ${userId})
        ORDER BY ${orderBy}
      `
    }
  } catch (error) {
    console.error('Database Error:', error)
  }

  return (
    <main className="min-h-screen bg-background">
      <SnippetGrid initialSnippets={snippets} currentUserId={userId} query={query} />
    </main>
  )
}
