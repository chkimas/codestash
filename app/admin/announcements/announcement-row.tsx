'use client'

import { TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash2, CheckCircle2, Circle } from 'lucide-react'
import { toggleAnnouncement, deleteAnnouncement } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useState } from 'react'

interface Announcement {
  id: string
  message: string
  type: string
  is_active: boolean
  created_at: string
}

export function AnnouncementRow({ item }: { item: Announcement }) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      await toggleAnnouncement(item.id, !item.is_active)
      toast.success(item.is_active ? 'Announcement deactivated' : 'Announcement activated')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(item.id)
      toast.success('Deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  // FIX: Explicitly define the return type
  const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch(type) {
      case 'warning': return 'secondary'
      case 'destructive': return 'destructive'
      case 'success': return 'outline'
      default: return 'default'
    }
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{item.message}</TableCell>
      <TableCell>
        {/* FIX: Removed 'as any' now that the function is typed */}
        <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
      </TableCell>
      <TableCell>
         <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            className={item.is_active ? "text-green-600 hover:text-green-700" : "text-muted-foreground"}
         >
            {item.is_active ? (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Active</>
            ) : (
                <><Circle className="h-4 w-4 mr-2" /> Inactive</>
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
