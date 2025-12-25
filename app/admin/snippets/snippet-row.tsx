'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation' // <--- 1. Import Router
import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, Eye, Loader2, Globe, Lock } from 'lucide-react'
import { deleteSnippetAsAdmin } from '../actions' // Ensure path is correct
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

type ProfileData = {
  username: string | null
}

interface AdminSnippet {
  id: string
  title: string
  language: string
  is_public: boolean
  created_at: string
  profiles: ProfileData | ProfileData[] | null
}

export function AdminSnippetRow({ snippet }: { snippet: AdminSnippet }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  // New state to hide the row instantly without waiting for server
  const [isDeleted, setIsDeleted] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm('Are you sure you want to PERMANENTLY delete this snippet? This cannot be undone.')
    ) {
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteSnippetAsAdmin(snippet.id)

      if (result.error) {
        throw new Error(result.error)
      }

      toast.success('Snippet deleted successfully')

      // 2. Optimistic Update: Hide row immediately
      setIsDeleted(true)

      // 3. Background Refresh: Tells Next.js to re-run the server component
      // to get the fresh list (ensures counts/pagination update correctly)
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete snippet')
      setIsDeleting(false)
    }
  }

  // Handle case where profiles might be an array (Supabase quirks) or null
  const username = Array.isArray(snippet.profiles)
    ? snippet.profiles[0]?.username
    : snippet.profiles?.username || 'unknown'

  // If deleted, render nothing (effectively removing it from the table)
  if (isDeleted) return null

  return (
    <TableRow className="animate-in fade-in duration-300">
      <TableCell className="font-medium max-w-[200px] truncate" title={snippet.title}>
        {snippet.title}
      </TableCell>
      <TableCell className="text-muted-foreground">@{username}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="font-mono text-xs">
          {snippet.language}
        </Badge>
      </TableCell>
      <TableCell>
        {snippet.is_public ? (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 px-1.5">
              Public
            </Badge>
            <Globe className="h-3 w-3 text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="px-1.5">
              Private
            </Badge>
            <Lock className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(snippet.created_at), { addSuffix: true })}
      </TableCell>
      <TableCell className="text-right space-x-2">
        <Button variant="ghost" size="sm" asChild>
          {/* Link to the public view of the snippet */}
          <Link href={`/library/${snippet.id}`} target="_blank">
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">Delete</span>
        </Button>
      </TableCell>
    </TableRow>
  )
}
