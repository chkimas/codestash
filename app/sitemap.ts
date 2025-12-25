import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://codestash-three.vercel.app/'

  const routes = ['', '/login', '/register'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1
  }))

  const supabase = await createClient()

  const { data: snippets, error } = await supabase
    .from('snippets')
    .select('id, updated_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) {
    console.error('Sitemap error:', error)
    return routes
  }

  const snippetUrls = (snippets || []).map((snippet) => ({
    url: `${baseUrl}/library/${snippet.id}`,
    lastModified: new Date(snippet.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  return [...routes, ...snippetUrls]
}
