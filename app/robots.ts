import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/library/create', '/library/edit', '/settings']
    },
    sitemap: 'https://codestash-three.vercel.app/sitemap.xml'
  }
}
