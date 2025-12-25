import { createClient } from '@/lib/supabase/server'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export async function GlobalAnnouncement() {
  const supabase = await createClient()

  const { data: announcement } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .maybeSingle()

  if (!announcement) return null

  // Determine styles based on type
  let bgClass = 'bg-blue-600'
  let icon = <Info className="h-4 w-4" />

  switch (announcement.type) {
    case 'warning':
      bgClass = 'bg-yellow-500 text-black'
      icon = <AlertCircle className="h-4 w-4" />
      break
    case 'destructive':
      bgClass = 'bg-red-600'
      icon = <XCircle className="h-4 w-4" />
      break
    case 'success':
      bgClass = 'bg-emerald-600'
      icon = <CheckCircle2 className="h-4 w-4" />
      break
    default:
      break
  }

  return (
    <div
      className={cn(
        'w-full px-4 py-2 text-sm font-medium text-white flex items-center justify-center gap-2',
        bgClass
      )}
    >
      {icon}
      <span>{announcement.message}</span>
    </div>
  )
}
