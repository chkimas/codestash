// app/admin/announcements/announcement-row.tsx (Supabase exact types)
'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'
import { toggleAnnouncement, deleteAnnouncement } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useState } from 'react'
import type { Database } from '@/types/supabase'

type Announcement = Database['public']['Tables']['announcements']['Row']

export function AnnouncementRow({ item }: { item: Announcement }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleAnnouncement(item.id, Boolean(!item.is_active))
      toast.success(item.is_active ? 'Announcement deactivated' : 'Announcement activated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(item.id)
      toast.success('Deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    }
  }

  const getBadgeVariant = (
    type: string | null
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'warning':
        return 'secondary'
      case 'destructive':
        return 'destructive'
      case 'success':
        return 'outline'
      default:
        return 'default'
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{item.message}</TableCell>
      <TableCell>
        <Badge variant={getBadgeVariant(item.type)}>{item.type ?? 'info'}</Badge>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          disabled={loading}
          className={
            item.is_active ? 'text-green-600 hover:text-green-700' : 'text-muted-foreground'
          }
        >
          {item.is_active ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" /> Active
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 mr-2" /> Inactive
            </>
          )}
        </Button>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
