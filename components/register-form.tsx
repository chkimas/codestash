'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { RegisterSchema } from '@/app/lib/definitions'
import { registerUser } from '@/app/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Loader2, Code2, ArrowRight } from 'lucide-react'

type FormData = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = (values: FormData) => {
    setServerError(null)
    startTransition(async () => {
      const result = await registerUser(values)
      if (result?.message) {
        setServerError(result.message)
      }
    })
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-neutral-950 p-10 text-neutral-200 border-r border-neutral-800">
        <div className="flex items-center gap-2 font-medium text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-neutral-900">
            <Code2 className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight font-semibold">CodeStash</span>
        </div>

        {/* Abstract "Growth/Library" Visual */}
        <div className="space-y-4 opacity-40 select-none pointer-events-none">
          <div className="flex gap-2 mb-4">
            <div className="h-2 w-2 bg-neutral-700 rounded-full" />
            <div className="h-2 w-2 bg-neutral-700 rounded-full" />
            <div className="h-2 w-2 bg-neutral-700 rounded-full" />
          </div>
          <div className="h-32 w-full border-l-2 border-dashed border-neutral-800 pl-6 flex flex-col justify-center gap-3">
            <div className="h-2 w-3/4 bg-neutral-800 rounded" />
            <div className="h-2 w-1/2 bg-neutral-800 rounded" />
            <div className="h-2 w-5/6 bg-neutral-800 rounded" />
          </div>
        </div>

        <div className="space-y-4">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed text-white">
              &ldquo;Organize your snippets, share with your team, and never lose a brilliant piece
              of code again.&rdquo;
            </p>
            <footer className="text-sm text-neutral-500">Join other developers</footer>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-8 bg-white">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Create an account
            </h1>
            <p className="text-neutral-500 text-sm">
              Enter your details below to get started with CodeStash.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 text-sm font-medium">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Linus Torvalds"
                        {...field}
                        className="h-10 border-neutral-200 focus-visible:ring-neutral-900 transition-all placeholder:text-neutral-300"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        {...field}
                        className="h-10 border-neutral-200 focus-visible:ring-neutral-900 transition-all placeholder:text-neutral-300 font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                        className="h-10 border-neutral-200 focus-visible:ring-neutral-900 transition-all placeholder:text-neutral-300 font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-normal" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-700 text-sm font-medium">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        {...field}
                        className="h-10 border-neutral-200 focus-visible:ring-neutral-900 transition-all placeholder:text-neutral-300 font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-normal" />
                  </FormItem>
                )}
              />

              {serverError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-md text-sm animate-in fade-in-0 slide-in-from-top-1">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors shadow-none"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm text-neutral-500">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-neutral-900 hover:underline underline-offset-4 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
