'use client'

import { useState } from 'react'
import { Snippet } from '@/lib/definitions'
import { SnippetCard } from './snippet-card'
import { LibraryToolbar } from './library-toolbar'
import { CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteSnippets } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, SearchX, Code2 } from 'lucide-react'

interface SnippetGridProps {
  initialSnippets: Snippet[]
  currentUserId: string
  query?: string
}

export function SnippetGrid({ initialSnippets, currentUserId, query }: SnippetGridProps) {
  const router = useRouter()
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return

    setIsDeleting(true)
    const idsToDelete = Array.from(selectedIds)

    const result = await deleteSnippets(idsToDelete)

    setIsDeleting(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Deleted ${idsToDelete.length} snippets`)
      setSelectedIds(new Set())
      setIsSelectMode(false)
      router.refresh()
    }
  }

  if (initialSnippets.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
         <LibraryToolbar
            onToggleSelect={() => setIsSelectMode(!isSelectMode)}
            isSelectMode={isSelectMode}
            selectedCount={selectedIds.size}
            onDelete={handleBatchDelete}
            isDeleting={isDeleting}
          />
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center min-h-[50vh] border-2 border-dashed border-border rounded-2xl bg-muted/20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-sm border border-border mb-6">
              {query ? (
                <SearchX className="h-7 w-7 text-muted-foreground" />
              ) : (
                <Code2 className="h-7 w-7 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {query ? 'No matching snippets' : 'Library is empty'}
            </h2>
            <p className="text-muted-foreground max-w-md text-center mt-2 mb-8 leading-relaxed">
              {query
                ? `We couldn't find any snippets matching "${query}".`
                : 'Your personal knowledge base starts here.'}
            </p>
            {!query ? (
              <Button asChild size="lg" className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Link href="/library/create"><Plus className="h-4 w-4 mr-2" />Create First Snippet</Link>
              </Button>
            ) : (
              <Button variant="outline" asChild><Link href="/library">Clear Search</Link></Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <LibraryToolbar
        onToggleSelect={() => {
          setIsSelectMode(!isSelectMode)
          setSelectedIds(new Set())
        }}
        isSelectMode={isSelectMode}
        selectedCount={selectedIds.size}
        onDelete={handleBatchDelete}
        isDeleting={isDeleting}
      />

      <section className="container mx-auto px-6 py-8 max-w-[1600px] pb-32">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {initialSnippets.map((snippet) => (
            <div key={snippet.id} className="relative group">
              {isSelectMode && (
                <div
                  onClick={() => toggleSelection(snippet.id)}
                  className={cn(
                    "absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] cursor-pointer rounded-xl border-2 transition-all flex items-center justify-center",
                    selectedIds.has(snippet.id) ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-3 right-3 transition-transform",
                    selectedIds.has(snippet.id) ? "scale-100" : "scale-90"
                  )}>
                    {selectedIds.has(snippet.id) ? (
                      <CheckCircle2 className="h-6 w-6 text-primary fill-primary/20" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
              )}
              <SnippetCard snippet={snippet} currentUserId={currentUserId} />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
