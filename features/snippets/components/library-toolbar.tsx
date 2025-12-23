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
import Search from '@/features/snippets/components/search' // Import your component

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
      <div className="container mx-auto px-6 max-w-[1600px] h-14 flex items-center justify-between gap-4">
        {isSelectMode ? (
          <div className="flex items-center gap-4 flex-1 animate-in slide-in-from-left-2">
            <Button variant="ghost" size="sm" onClick={onToggleSelect}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <span className="text-sm font-medium text-muted-foreground">
              {selectedCount} selected
            </span>
            <div className="flex-1" />
            {selectedCount > 0 && (
              <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 max-w-md">
              {/* Using your component with h-9 to fit the toolbar */}
              <Search placeholder="Search snippets..." className="h-9" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isSelectMode ? 'secondary' : 'ghost'}
                size="sm"
                onClick={onToggleSelect}
                className="text-muted-foreground hover:text-foreground"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                Select
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
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
