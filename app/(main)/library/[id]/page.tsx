import { notFound } from 'next/navigation'
import Link from 'next/link'
import sql from '@/db/client'
import { createClient } from '@/lib/supabase/server'
import { Snippet } from '@/lib/definitions'
import { deleteSnippet } from '@/features/snippets/actions'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CodeViewer } from '@/features/snippets/components/code-viewer'
import { getLanguageIcon } from '@/components/icons'
import { formatDistanceToNow } from 'date-fns'
import { Pencil, Trash2, Calendar, Lock, Globe, Clock } from 'lucide-react'
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
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const [snippet] = await sql`
    SELECT title, description, language, name as author_name 
    FROM snippets 
    LEFT JOIN users ON snippets.user_id = users.id
    WHERE snippets.id = ${id}
  `

  if (!snippet) {
    return {
      title: 'Snippet Not Found'
    }
  }

  const description =
    snippet.description ||
    `A useful ${snippet.language} code snippet by ${snippet.author_name || 'Anonymous'}.`

  return {
    title: snippet.title,
    description: description,
    openGraph: {
      title: snippet.title,
      description: description,
      type: 'article',
      publishedTime: snippet.created_at,
      authors: [snippet.author_name || 'Anonymous'],
      tags: [snippet.language, 'code snippet', 'development']
    },
    twitter: {
      card: 'summary_large_image',
      title: snippet.title,
      description: description
    }
  }
}

export default async function SnippetDetailPage(props: Props) {
  const params = await props.params
  const id = params.id

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  const snippets = await sql`
    SELECT 
      s.*, 
      u.name as author_name, 
      u.image as author_image,
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: snippet.title,
    author: {
      '@type': 'Person',
      name: snippet.author_name || 'Anonymous'
    },
    programmingLanguage: snippet.language,
    text: snippet.code, // Be careful if code is huge, maybe truncate
    dateCreated: snippet.created_at,
    description: snippet.description || `A ${snippet.language} snippet.`
  }

  return (
    <main className="min-h-screen bg-background pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Sticky Header / Breadcrumb */}
      <div className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-6 h-14 flex items-center">
          <BackButton />
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-6 py-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-10">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {snippet.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex h-8 w-8 items-center justify-center rounded-md cursor-help bg-muted/30 border border-border/50 text-foreground">
                      {getLanguageIcon(snippet.language)}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs font-medium capitalize">
                    {snippet.language}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Link
                href={`/u/${snippet.user_id}`}
                className="flex items-center gap-2 group transition-opacity hover:opacity-80"
              >
                <Avatar className="h-5 w-5 border border-border">
                  <AvatarImage src={snippet.author_image || undefined} />
                  <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-medium">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground group-hover:text-primary group-hover:underline decoration-primary/30 underline-offset-4 transition-colors">
                  {snippet.author_name || 'Anonymous'}
                </span>
              </Link>

              <span className="text-muted-foreground/30">/</span>

              {snippet.updated_at && snippet.updated_at !== snippet.created_at ? (
                <div
                  className="flex items-center gap-1.5 text-muted-foreground"
                  title={`Originally created: ${new Date(snippet.created_at).toLocaleString()}`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Updated {formatDistanceToNow(new Date(snippet.updated_at), { addSuffix: true })}
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1.5 text-muted-foreground"
                  title={new Date(snippet.created_at).toLocaleString()}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(
                      new Date(snippet.created_at)
                    )}
                  </span>
                </div>
              )}

              <span className="text-muted-foreground/30">/</span>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                {snippet.is_public ? (
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                ) : (
                  <Lock className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span>{snippet.is_public ? 'Public' : 'Private'}</span>
              </div>
            </div>
          </div>

          {/* Action Menu */}
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-9 gap-2 text-foreground border-border hover:bg-muted"
              >
                <Link href={`/library/edit/${snippet.id}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  Modify
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Snippet</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete{' '}
                      <span className="font-medium text-foreground">
                        &quot;{snippet.title}&quot;
                      </span>
                      ? This action cannot be undone.
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
                      <AlertDialogAction
                        type="submit"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </form>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </header>

        {snippet.description && (
          <div className="mb-8 max-w-3xl">
            <p className="text-lg leading-relaxed text-muted-foreground border-l-2 border-border pl-4 py-1">
              {snippet.description}
            </p>
          </div>
        )}

        {/* MAIN CODE BLOCK */}
        <section className="w-full rounded-lg border border-border overflow-hidden shadow-sm">
          <CodeViewer code={snippet.code} language={snippet.language} className="min-h-[200px]" />
        </section>
      </div>
    </main>
  )
}
