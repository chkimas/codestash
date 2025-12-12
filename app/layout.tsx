import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import 'devicon/devicon.min.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
