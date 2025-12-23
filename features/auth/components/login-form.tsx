'use client'

import { useActionState } from 'react'
import { login, loginWithSocial, type AuthState } from '@/features/auth/actions'
import { PasswordInput } from '@/components/password-input'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Code2, CheckCircle2, Github } from 'lucide-react'
import Link from 'next/link'

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(login, undefined)

  const searchParams = useSearchParams()
  const successMessage = searchParams.get('success')

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-between p-10 border-r border-border dark:bg-white dark:text-black bg-black text-white">
        <Link
          href="/"
          className="flex items-center gap-2 font-medium transition-opacity w-fit hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded border border-white/20 bg-black/50 dark:border-neutral-300 dark:bg-black">
            <Code2 className="h-4 w-4 text-white dark:text-white" />
          </div>
          <span className="text-lg tracking-tight font-semibold">CodeStash</span>
        </Link>

        <div className="space-y-4 opacity-40 select-none pointer-events-none">
          {/* Abstract Code UI Pattern */}
          <div className="h-2 w-24 bg-white/20 rounded mb-4 dark:bg-neutral-300" />
          <div className="pl-4 space-y-2">
            <div className="h-2 w-32 bg-white/20 rounded dark:bg-neutral-300" />
            <div className="h-2 w-48 bg-white/20 rounded dark:bg-neutral-300" />
          </div>
        </div>

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

      {/* RIGHT SIDE */}
      <div className="flex items-center justify-center py-12 px-8 bg-background text-foreground">
        <div className="mx-auto grid w-full max-w-[350px] gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to your Stash</h1>
            <p className="text-muted-foreground text-sm">
              Enter your details below to access your snippets.
            </p>
          </div>

          {successMessage && (
            <div
              className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-600 dark:text-emerald-400 animate-in fade-in-0"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>{successMessage}</p>
            </div>
          )}

          {/* SOCIAL LOGIN BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full" onClick={() => loginWithSocial('github')}>
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button variant="outline" className="w-full" onClick={() => loginWithSocial('google')}>
              {/* Simple Google SVG Icon */}
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <form action={formAction} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email or Username
              </Label>
              <Input
                id="email"
                name="email"
                type="text" // Changed from 'email' to 'text' to allow usernames
                placeholder="codestash_dev"
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
                  Signing you in…
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
