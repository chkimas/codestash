'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { forgotPassword } from '../actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

export function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    const result = await forgotPassword(values.email)
    
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-emerald-100 p-3">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold">Check your email</h3>
        <p className="text-neutral-500 text-sm">
          We have sent a password reset link to <span className="font-medium text-neutral-900">{form.getValues('email')}</span>.
        </p>
        <Button variant="outline" className="w-full mt-4" asChild>
           <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Forgot Password</h1>
        <p className="text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Reset Link
          </Button>
        </form>
      </Form>
      
       <div className="text-center text-sm text-neutral-500">
        <Link href="/login" className="hover:text-neutral-900 underline underline-offset-4">
          Back to Login
        </Link>
      </div>
    </div>
  )
}