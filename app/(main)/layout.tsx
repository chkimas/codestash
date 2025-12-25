import { MainNav } from '@/components/main-nav'
import { GlobalAnnouncement } from '@/components/global-announcement'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <GlobalAnnouncement />
      <MainNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
