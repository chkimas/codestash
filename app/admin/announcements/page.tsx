// app/admin/announcements/page.tsx (Final fix - explicit non-null assertion)
import { createAdminClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { createAnnouncement } from '@/app/admin/actions'
import { AnnouncementRow } from './announcement-row'
import { Megaphone } from 'lucide-react'

export default async function AnnouncementsPage() {
  const supabase = await createAdminClient()
  const { data: announcements = [] } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2">
          <Megaphone className="h-4 w-4" /> New Announcement
        </h2>

        <form action={createAnnouncement} className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Input
              name="message"
              placeholder="e.g. Scheduled maintenance tonight at 10 PM UTC"
              required
            />
          </div>
          <div className="w-[150px] space-y-2">
            <Select name="type" defaultValue="info">
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info (Blue)</SelectItem>
                <SelectItem value="warning">Warning (Yellow)</SelectItem>
                <SelectItem value="destructive">Urgent (Red)</SelectItem>
                <SelectItem value="success">Success (Green)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Create</Button>
        </form>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Message</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(announcements ?? []).map((item) => (
              <AnnouncementRow key={item.id} item={item} />
            ))}
            {(announcements ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                  No announcements found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
