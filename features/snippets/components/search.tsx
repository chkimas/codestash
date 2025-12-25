'use client'

import { useState, useEffect, useRef, useTransition, Suspense } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { SearchIcon, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SearchProps {
  placeholder?: string
  className?: string
  redirectUrl?: string
}

function SearchInput({ placeholder = 'Search...', className, redirectUrl }: SearchProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const queryFromUrl = searchParams.get('query')?.toString() || ''
  const [searchTerm, setSearchTerm] = useState(() => queryFromUrl)
  const [debouncedSearch] = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (debouncedSearch === queryFromUrl && !redirectUrl) return

    const params = new URLSearchParams(searchParams.toString())

    if (debouncedSearch.trim()) {
      params.set('query', debouncedSearch.trim())
    } else {
      params.delete('query')
    }

    startTransition(() => {
      if (redirectUrl && debouncedSearch.trim()) {
        router.push(`${redirectUrl}?${params.toString()}`)
      } else {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      }
    })
  }, [debouncedSearch, queryFromUrl, pathname, router, searchParams, redirectUrl])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmdK = (event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)
      if (isCmdK) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-muted/50 pl-9 pr-24 text-sm transition-colors',
            'placeholder:text-muted-foreground',
            'focus-visible:ring-2 focus-visible:ring-primary/20',
            className
          )}
          aria-label="Search snippets"
        />

        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : searchTerm ? (
            <button
              onClick={() => {
                setSearchTerm('')
                inputRef.current?.focus()
              }}
              className="rounded-full p-0.5 hover:bg-muted"
              aria-label="Clear search"
              type="button"
            >
              <div className="h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <X className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
            </button>
          ) : null}

          <div className="hidden items-center gap-1 rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span> K
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Search(props: SearchProps) {
  return (
    <Suspense fallback={<div className="w-full h-10 rounded-md bg-muted/50" />}>
      <SearchInput {...props} />
    </Suspense>
  )
}
