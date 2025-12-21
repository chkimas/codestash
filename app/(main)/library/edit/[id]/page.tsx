import { notFound, redirect } from 'next/navigation'
import sql from '@/db/client'
import { createClient } from '@/lib/supabase/server'
import { Snippet } from '@/lib/definitions'
import EditSnippetForm from '@/features/snippets/components/edit-form'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditSnippetPage(props: Props) {
  const params = await props.params
  const id = params.id

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const snippets = await sql<Snippet[]>`
    SELECT * FROM snippets 
    WHERE id = ${id} AND user_id = ${user.id}
  `
  const snippet = snippets[0]

  if (!snippet) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background py-10 px-4 md:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Snippet</h1>
          <p className="text-muted-foreground mt-2">Make changes to your code snippet.</p>
        </div>

        <Card className="border-border/50 shadow-sm bg-card">
          <CardContent className="pt-6">
            <EditSnippetForm snippet={snippet} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
