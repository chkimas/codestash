'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { RegisterSchema } from '@/lib/definitions'
import { registerUser, type RegisterResult } from '@/features/auth/actions'
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
import { PasswordInput } from '@/components/password-input'

type RegisterInput = z.infer<typeof RegisterSchema>

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = (values: RegisterInput) => {
    setServerError(null)

    startTransition(async () => {
      const result: RegisterResult = await registerUser(values)

      if (!result.success) {
        setServerError(result.message)

        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof RegisterInput, {
              type: 'server',
              message: messages[0]
            })
          })
        }
      }
    })
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 border-r border-border dark:bg-white dark:text-black bg-black text-white">
        <div className="flex items-center gap-2 font-medium">
          <Link href="/" className="flex items-center gap-2 font-medium transition-opacity w-fit">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-white/20 bg-black/50 dark:border-neutral-300 dark:bg-black">
              <Code2 className="h-4 w-4 text-white dark:text-white" />
            </div>
            <span className="text-lg tracking-tight font-semibold">CodeStash</span>
          </Link>
        </div>

        <div className="space-y-4 opacity-40 select-none pointer-events-none">
          <div className="flex gap-2 mb-4">
            <div className="h-2 w-2 bg-white/20 rounded-full dark:bg-neutral-700" />
            <div className="h-2 w-2 bg-white/20 rounded-full dark:bg-neutral-700" />
            <div className="h-2 w-2 bg-white/20 rounded-full dark:bg-neutral-700" />
          </div>
          <div className="h-32 w-full border-l-2 border-dashed border-white/20 dark:border-neutral-800 pl-6 flex flex-col justify-center gap-3">
            <div className="h-2 w-3/4 bg-white/20 rounded dark:bg-neutral-800" />
            <div className="h-2 w-1/2 bg-white/20 rounded dark:bg-neutral-800" />
            <div className="h-2 w-5/6 bg-white/20 rounded dark:bg-neutral-800" />
          </div>
        </div>

        <div className="space-y-4">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;Organize your snippets, share with your team, and never lose a brilliant piece
              of code again.&rdquo;
            </p>
            <footer className="text-sm text-white/60 dark:text-neutral-600">
              Join other developers
            </footer>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-8 bg-background text-foreground">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-muted-foreground text-sm">
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
                    <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Code Stash"
                        {...field}
                        className="h-10 placeholder:text-muted-foreground"
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
                    <FormLabel className="text-sm font-medium">Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="code@stash.com"
                        type="email"
                        {...field}
                        className="h-10 placeholder:text-muted-foreground font-mono text-sm"
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
                    <FormLabel className="text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Create a password"
                        {...field}
                        className="h-10 placeholder:text-muted-foreground font-mono text-sm"
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
                    <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirm your password"
                        {...field}
                        className="h-10 placeholder:text-muted-foreground font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-normal" />
                  </FormItem>
                )}
              />

              {serverError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm animate-in fade-in-0">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-10 bg-primary text-primary-foreground font-medium hover:bg-primary/90"
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

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground hover:underline underline-offset-4 transition-colors"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
