import { createAdminClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UserActionsCell } from './ban-user-form' // <--- Correct Import

export default async function AdminUsersPage() {
  const supabase = await createAdminClient()

  // Select fields
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Users Directory</h1>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Avatar</TableHead>
              <TableHead>User Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => {
              const isTempBanned = user.banned_until && new Date(user.banned_until) > new Date()
              const isBanned = user.is_banned || isTempBanned

              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image} />
                      <AvatarFallback>{user.name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{user.last_ip || 'No Record'}</TableCell>
                  <TableCell>
                    {isBanned ? (
                      <Badge variant="destructive">
                        {user.is_banned ? 'Perma-Banned' : 'Suspended'}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200 bg-green-50"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActionsCell user={user} />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
