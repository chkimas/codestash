import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Snippet, LanguageValue } from '@/lib/definitions'
import { Metadata } from 'next'
import { SnippetGrid } from '@/features/snippets/components/snippet-grid'

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
  let mySnippets: Snippet[] = []
  let favoritedSnippets: Snippet[] = []

  try {
    // 1. FETCH MY SNIPPETS (Existing Logic)
    let queryBuilder = supabase
      .from('snippets')
      .select(`
        *,
        users!user_id (name, image, username),
        favorites!left (user_id)
      `)
      .eq('user_id', userId)

    if (query) {
      queryBuilder = queryBuilder.or(
        `title.ilike.%${query}%,language.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    const { data: myData, error: myError } = await queryBuilder
      .order(sort === 'alpha' ? 'title' : 'created_at', {
        ascending: sort === 'oldest' || sort === 'alpha'
      })
      .returns<SnippetRow[]>()

    if (myError) console.error('My Snippets Error:', myError.message)

    if (myData) {
      mySnippets = myData.map((item) => transformToSnippet(item, userId))
    }

    // 2. FETCH FAVORITED SNIPPETS (New Logic)
    // We only fetch favorites if there is no search query, or you can implement search for favs too.
    if (!query) {
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select(`
          snippet:snippets (
            *,
            users!user_id (name, image, username),
            favorites!left (user_id)
          )
        `)
        .eq('user_id', userId)
        .returns<{ snippet: SnippetRow }[]>()

      if (favError) console.error('Favorites Error:', favError.message)

      if (favData) {
        // Filter out nulls (in case a favorited snippet was deleted)
        // and map them using the same transform function
        favoritedSnippets = favData
          .filter((f) => f.snippet !== null)
          .map((f) => transformToSnippet(f.snippet, userId))
      }
    }

  } catch (error) {
    console.error('Server Error:', error)
  }

  return (
    <main className="min-h-screen bg-background">
      <SnippetGrid
        initialSnippets={mySnippets}
        favoritedSnippets={favoritedSnippets} // <--- Pass new prop
        currentUserId={userId}
        query={query}
      />
    </main>
  )
}

// Helper to keep code clean
function transformToSnippet(item: SnippetRow, currentUserId: string): Snippet {
  return {
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
    is_favorited: item.favorites.some((f) => f.user_id === currentUserId),
    favorite_count: item.favorites.filter((f) => f.user_id !== currentUserId).length
  }
}
