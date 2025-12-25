import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Snippet } from '@/lib/definitions'
import EditSnippetForm from '@/features/snippets/components/edit-form'
import { Card, CardContent } from '@/components/ui/card'
import { isLanguageValue } from '@/lib/constants'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditSnippetPage(props: Props) {
  const params = await props.params
  const id = params.id

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: snippetData, error } = await supabase
    .from('snippets')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !snippetData) {
    notFound()
  }

  const snippet: Snippet = {
    id: snippetData.id,
    user_id: snippetData.user_id,
    title: snippetData.title,
    code: snippetData.code,
    language: isLanguageValue(snippetData.language) ? snippetData.language : 'javascript',
    description: snippetData.description,
    is_public: snippetData.is_public,
    updated_at: snippetData.updated_at,
    created_at: snippetData.created_at
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
