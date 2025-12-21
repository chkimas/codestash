import { MetadataRoute } from 'next'
import sql from '@/db/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://codestash-three.vercel.app/'

  const routes = ['', '/login', '/register'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1
  }))

  const snippets = await sql`
    SELECT id, updated_at 
    FROM snippets 
    WHERE is_public = true 
    ORDER BY created_at DESC 
    LIMIT 5000
  `

  const snippetUrls = snippets.map((snippet) => ({
    url: `${baseUrl}/library/${snippet.id}`,
    lastModified: new Date(snippet.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  return [...routes, ...snippetUrls]
}
