import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://codestash-three.vercel.app/'

  const routes = ['', '/login', '/register'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1
  }))

  const supabase = await createAdminClient()

  const { data: snippets = [] } = await supabase
    .from('snippets')
    .select('id, updated_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(5000)

  const snippetUrls = (snippets ?? [])
    .filter(
      (
        snippet
      ): snippet is Database['public']['Tables']['snippets']['Row'] & { updated_at: string } =>
        Boolean(snippet?.updated_at)
    )
    .map((snippet) => ({
      url: `${baseUrl}/library/${snippet.id}`,
      lastModified: new Date(snippet.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8
    }))

  return [...routes, ...snippetUrls]
}
