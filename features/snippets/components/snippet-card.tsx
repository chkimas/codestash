'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { Copy, Check, Heart, FileCode2 } from 'lucide-react'
import { Snippet } from '@/lib/definitions'
import { getLanguageIcon } from '@/components/icons'
import { toggleFavorite } from '@/features/snippets/actions'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import Link from 'next/link'

interface SnippetCardProps {
  snippet: Snippet
  currentUserId?: string | null
}

export function SnippetCard({ snippet, currentUserId }: SnippetCardProps) {
  const router = useRouter()
  const [isCopied, setIsCopied] = useState(false)
  const [isFavorited, setIsFavorited] = useState(snippet.is_favorited || false)
  const [favCount, setFavCount] = useState(Number(snippet.favorite_count || 0))

  const isOwner = currentUserId === snippet.user_id
  const dateStr = snippet.updated_at || snippet.created_at

  const handleCardClick = () => router.push(`/library/${snippet.id}`)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(snippet.code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!currentUserId) return router.push('/login')

    const next = !isFavorited
    setIsFavorited(next)
    setFavCount((n) => (next ? n + 1 : Math.max(n - 1, 0)))
    void toggleFavorite(snippet.id)
  }

  const normalizeLang = (l: string) => {
    const map: Record<string, string> = {
      vue: 'html',
      react: 'tsx',
      nextjs: 'tsx',
      'c++': 'cpp',
      'c#': 'csharp'
    }
    return map[l.toLowerCase()] || l.toLowerCase()
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg cursor-pointer"
    >
      {/* HEADER (Enterprise Compact) */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-50 bg-neutral-50/40">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-neutral-200/50 bg-white text-neutral-600 shadow-sm">
          {getLanguageIcon(snippet.language) || <FileCode2 className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="truncate text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                  {snippet.title}
                </h3>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {snippet.title}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isOwner && (
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-600 border border-blue-100/50">
            YOU
          </span>
        )}
      </div>

      {/* CODE WINDOW */}
      <div className="relative h-[140px] w-full bg-[#fafafa] group-hover:bg-[#f8f9fa] transition-colors">
        {/* Language Tag */}
        <div className="absolute right-3 top-3 z-10 rounded-md border border-neutral-200/50 bg-white/90 px-2 py-0.5 text-[10px] font-mono font-medium text-neutral-500 backdrop-blur-sm shadow-sm">
          {snippet.language}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/60 to-transparent z-10" />
        {/* Syntax Highlighter */}
        <div className="h-full overflow-hidden text-[11px] opacity-90 mix-blend-multiply">
          <SyntaxHighlighter
            language={normalizeLang(snippet.language)}
            style={oneLight}
            customStyle={{
              margin: 0,
              padding: '1rem',
              background: 'transparent',
              fontSize: '11.5px',
              lineHeight: '1.6'
            }}
            wrapLines={false}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex h-11 shrink-0 items-center justify-between border-t border-neutral-100 bg-white px-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/u/${snippet.user_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 group/author"
                >
                  <Avatar className="h-5 w-5 border border-neutral-200">
                    <AvatarImage src={snippet.author_image || undefined} />
                    <AvatarFallback className="text-[9px] font-bold bg-neutral-100 text-neutral-500">
                      {snippet.author_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs font-medium text-neutral-600 group-hover/author:text-blue-600 group-hover/author:underline transition-colors max-w-[100px]">
                    {snippet.author_name || 'Anonymous'}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="text-xs">View Profile</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-[10px] text-neutral-300">/</span>

          <span className="text-xs text-neutral-400 tabular-nums">
            {formatDistanceToNow(new Date(dateStr), { addSuffix: true }).replace('about ', '')}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Favorite Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-all',
                    isFavorited
                      ? 'text-red-500 bg-red-50 hover:bg-red-100'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                  )}
                >
                  <Heart className={cn('h-3.5 w-3.5', isFavorited && 'fill-current')} />
                  {favCount > 0 && <span className="tabular-nums">{favCount}</span>}
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">{isFavorited ? 'Unlike' : 'Like'}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleCopy}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {isCopied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Copy</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  )
}
