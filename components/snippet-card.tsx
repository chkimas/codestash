'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Copy, Check, Heart, FileCode2 } from 'lucide-react'
import { Snippet } from '@/app/lib/definitions'
import { getLanguageIcon } from '@/app/lib/icons'
import { toggleFavorite } from '@/app/lib/actions'
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

  const handleCardClick = () => {
    router.push(`/dashboard/${snippet.id}`)
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(snippet.code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUserId) return router.push('/login')

    const newStatus = !isFavorited
    setIsFavorited(newStatus)
    setFavCount((prev) => (newStatus ? prev + 1 : prev - 1))

    await toggleFavorite(snippet.id)
  }

  const isOwner = currentUserId === snippet.user_id

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
      className="group relative flex flex-col justify-between overflow-hidden border-neutral-200 bg-white transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 cursor-pointer"
    >
      {/* Header Section */}
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-600 mt-1">
              {getLanguageIcon(snippet.language) || <FileCode2 className="h-5 w-5" />}
            </div>

            {/* Title & Metadata */}
            <div className="space-y-1.5 min-w-0">
              <h3 className="text-lg font-semibold leading-tight tracking-tight text-neutral-900 truncate pr-2">
                {snippet.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4 border border-neutral-200">
                    <AvatarImage src={snippet.author_image} />
                    <AvatarFallback className="text-[8px] bg-neutral-100 text-neutral-600 font-bold">
                      {snippet.author_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-neutral-700 truncate max-w-[100px]">
                    {snippet.author_name || 'Anonymous'}
                  </span>
                </div>
                <span className="text-neutral-300">•</span>
                <span>{formatDistanceToNow(new Date(snippet.created_at))} ago</span>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          {isOwner && (
            <Badge
              variant="secondary"
              className="shrink-0 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 bg-blue-50 border-blue-100 rounded-full hover:bg-blue-100"
            >
              YOU
            </Badge>
          )}
        </div>
      </CardHeader>

      {/* Code Preview */}
      <CardContent className="px-5 py-0 flex-grow">
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50/50">
          {/* Language Label */}
          <div className="absolute top-0 right-0 z-10">
            <div className="px-2.5 py-1 bg-white border-b border-l border-neutral-200 rounded-bl-lg text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider shadow-sm">
              {snippet.language}
            </div>
          </div>

          <div className="text-xs font-mono opacity-90 leading-relaxed overflow-hidden">
            <SyntaxHighlighter
              language={normalizeLanguage(snippet.language)}
              style={vs}
              customStyle={{
                margin: 0,
                padding: '1rem',
                background: 'transparent',
                fontSize: '0.75rem'
              }}
              wrapLines={true}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50/40 p-3 px-5 group-hover:bg-neutral-50 transition-colors">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 gap-1.5 px-2.5 text-neutral-500 hover:bg-white hover:shadow-sm hover:text-red-600 transition-all border border-transparent',
                  isFavorited &&
                    'text-red-500 hover:text-red-600 bg-white shadow-sm border-neutral-200'
                )}
                onClick={handleFavorite}
              >
                <Heart
                  className={cn(
                    'h-3.5 w-3.5 transition-transform',
                    isFavorited && 'fill-current scale-110'
                  )}
                />
                <span className="text-xs font-medium tabular-nums">
                  {favCount > 0 ? favCount : 'Like'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFavorited ? 'Unlike this snippet' : 'Like this snippet'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-white border border-transparent transition-all"
          onClick={handleCopy}
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-xs text-emerald-600 font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
