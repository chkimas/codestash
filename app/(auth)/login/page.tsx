'use client'

import { useActionState } from 'react'
import { authenticate } from '@/app/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  // Connect our Server Action to the Form
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account.</CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="grid gap-4">
            {/* Email Field */}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="m@example.com" required />
            </div>

            {/* Password Field */}
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>

            {/* Error Message Area */}
            {errorMessage && (
              <div
                className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-500"
                aria-live="polite"
              >
                <AlertCircle className="h-4 w-4" />
                <p>{errorMessage}</p>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button className="w-full" disabled={isPending}>
              {isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
