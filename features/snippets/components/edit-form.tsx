'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Snippet } from '@/lib/definitions'
import { PROGRAMMING_LANGUAGES } from '@/lib/constants'
import { updateSnippet } from '@/features/snippets/actions'
import { getLanguageIcon } from '@/components/icons'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'

// Exact schema matching CreateSnippetSchema structure
const EditSnippetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(60, 'Title must be less than 60 characters'),
  code: z.string().min(10, 'Code snippet is too short').max(10000, 'Code snippet is too large'),
  language: z.string().min(1, 'Language is required'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  is_public: z.boolean()
})

type FormData = z.infer<typeof EditSnippetSchema>

export default function EditSnippetForm({ snippet }: { snippet: Snippet }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(EditSnippetSchema),
    defaultValues: {
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      description: snippet.description ?? '',
      is_public: Boolean(snippet.is_public)
    }
  })

  const onSubmit = (values: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await updateSnippet(snippet.id, values)
      } catch {
        setError('Failed to update snippet')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Center a div with CSS Flexbox"
                  {...field}
                  className="bg-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-foreground">Language</FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className={cn(
                        'w-full justify-between bg-background',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        <div className="flex items-center gap-2 text-foreground">
                          {getLanguageIcon(field.value)}
                          {
                            PROGRAMMING_LANGUAGES.find((language) => language.value === field.value)
                              ?.label
                          }
                        </div>
                      ) : (
                        'Select language'
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 bg-popover"
                  style={{ width: 'var(--radix-popover-trigger-width)' }}
                >
                  <Command>
                    <CommandInput placeholder="Search language..." />
                    <CommandList>
                      <CommandEmpty>No language found.</CommandEmpty>
                      <CommandGroup>
                        {PROGRAMMING_LANGUAGES.map((language) => (
                          <CommandItem
                            value={language.label}
                            key={language.value}
                            onSelect={() => {
                              form.setValue('language', language.value)
                              setOpen(false)
                            }}
                          >
                            <div className="flex items-center gap-2">
                              {getLanguageIcon(language.value)}
                              <span>{language.label}</span>
                            </div>
                            <Check
                              className={cn(
                                'ml-auto h-4 w-4',
                                language.value === field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Code</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Paste your code here..."
                  className="font-mono min-h-[200px] bg-background"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-muted-foreground">
                <i>Monospaced font for better readability.</i>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose of your code snippet..."
                  className="resize-none bg-background"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 bg-background/50">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-foreground">Make this snippet public</FormLabel>
                <FormDescription className="text-muted-foreground">
                  Anyone on the internet can view and copy public snippets.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild className="border-border">
            <Link href={`/library/${snippet.id}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
