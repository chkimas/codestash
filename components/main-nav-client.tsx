'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Code2, LogOut, Settings, LibraryBig, Plus, User, Menu, Compass } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { ModeToggle } from '@/components/ui/theme-toggle'
import { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
  username: string | null
  name: string | null
  image: string | null
  email: string | null
}

interface MainNavClientProps {
  user: SupabaseUser | null
  profile: Profile | null
}

export function MainNavClient({ user, profile }: MainNavClientProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // HELPER: Check if a link is active
  // We use startsWith for sub-pages (e.g. /library/create should keep Library active)
  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname?.startsWith(path)
  }

  // Common Class for Nav Links (Desktop)
  const getNavLinkClass = (path: string) =>
    cn(
      'flex items-center gap-1.5 text-sm font-medium transition-colors px-3 py-2 rounded-md',
      isActive(path)
        ? 'bg-accent text-accent-foreground' // Active State
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50' // Inactive State
    )

  // Common Class for Mobile Links
  const getMobileLinkClass = (path: string) =>
    cn(
      'flex items-center gap-3 px-2 py-2 text-sm font-medium rounded-md transition-colors',
      isActive(path)
        ? 'bg-accent text-accent-foreground'
        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
    )

  const isHome = pathname === '/'
  const isTransparent = isHome && !isScrolled

  const displayName = profile?.name || user?.email || 'User'
  const email = profile?.email || user?.email || ''
  const avatarUrl = profile?.image || user?.user_metadata?.avatar_url || ''
  const username = profile?.username || user?.user_metadata?.username || user?.id
  const profileLink = `/u/${username}`

  const initials = displayName
    ?.toString()
    .split(' ')
    .slice(0, 2)
    .map((part: string) => part[0])
    .join('')
    .toUpperCase()

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300 ease-in-out',
        isTransparent
          ? 'border-transparent bg-transparent'
          : 'border-border/40 bg-background/80 backdrop-blur-md'
      )}
    >
      <div className="container flex h-14 items-center justify-between px-4 md:px-6 max-w-[1600px]">
        <div className="flex items-center gap-4">
          {/* MOBILE MENU */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Code2 className="h-4 w-4" />
                    </div>
                    <span className="font-bold">CodeStash</span>
                  </SheetTitle>
                  <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-2 mt-6">
                  {user ? (
                    <>
                      <Link
                        href="/explore"
                        onClick={() => setMobileMenuOpen(false)}
                        className={getMobileLinkClass('/explore')}
                      >
                        <Compass className="h-4 w-4" />
                        Explore
                      </Link>
                      <Link
                        href="/library"
                        onClick={() => setMobileMenuOpen(false)}
                        className={getMobileLinkClass('/library')}
                      >
                        <LibraryBig className="h-4 w-4" />
                        Library
                      </Link>
                      <Link
                        href="/library/create"
                        onClick={() => setMobileMenuOpen(false)}
                        className={getMobileLinkClass('/library/create')}
                      >
                        <Plus className="h-4 w-4" />
                        New Snippet
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className={getMobileLinkClass('/settings')}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/explore"
                        onClick={() => setMobileMenuOpen(false)}
                        className={getMobileLinkClass('/explore')}
                      >
                        <Compass className="h-4 w-4" />
                        Explore
                      </Link>

                      {/* Guest Mobile Auth Buttons */}
                      <div className="my-2 border-t border-border/50" />

                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className={getMobileLinkClass('/login')}
                      >
                        Log in
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(getMobileLinkClass('/register'), 'text-primary')}
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* DESKTOP LOGO (Hidden on mobile) */}
          <Link
            href="/"
            className="group hidden md:flex items-center justify-center transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors">
              <Code2 className="h-5 w-5 md:h-4 md:w-4" />
            </div>
          </Link>

          <span className="mx-1 text-muted-foreground/30 font-light select-none hidden md:inline">
            /
          </span>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href="/explore" className={getNavLinkClass('/explore')}>
                  <Compass className="h-4 w-4" />
                  <span>Explore</span>
                </Link>
                <Link href="/library" className={getNavLinkClass('/library')}>
                  <LibraryBig className="h-4 w-4" />
                  <span>Library</span>
                </Link>
              </>
            ) : (
              <>
                <Link href="/explore" className={getNavLinkClass('/explore')}>
                  <Compass className="h-4 w-4" />
                  <span>Explore</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ModeToggle />

          {user ? (
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="hidden md:flex h-8 gap-1.5 bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 font-medium px-3 shadow-sm"
              >
                <Link href="/library/create">
                  <Plus className="h-3.5 w-3.5" />
                  <span className="text-xs">New Snippet</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 ml-1"
                  >
                    <Avatar className="h-8 w-8 border border-border/50 transition-opacity hover:opacity-90">
                      <AvatarImage src={avatarUrl || ''} alt={displayName} />
                      <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <Link
                      href={profileLink}
                      className="flex flex-col space-y-1 cursor-pointer group"
                    >
                      <p className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">
                        {displayName}
                      </p>
                      {email && email !== displayName && (
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {email}
                        </p>
                      )}
                    </Link>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href={profileLink} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Your Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/library" className="cursor-pointer">
                        <LibraryBig className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Library</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-foreground">
                    <form action={logout} className="w-full">
                      <button type="submit" className="flex w-full items-center cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground h-8 font-medium"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-none h-8 font-medium"
              >
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
