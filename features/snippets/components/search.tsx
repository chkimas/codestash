'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function Search({
  placeholder,
  className
}: {
  placeholder: string
  className?: string
}) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const queryParam = searchParams.get('query')?.toString() || ''
  const [searchTerm, setSearchTerm] = useState(queryParam)
  const [debouncedSearch] = useDebounce(searchTerm, 300)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams)
      if (term) {
        params.set('query', term)
      } else {
        params.delete('query')
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  useEffect(() => {
    if (debouncedSearch !== queryParam) {
      handleSearch(debouncedSearch)
    }
  }, [debouncedSearch, handleSearch, queryParam])

  useEffect(() => {
    if (queryParam === '' && searchTerm !== '') {
      const timeoutId = setTimeout(() => {
        setSearchTerm('')
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [queryParam, searchTerm])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCmdOrCtrlK =
        (event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)

      if (!isCmdOrCtrlK) return

      const target = event.target as HTMLElement | null
      if (target) {
        const tag = target.tagName.toLowerCase()
        if (tag === 'input' || tag === 'textarea' || target.isContentEditable) return
      }

      event.preventDefault()
      inputRef.current?.focus()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className={cn('relative flex w-full items-center', className)}>
      <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        ref={inputRef}
        className={cn(
          'w-full bg-muted/50 pl-9 pr-12 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0',
          className
        )}
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute right-3 hidden pointer-events-none select-none items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
        <span>⌘</span>K
      </div>
    </div>
  )
}
