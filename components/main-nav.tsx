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
import { Code2, LogOut, Settings, LibraryBig, Plus } from 'lucide-react'
import { logout } from '@/features/auth/actions'
import { ModeToggle } from '@/components/ui/theme-toggle'

export async function MainNav() {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name || user?.email || 'User'
  const avatarUrl = user?.user_metadata?.avatar_url || ''

  const initials = name
    .split(' ')
    .map((part: string) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-md supports-backdrop-filter:bg-white/60">
      <div className="container flex h-14 items-center justify-between px-6 max-w-[1600px]">
        <div className="flex items-center">
          <Link
            href="/"
            className="group flex items-center justify-center transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-900 transition-colors">
              <Code2 className="h-4 w-4" />
            </div>
          </Link>

          <span className="mx-3 text-neutral-300 font-light select-none">/</span>

          <ModeToggle />
          <nav className="flex items-center">
            {user ? (
              <Link
                href="/library"
                className="flex items-center gap-1 text-sm font-medium text-neutral-600 transition-colors px-2 hover:text-neutral-900 py-1 rounded-md"
              >
                <LibraryBig className="h-4 w-4" />
                <span>Library</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
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
                className="hidden sm:flex h-8 gap-1.5 bg-white text-neutral-700 hover:text-neutral-900 hover:bg-transparent font-medium px-3"
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
                    <Avatar className="h-8 w-8 border border-neutral-200 transition-opacity hover:opacity-90">
                      <AvatarImage src={avatarUrl} alt={name} />
                      <AvatarFallback className="text-[10px] font-medium bg-neutral-50 text-neutral-600">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <Link href={`/u/${user.id}`} className="flex flex-col space-y-1 cursor-pointer group">
                      <p className="text-sm font-medium leading-none text-neutral-900 group-hover:text-gray-400 transition-colors">
                        {name}
                      </p>
                      <p className="text-xs leading-none text-neutral-500 truncate">
                        {user?.email}
                      </p>
                    </Link>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/library" className="cursor-pointer">
                        <LibraryBig className="h-4 w-4 text-neutral-500" />
                        <span>Library</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <Settings className="h-4 w-4 text-neutral-500" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="text-neutral-800">
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
                className="text-neutral-600 hover:text-neutral-900 h-8 font-medium"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-neutral-900 text-white hover:bg-neutral-800 shadow-none h-8 font-medium"
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
