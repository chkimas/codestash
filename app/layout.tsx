import { Suspense } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Metadata, Viewport } from 'next'
import './globals.css'
import 'devicon/devicon.min.css'
import { Toaster } from '@/components/ui/sonner'
import { AuthToaster } from '@/components/auth-toaster'
import { SEO } from '@/lib/constants'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap'
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap'
})

export const viewport: Viewport = {
  themeColor: SEO.THEME_COLOR,
  width: 'device-width',
  initialScale: 1
}

export const metadata: Metadata = {
  metadataBase: new URL('https://codestash-three.vercel.app/'),
  title: {
    default: SEO.DEFAULT_TITLE,
    template: `%s | ${SEO.SITE_NAME}`
  },
  description: SEO.DEFAULT_DESCRIPTION,
  keywords: ['code snippets', 'developer tools', 'gist alternative', 'code library', 'programming'],
  authors: [{ name: 'Christian Kim P. Asilo' }],
  creator: 'Christian Kim P. Asilo',
  publisher: 'CodeStash',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://codestash-three.vercel.app/',
    siteName: SEO.SITE_NAME,
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CodeStash Preview'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO.DEFAULT_TITLE,
    description: SEO.DEFAULT_DESCRIPTION,
    creator: SEO.TWITTER_HANDLE,
    site: SEO.TWITTER_HANDLE
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: SEO.THEME_COLOR
      }
    ]
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://*.supabase.co" />
        <link rel="canonical" href="https://codestash-three.vercel.app/" />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="codestash-theme"
        >
          <main id="main-content" tabIndex={-1} className="min-h-screen">
            {children}
          </main>

          <Suspense fallback={null}>
            <AuthToaster />
          </Suspense>
          <Toaster position="top-right" duration={4000} expand={true} richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
