'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/password-input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { updatePasswordFromRecovery } from '@/features/auth/actions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

const formSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: '', confirmPassword: '' }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    const result = await updatePasswordFromRecovery(values.password)

    // Updated to handle new ActionResult format
    if (!result.success) {
      const errorMessage = result.message || 'Failed to update password'
      setError(errorMessage)
      toast.error(errorMessage)
    } else {
      toast.success(result.message || 'Password updated successfully!')
      router.push('/login?message=Password updated. Please login with your new password.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[350px] space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset Password</h1>
        <p className="text-sm text-muted-foreground">Enter your new password below.</p>
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    {...field}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        <p>
          Remember your password?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push('/login')}
          >
            Sign in
          </Button>
        </p>
      </div>
    </div>
  )
}
