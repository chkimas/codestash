'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Copy, Check, Heart, FileCode2 } from 'lucide-react'
import { Snippet } from '@/lib/definitions'
import { getLanguageIcon } from '@/components/icons'
import { toggleFavorite } from '@/features/snippets/actions'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vs } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SnippetCardProps {
  snippet: Snippet
  currentUserId?: string | null
  onDelete?: (id: string) => void
}

export function SnippetCard({ snippet, currentUserId }: SnippetCardProps) {
  const router = useRouter()
  const [isCopied, setIsCopied] = useState(false)
  const [isFavorited, setIsFavorited] = useState(snippet.is_favorited || false)
  const [favCount, setFavCount] = useState(Number(snippet.favorite_count || 0))
  const isModified = snippet.updated_at && snippet.updated_at !== snippet.created_at
  const displayDate = isModified ? snippet.updated_at : snippet.created_at
  const displayLabel = isModified ? 'Modified' : ''

  const isOwner = currentUserId === snippet.user_id

  const handleCardClick = () => {
    router.push(`/library/${snippet.id}`)
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(snippet.code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1800)
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUserId) {
      router.push('/login')
      return
    }

    const next = !isFavorited
    setIsFavorited(next)
    setFavCount((prev) => (next ? prev + 1 : Math.max(prev - 1, 0)))

    await toggleFavorite(snippet.id)
  }

  const normalizeLanguage = (lang: string) => {
    const lower = lang.toLowerCase()
    if (lower === 'vuejs' || lower === 'vue') return 'html'
    if (lower === 'c++') return 'cpp'
    if (lower === 'c#') return 'csharp'
    return lower
  }

  return (
    <Card
      onClick={handleCardClick}
      className="group relative flex cursor-pointer flex-col justify-between overflow-hidden
               border border-neutral-200 bg-white/90 transition-all duration-200
               hover:-translate-y-[1px] hover:border-neutral-300 hover:shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
    >
      <CardHeader className="px-3 py-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-neutral-100/80 text-neutral-500">
              {getLanguageIcon(snippet.language) || <FileCode2 className="h-3.5 w-3.5" />}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <TooltipProvider>
                <Tooltip delayDuration={250}>
                  <TooltipTrigger asChild>
                    <h3 className="truncate pr-1.5 text-[13px] font-semibold leading-tight tracking-tight text-neutral-950">
                      {snippet.title}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs break-words text-xs">
                    <p>{snippet.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                <div className="flex items-center gap-1 min-w-0">
                  <Avatar className="h-4 w-4 border border-neutral-100">
                    <AvatarImage src={snippet.author_image || undefined} />
                    <AvatarFallback className="bg-neutral-100 text-[8px] font-bold text-neutral-600">
                      {snippet.author_name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium hover:text-neutral-700 transition-colors">
                    {snippet.author_name || 'Anonymous'}
                  </span>
                </div>
                <span className="text-neutral-300">·</span>
                <span
                  className="shrink-0 text-neutral-400"
                  title={new Date(displayDate).toLocaleString()}
                >
                  {displayLabel} {formatDistanceToNow(new Date(displayDate), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <Badge
              variant="secondary"
              className="shrink-0 rounded-md bg-blue-50/60 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-blue-600"
            >
              YOU
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-1.5 pt-0">
        <div className="relative h-28 w-full overflow-hidden rounded-md border border-neutral-200 bg-neutral-50/70">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-neutral-50 via-neutral-50/60 to-transparent" />

          <div className="absolute right-0 top-0 z-10 rounded-bl-md border-l border-b border-neutral-200 bg-white/90 px-2 py-[3px] text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {snippet.language}
          </div>

          <div className="h-full overflow-hidden text-[11px] font-mono leading-snug text-neutral-800">
            <SyntaxHighlighter
              language={normalizeLanguage(snippet.language)}
              style={vs}
              customStyle={{
                margin: 0,
                padding: '0.55rem 0.7rem',
                background: 'transparent',
                fontSize: '0.7rem',
                lineHeight: 1.4
              }}
              wrapLines
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-neutral-100 px-3 py-1.5 text-[11px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 gap-1 px-2 text-neutral-500 transition-all hover:bg-white hover:text-red-600',
                  'border border-transparent hover:shadow-[0_3px_8px_rgba(15,23,42,0.08)]',
                  isFavorited &&
                    'border-neutral-200 bg-white text-red-500 hover:text-red-600 shadow-[0_3px_8px_rgba(15,23,42,0.10)]'
                )}
                onClick={handleFavorite}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    isFavorited && 'scale-105 fill-current'
                  )}
                />
                <span className="tabular-nums">{favCount > 0 ? favCount : 'Like'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p>{isFavorited ? 'Unlike this snippet' : 'Like this snippet'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 border border-transparent text-neutral-600 transition-all hover:border-neutral-200 hover:bg-white hover:text-neutral-900 hover:shadow-[0_3px_8px_rgba(15,23,42,0.08)]"
          onClick={handleCopy}
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[11px] font-medium text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-[11px]">Copy</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
