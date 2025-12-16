'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useDebounce } from 'use-debounce'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query')?.toString() || '')
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
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router]
  )

  useEffect(() => {
    handleSearch(debouncedSearch)
  }, [debouncedSearch, handleSearch])

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
    <div className="relative flex w-full items-center">
      <SearchIcon className="absolute left-4 h-4 w-4 text-neutral-400" />
      <Input
        ref={inputRef}
        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-sm outline-none placeholder:text-neutral-400 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute right-4 hidden pointer-events-none select-none items-center gap-1 rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-neutral-500 sm:flex">
        <span>⌘</span>K
      </div>
    </div>
  )
}
