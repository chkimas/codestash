'use client'

import { useActionState } from 'react'
import { login, type AuthState } from '@/features/auth/actions'
import { PasswordInput } from '@/components/password-input'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Code2, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(login, undefined)

  // 1. Get the success message from the URL
  const searchParams = useSearchParams()
  const successMessage = searchParams.get('success')

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* LEFT SIDE - Opposite of current theme */}
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
          <div className="h-2 w-24 bg-white/20 rounded mb-4 dark:bg-neutral-300" />
          <div className="pl-4 space-y-2">
            <div className="h-2 w-32 bg-white/20 rounded dark:bg-neutral-300" />
            <div className="h-2 w-48 bg-white/20 rounded dark:bg-neutral-300" />
            <div className="h-2 w-40 bg-white/20 rounded dark:bg-neutral-300" />
          </div>
          <div className="h-2 w-16 bg-white/20 rounded mt-4 dark:bg-neutral-300" />
        </div>

        <div className="space-y-4">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed">
              &ldquo;Stop rewriting the same components. Build your personal library and deploy
              faster.&rdquo;
            </p>
            <footer className="text-sm text-white/60 dark:text-neutral-600">
              v1.0.0 &mdash; Developer Preview
            </footer>
          </blockquote>
        </div>
      </div>

      {/* RIGHT SIDE - Follows current theme */}
      <div className="flex items-center justify-center py-12 px-8 bg-background text-foreground">
        <div className="mx-auto grid w-full max-w-[350px] gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to your Stash</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email below to access your snippets.
            </p>
          </div>

          {/* 2. Success Message Display (Matches your Error design) */}
          {successMessage && (
            <div
              className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 dark:text-emerald-400 animate-in fade-in-0"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          <form action={formAction} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="dev@codestash.io"
                required
                className="h-10 placeholder:text-muted-foreground"
              />
            </div>

            <div className="relative grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
              </div>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={6}
                className="h-10 placeholder:text-muted-foreground"
              />
              <Link
                href="/forgot-password"
                className="absolute right-0 top-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {state?.errorMessage && (
              <div
                className="flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive animate-in fade-in-0"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{state.errorMessage}</p>
              </div>
            )}

            <Button
              className="w-full h-10 bg-primary text-primary-foreground font-medium hover:bg-primary/90"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary-foreground/70 animate-pulse" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have a stash yet?{' '}
            <Link
              href="/register"
              className="font-medium text-foreground hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
