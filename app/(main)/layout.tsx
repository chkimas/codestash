import { MainNav } from '@/components/main-nav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MainNav /> {/* Navbar only on main app pages */}
      {children}
    </>
  )
}
