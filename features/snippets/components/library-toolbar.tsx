'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu'
import { Filter, CheckSquare, X, Trash2 } from 'lucide-react'
import Search from '@/features/snippets/components/search'

interface LibraryToolbarProps {
  onToggleSelect: () => void
  isSelectMode: boolean
  selectedCount: number
  onDelete: () => void
  isDeleting: boolean
}

export function LibraryToolbar({
  onToggleSelect,
  isSelectMode,
  selectedCount,
  onDelete,
  isDeleting
}: LibraryToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', sort)
    router.replace(`/library?${params.toString()}`)
  }

  const currentSort = searchParams.get('sort') || 'newest'

  return (
    <div className="sticky top-14 z-20 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 max-w-[1600px] h-14 flex items-center justify-between gap-3 md:gap-4">
        {isSelectMode ? (
          // SELECT MODE (Active)
          <div className="flex items-center gap-2 md:gap-4 flex-1 animate-in slide-in-from-left-2">
            <Button variant="ghost" size="sm" onClick={onToggleSelect} className="px-2 md:px-3">
              <X className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cancel</span>
            </Button>

            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              {selectedCount} <span className="hidden sm:inline">selected</span>
            </span>

            <div className="flex-1" />

            {selectedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
                className="px-2 md:px-3"
              >
                <Trash2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </Button>
            )}
          </div>
        ) : (
          // NORMAL MODE
          <>
            <div className="flex-1 max-w-md min-w-0">
              <Search placeholder="Search..." className="h-9" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant={isSelectMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={onToggleSelect}
                className="text-muted-foreground hover:text-foreground px-2 md:px-3"
              >
                <CheckSquare className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Select</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2 px-2 md:px-3">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={currentSort} onValueChange={handleSort}>
                    <DropdownMenuRadioItem value="newest">Newest First</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">Oldest First</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="alpha">A-Z</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
