import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditSnippetForm from '@/features/snippets/components/edit-form'
import { Card, CardContent } from '@/components/ui/card'

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

  return (
    <main className="min-h-screen bg-background py-10 px-4 md:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Snippet</h1>
          <p className="text-muted-foreground mt-2">Make changes to your code snippet.</p>
        </div>

        <Card className="border-border/50 shadow-sm bg-card">
          <CardContent className="pt-6">
            <EditSnippetForm snippet={snippetData} />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
