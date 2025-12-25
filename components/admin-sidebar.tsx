'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Users, FileCode, Megaphone } from 'lucide-react'
import { cn } from '@/lib/utils'

const sidebarLinks = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/snippets', label: 'Snippets', icon: FileCode },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r bg-background hidden md:block p-4 space-y-2">
      {sidebarLinks.map((link) => {
        const isActive = pathname === link.href

        return (
          <Button
            key={link.href}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn('w-full justify-start', isActive && 'bg-muted font-medium text-primary')}
            asChild
          >
            <Link href={link.href}>
              <link.icon className={cn('mr-2 h-4 w-4', isActive && 'text-primary')} />
              {link.label}
            </Link>
          </Button>
        )
      })}
    </aside>
  )
}
