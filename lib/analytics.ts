import { createClient } from '@/lib/supabase/server'

export async function trackSearch(query: string) {
  const term = query.trim().toLowerCase()

  if (!term) return

  const supabase = await createClient()

  try {
    // Get current count
    const { data: existing } = await supabase
      .from('search_stats')
      .select('count')
      .eq('term', term)
      .single()

    const newCount = (existing?.count || 0) + 1

    // Upsert with new count
    const { error } = await supabase.from('search_stats').upsert(
      {
        term,
        count: newCount,
        last_searched_at: new Date().toISOString()
      },
      {
        onConflict: 'term'
      }
    )

    if (error) throw error
  } catch (error) {
    console.error('Failed to track search:', error)
  }
}

export async function getTrendingSearches() {
  const supabase = await createClient()

  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from('search_stats')
      .select('term')
      .gte('last_searched_at', thirtyDaysAgo.toISOString())
      .order('count', { ascending: false })
      .limit(3)

    if (error) throw error

    return data?.map((r) => r.term) || []
  } catch (error) {
    console.error('Failed to get trending searches:', error)
    return []
  }
}
