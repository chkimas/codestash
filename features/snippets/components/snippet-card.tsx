'use client'

import { useState, useEffect } from 'react'
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
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from 'next-themes'
import Link from 'next/link'

interface SnippetCardProps {
  snippet: Snippet
  currentUserId?: string | null
}

export function SnippetCard({ snippet, currentUserId }: SnippetCardProps) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [isCopied, setIsCopied] = useState(false)
  const [isFavorited, setIsFavorited] = useState(snippet.is_favorited || false)
  const [favCount, setFavCount] = useState(Number(snippet.favorite_count || 0))

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

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

  const syntaxTheme = mounted && resolvedTheme === 'dark' ? oneDark : oneLight

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl transition-all duration-300 cursor-pointer',
        'bg-white shadow-sm hover:shadow-md hover:-translate-y-1',
        'dark:bg-card dark:hover:bg-card/80'
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 dark:bg-muted/10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground">
          {getLanguageIcon(snippet.language) || <FileCode2 className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="truncate text-sm font-semibold text-card-foreground group-hover:text-blue-600 transition-colors">
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
          <span className="shrink-0 rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wide text-blue-600 dark:text-blue-400 border border-blue-500/20">
            YOU
          </span>
        )}
      </div>

      <div className="relative h-[140px] w-full bg-background/50 dark:bg-black/20 group-hover:bg-background/80 transition-colors">
        <div className="absolute right-3 top-3 z-10 rounded-md border border-border/50 bg-card/90 px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground backdrop-blur-sm shadow-sm">
          {snippet.language}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white dark:from-card via-white/80 dark:via-card/80 to-transparent z-10" />

        <div className="h-full overflow-hidden text-[11px] opacity-90">
          <SyntaxHighlighter
            language={normalizeLang(snippet.language)}
            style={syntaxTheme}
            customStyle={{
              margin: 0,
              padding: '1rem',
              fontSize: '11.5px',
              lineHeight: '1.6'
            }}
            wrapLines={false}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>
      </div>

      <div className="flex h-12 shrink-0 items-center justify-between px-4 pb-2 pt-2 bg-white dark:bg-card">
        <div className="flex items-center gap-2.5 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/u/${snippet.user_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 group/author"
                >
                  <Avatar className="h-5 w-5 border border-border">
                    <AvatarImage src={snippet.author_image || undefined} />
                    <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                      {snippet.author_name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-xs font-medium text-muted-foreground group-hover/author:text-primary group-hover/author:underline transition-colors max-w-[100px]">
                    {snippet.author_name || 'Anonymous'}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent className="text-xs">View Profile</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-[10px] text-muted-foreground/40">/</span>

          <span className="text-xs text-muted-foreground/70 tabular-nums">
            {formatDistanceToNow(new Date(dateStr), { addSuffix: true }).replace('about ', '')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleFavorite}
                  className={cn(
                    'flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-all',
                    isFavorited
                      ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
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
