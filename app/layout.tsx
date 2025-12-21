import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Metadata } from 'next'
import './globals.css'
import 'devicon/devicon.min.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://codestash-three.vercel.app/'),
  title: {
    default: 'CodeStash | The Open Code Registry',
    template: '%s | CodeStash'
  },
  description:
    'Save, organize, and share your code snippets. A free, open-source knowledge base for developers.',
  keywords: ['code snippets', 'developer tools', 'gist alternative', 'code library', 'programming'],
  authors: [{ name: 'CodeStash Community' }],
  creator: 'CodeStash',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://codestash-three.vercel.app/',
    siteName: 'CodeStash',
    title: 'CodeStash | The Open Code Registry',
    description: 'Save, organize, and share your code snippets.',
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
    title: 'CodeStash',
    description: 'Save, organize, and share your code snippets.',
    creator: '@yourtwitterhandle'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
