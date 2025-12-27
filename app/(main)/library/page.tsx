import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Database } from '@/types/supabase'
import { Snippet, LanguageValue } from '@/lib/definitions'
import { SnippetGrid } from '@/features/snippets/components/snippet-grid'
import { Metadata } from 'next'

// Precise Supabase join types
type SnippetWithUsersAndFavorites = Database['public']['Tables']['snippets']['Row'] & {
  users: Pick<Database['public']['Tables']['users']['Row'], 'name' | 'image' | 'username'> | null
  favorites: Array<{ user_id: string }>
}

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

  if (!user) redirect('/login')

  const userId = user.id
  let mySnippetsRaw: SnippetWithUsersAndFavorites[] = []
  let favoritedSnippetsRaw: SnippetWithUsersAndFavorites[] = []

  try {
    // My snippets
    let queryBuilder = supabase
      .from('snippets')
      .select(
        `
        *,
        users!user_id (name, image, username),
        favorites!left (user_id)
      `
      )
      .eq('user_id', userId)

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,language.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    const { data: myData } = await queryBuilder.order(sort === 'alpha' ? 'title' : 'created_at', {
      ascending: sort === 'oldest' || sort === 'alpha'
    })

    mySnippetsRaw = (myData as SnippetWithUsersAndFavorites[]) || []

    // Favorites
    if (!query) {
      const { data: favData } = await supabase
        .from('favorites')
        .select(
          `
          snippet:snippets!inner (
            *,
            users!user_id (name, image, username),
            favorites!left (user_id)
          )
        `
        )
        .eq('user_id', userId)

      favoritedSnippetsRaw = (
        (favData as Array<{ snippet: SnippetWithUsersAndFavorites | null }>) || []
      )
        .map((f) => f.snippet)
        .filter(Boolean) as SnippetWithUsersAndFavorites[]
    }
  } catch (error) {
    console.error('Server Error:', error)
  }

  const mySnippets: Snippet[] = mySnippetsRaw.map((item) => ({
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

  const favoritedSnippets: Snippet[] = favoritedSnippetsRaw.map((item) => ({
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
    is_favorited: true,
    favorite_count: item.favorites?.length || 0
  }))

  return (
    <main className="min-h-screen bg-background">
      <SnippetGrid
        initialSnippets={mySnippets}
        favoritedSnippets={favoritedSnippets}
        currentUserId={userId}
        query={query}
      />
    </main>
  )
}
