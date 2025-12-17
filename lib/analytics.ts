import sql from '@/db/client'

export async function trackSearch(query: string) {
  const term = query.trim().toLowerCase()

  try {
    await sql`
      INSERT INTO search_stats (term, count, last_searched_at)
      VALUES (${term}, 1, NOW())
      ON CONFLICT (term) 
      DO UPDATE SET 
        count = search_stats.count + 1,
        last_searched_at = NOW()
    `
  } catch (error) {
    console.error('Failed to track search:', error)
  }
}

export async function getTrendingSearches() {
  const results = await sql`
    SELECT term 
    FROM search_stats 
    WHERE last_searched_at > NOW() - INTERVAL '30 days'
    ORDER BY count DESC 
    LIMIT 3
  `
  return results.map((r) => r.term)
}
