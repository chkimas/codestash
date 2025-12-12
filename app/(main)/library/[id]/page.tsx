import { notFound } from 'next/navigation'
import Link from 'next/link'
import sql from '@/db/client'
import { auth } from '@/auth'
import { Snippet } from '@/lib/definitions'
import { deleteSnippet } from '@/features/snippets/actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CodeViewer } from '@/features/snippets/components/code-viewer'
import { getLanguageIcon } from '@/components/icons'
import { Pencil, Trash2, Calendar, Lock, Globe } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { BackButton } from '@/components/back-button'

type Props = {
  params: Promise<{ id: string }>
}

export default async function SnippetDetailPage(props: Props) {
  const params = await props.params
  const id = params.id
  const session = await auth()
  const userId = session?.user?.id ?? null

  const snippets = await sql`
    SELECT 
      s.*, 
      u.name as author_name, 
      NULL as author_image,
      EXISTS(SELECT 1 FROM favorites f WHERE f.snippet_id = s.id AND f.user_id = ${userId}) as is_favorited,
      (SELECT COUNT(*) FROM favorites f WHERE f.snippet_id = s.id) as favorite_count
    FROM snippets s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.id = ${id} 
    AND (s.user_id = ${userId} OR s.is_public = true)
    LIMIT 1
  `

  const snippet = snippets[0] as Snippet | undefined

  if (!snippet) {
    notFound()
  }

  const authorInitial = snippet.author_name?.charAt(0).toUpperCase() || '?'
  const isOwner = userId === snippet.user_id

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* Sticky Header / Breadcrumb */}
      <div className="sticky top-14 z-30 w-full bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-12 flex items-center">
          <BackButton />
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-10">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
              {snippet.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex h-8 w-8 items-center justify-center cursor-help">
                      {getLanguageIcon(snippet.language)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs font-medium capitalize">
                    {snippet.language}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5 border border-neutral-200">
                  <AvatarImage src={snippet.author_image} />
                  <AvatarFallback className="text-[9px] bg-neutral-100 text-neutral-600 font-medium">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-neutral-700">
                  {snippet.author_name || 'Anonymous'}
                </span>
              </div>

              <span className="text-neutral-300">/</span>

              <div
                className="flex items-center gap-1.5"
                title={new Date(snippet.created_at).toLocaleString()}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
                    new Date(snippet.created_at)
                  )}
                </span>
              </div>

              <span className="text-neutral-300">/</span>

              <div className="flex items-center gap-1.5">
                {snippet.is_public ? (
                  <Globe className="h-3.5 w-3.5" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
                <span>{snippet.is_public ? 'Public' : 'Private'}</span>
              </div>
            </div>
          </div>

          {/* Action Menu (Desktop: Buttons, Mobile: Dropdown could be added if needed) */}
          {isOwner && (
            <div className="flex items-center gap-1">
              <Button
                variant="default"
                size="sm"
                asChild
                className="h-9 bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200"
              >
                <Link href={`/library/edit/${snippet.id}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Modify
                </Link>
              </Button>
              <span className="text-muted-foreground select-none">/</span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete{' '}
                      <span className="font-medium text-neutral-900">{snippet.title}&quot;</span>
                      &quot; This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <form
                      action={async () => {
                        'use server'
                        await deleteSnippet(snippet.id)
                      }}
                    >
                      <AlertDialogAction type="submit" className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </header>

        {/* DESCRIPTION */}
        {snippet.description && (
          <div className="mb-8 max-w-3xl">
            <p className="text-lg leading-relaxed text-neutral-600 border-l-2 border-neutral-200 pl-4">
              {snippet.description}
            </p>
          </div>
        )}

        {/* MAIN CODE BLOCK */}
        <section className="w-full">
          <CodeViewer code={snippet.code} language={snippet.language} className="min-h-[200px]" />
        </section>
      </div>
    </main>
  )
}
