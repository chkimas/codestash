import { notFound } from 'next/navigation'
import Link from 'next/link'
import sql from '@/app/lib/db'
import { auth } from '@/auth'
import { Snippet } from '@/app/lib/definitions'
import { getLanguageIcon } from '@/app/lib/icons'
import { deleteSnippet } from '@/app/lib/actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardContent, Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Pencil, Trash2, Calendar, Lock, Globe } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
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

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium'
  }).format(date)
}

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
    <main className="container mx-auto p-8 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="pl-0 transition-all">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Link>
        </Button>
      </div>

      <article className="space-y-6">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-b pb-6">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              {snippet.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {/* Language */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200 px-3 py-1 shadow-sm hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 transition-colors cursor-help"
                      aria-label={snippet.language}
                    >
                      {getLanguageIcon(snippet.language)}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs font-medium capitalize px-2 py-1">
                    {snippet.language}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Author */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={snippet.author_image} />
                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
                <span>{snippet.author_name || 'Anonymous'}</span>
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={new Date(snippet.created_at).toISOString()}>
                  {formatDate(new Date(snippet.created_at))}
                </time>
              </div>

              {/* Privacy Badge */}
              <Badge variant={snippet.is_public ? 'default' : 'secondary'} className="gap-1">
                {snippet.is_public ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                {snippet.is_public ? 'Public' : 'Private'}
              </Badge>
            </div>
          </div>

          {/* ACTIONS (Only for Owner) */}
          {isOwner && (
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="icon" className="h-9 w-9" asChild>
                <Link href={`/dashboard/edit/${snippet.id}`} aria-label="Edit snippet">
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Delete snippet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-600 dark:text-red-400">
                      Delete snippet?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete&nbsp;
                      <span className="font-semibold text-foreground">“{snippet.title}”</span>. This
                      action cannot be undone.
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
          <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border text-slate-700 dark:text-slate-300 leading-relaxed">
            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500 mb-2">
              About this snippet
            </h3>
            <p>{snippet.description}</p>
          </section>
        )}

        {/* CODE BLOCK */}
        <section aria-label="Code Snippet">
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm">
            <CardContent className="p-0">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b">
                <span className="text-xs font-mono text-muted-foreground">
                  main.{snippet.language === 'c++' ? 'cpp' : snippet.language}
                </span>
              </div>
              <pre className="overflow-x-auto p-6 text-sm font-mono leading-relaxed bg-slate-950 text-slate-50">
                <code>{snippet.code}</code>
              </pre>
            </CardContent>
          </Card>
        </section>
      </article>
    </main>
  )
}
