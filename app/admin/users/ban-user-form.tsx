// app/admin/users/ban-user-form.tsx (Type fixed)
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, ShieldAlert, Gavel } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateUserBan, type BanDuration } from '../actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Database } from '@/types/supabase'

type AdminUser = Database['public']['Tables']['users']['Row']

export function UserActionsCell({ user }: { user: AdminUser }) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState<BanDuration>('24h')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleBan = async () => {
    setLoading(true)
    try {
      await updateUserBan(user.id, duration)
      toast.success('User status updated')
      setOpen(false)
      router.refresh()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const handleUnban = async () => {
    try {
      await updateUserBan(user.id, 'off')
      toast.success('User unbanned')
      router.refresh()
    } catch {
      toast.error('Error unbanning user')
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            <Gavel className="h-4 w-4" />
            {user.is_banned || user.banned_until ? 'Update Ban' : 'Ban User'}
          </DropdownMenuItem>

          {(user.is_banned || user.banned_until) && (
            <DropdownMenuItem
              onSelect={handleUnban}
              className="text-green-600 focus:text-green-600"
            >
              <ShieldAlert className="mr-2 h-4 w-4" /> Lift Ban
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Select how long <strong>{user.username}</strong> should be suspended.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Duration</label>
              <Select value={duration} onValueChange={(v) => setDuration(v as BanDuration)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 Hour (Cool down)</SelectItem>
                  <SelectItem value="24h">24 Hours (Standard)</SelectItem>
                  <SelectItem value="7d">7 Days (Serious)</SelectItem>
                  <SelectItem value="30d">30 Days (Very Serious)</SelectItem>
                  <SelectItem value="permanent" className="text-destructive font-bold">
                    Permanent Ban
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBan} disabled={loading}>
              {loading ? 'Applying...' : 'Confirm Suspension'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
