import { notFound, redirect } from 'next/navigation'
import sql from '@/db/client'
import { createClient } from '@/lib/supabase/server'
import { Snippet } from '@/lib/definitions'
import EditSnippetForm from '@/features/snippets/components/edit-form'

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
    <main className="container mx-auto max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Edit Snippet</h1>
        <p className="text-muted-foreground mt-2">Make changes to your code snippet.</p>
      </div>
      <EditSnippetForm snippet={snippet} />
    </main>
  )
}
