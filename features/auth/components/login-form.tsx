'use client'

import { useActionState } from 'react'
import { authenticate } from '@/features/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Code2 } from 'lucide-react'

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-neutral-950 p-10 text-neutral-200 border-r border-neutral-800">
        <div className="flex items-center gap-2 font-medium text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-neutral-900">
            <Code2 className="h-4 w-4" />
          </div>
          <span className="text-lg tracking-tight font-semibold">CodeStash</span>
        </div>

        {/* Abstract "Code" Visual - CSS only */}
        <div className="space-y-4 opacity-40 select-none pointer-events-none">
          <div className="h-2 w-24 bg-neutral-800 rounded mb-4" />
          <div className="pl-4 space-y-2">
            <div className="h-2 w-32 bg-neutral-800 rounded" />
            <div className="h-2 w-48 bg-neutral-800 rounded" />
            <div className="h-2 w-40 bg-neutral-800 rounded" />
          </div>
          <div className="h-2 w-16 bg-neutral-800 rounded mt-4" />
        </div>

        <div className="space-y-4">
          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed text-white">
              &ldquo;Stop rewriting the same components. Build your personal library and deploy
              faster.&rdquo;
            </p>
            <footer className="text-sm text-neutral-500">v1.0.0 &mdash; Developer Preview</footer>
          </blockquote>
        </div>
      </div>

      <div className="flex items-center justify-center py-12 px-8 bg-white">
        <div className="mx-auto grid w-full max-w-[350px] gap-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Sign in to your Stash
            </h1>
            <p className="text-neutral-500 text-sm">
              Enter your email below to access your snippets.
            </p>
          </div>

          <form action={formAction} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-neutral-700 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="dev@codestash.io"
                required
                className="h-10 border-neutral-200 focus-visible:ring-neutral-900 transition-all placeholder:text-neutral-400 font-mono text-sm"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-neutral-700 text-sm font-medium">
                  Password
                </Label>
                <a
                  href="#"
                  className="text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="h-10 border-neutral-200 focus-visible:ring-neutral-900 transition-all font-mono text-sm"
              />
            </div>

            {errorMessage && (
              <div
                className="flex items-center gap-2 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600 animate-in fade-in-0 slide-in-from-top-1"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <Button
              className="w-full h-10 bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors shadow-none"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-neutral-400 animate-pulse" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-neutral-500">
            Don&apos;t have a stash yet?{' '}
            <a
              href="/register"
              className="font-medium text-neutral-900 hover:underline underline-offset-4"
            >
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
