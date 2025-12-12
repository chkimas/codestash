'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, ChevronsUpDown } from 'lucide-react'
import { CreateSnippetSchema } from '@/lib/definitions'
import { PROGRAMMING_LANGUAGES } from '@/lib/constants'
import { updateSnippet } from '@/features/snippets/actions'
import { getLanguageIcon } from '@/components/icons'
import { Snippet } from '@/lib/definitions'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
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
import { Card, CardContent } from '@/components/ui/card'

type FormData = z.infer<typeof CreateSnippetSchema>

export default function EditSnippetForm({ snippet }: { snippet: Snippet }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(CreateSnippetSchema),
    defaultValues: {
      title: snippet.title,
      code: snippet.code,
      language: snippet.language,
      description: snippet.description || '',
      is_public: snippet.is_public
    }
  })

  const onSubmit = (values: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await updateSnippet(snippet.id, values)
      if (result?.message) {
        setError(result.message)
      }
    })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* TITLE Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Center a div with CSS Flexbox" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* LANGUAGE Field */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Language</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            <div className="flex items-center gap-2">
                              {/* Selected Icon */}
                              {getLanguageIcon(field.value)}
                              {
                                PROGRAMMING_LANGUAGES.find(
                                  (language) => language.value === field.value
                                )?.label
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
                      className="p-0"
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
                                  {/* List Item Icon */}
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

            {/* CODE Field */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste your code here..."
                      className="font-mono min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    <i>Monospaced font for better readability.</i>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose of your code snippet..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* IS PUBLIC Checkbox */}
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Make this snippet public</FormLabel>
                    <FormDescription>
                      Anyone on the internet can view and copy public snippets.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/library/${snippet.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
