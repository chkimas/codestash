import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Code2, LogOut, Settings, LibraryBig, Plus, User } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { ModeToggle } from '@/components/ui/theme-toggle'

export async function MainNav() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name || user?.email || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url || ''
  // 1. Get the username from metadata (fallback to ID if missing)
  const username = user?.user_metadata?.username || user?.id

  const initials = name
    .split(' ')
    .map((part: string) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-6 max-w-[1600px]">
        <div className="flex items-center">
          <Link
            href="/"
            className="group flex items-center justify-center transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-foreground transition-colors">
              <Code2 className="h-4 w-4" />
            </div>
          </Link>

          <span className="mx-3 text-muted-foreground/30 font-light select-none">/</span>

          <ModeToggle />

          <nav className="flex items-center ml-4">
            {user ? (
              <Link
                href="/library"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors px-2 hover:text-foreground py-1 rounded-md"
              >
                <LibraryBig className="h-4 w-4" />
                <span>Library</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="hidden sm:flex h-8 gap-1.5 bg-card text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 font-medium px-3 shadow-sm"
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
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    {/* 2. Update Link to use username */}
                    <Link
                      href={`/u/${username}`}
                      className="flex flex-col space-y-1 cursor-pointer group"
                    >
                      <p className="text-sm font-medium leading-none text-foreground group-hover:text-primary transition-colors">
                        {name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </Link>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      {/* 3. Update Profile Link to use username */}
                      <Link href={`/u/${username}`} className="cursor-pointer">
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
