'use client'

import { useActionState, useState } from 'react'
import {
  updateProfile,
  updateEmail,
  updatePassword,
  deleteAccount,
  type SettingsState
} from '@/features/settings/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Upload, AlertTriangle, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { PasswordInput } from '@/components/password-input'

function StatusMessage({ state }: { state: SettingsState }) {
  if (!state) return null
  if (state.error) return <p className="text-xs font-medium text-red-600 mt-2">{state.error}</p>
  if (state.message)
    return <p className="text-xs font-medium text-neutral-900 mt-2">{state.message}</p>
  return null
}

export function SettingsForm({
  initialName,
  email,
  initialImage
}: {
  initialName: string
  email: string
  initialImage?: string
}) {
  const [profileState, profileAction, isProfilePending] = useActionState<SettingsState, FormData>(
    updateProfile,
    undefined
  )
  const [emailState, emailAction, isEmailPending] = useActionState<SettingsState, FormData>(
    updateEmail,
    undefined
  )
  const [passState, passAction, isPassPending] = useActionState<SettingsState, FormData>(
    updatePassword,
    undefined
  )
  const [deleteState, deleteAction, isDeletePending] = useActionState<SettingsState, FormData>(
    deleteAccount,
    undefined
  )

  const [preview, setPreview] = useState(initialImage)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file) setPreview(URL.createObjectURL(file))
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-6">
      <section className="space-y-4">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-base font-semibold text-neutral-900">Public Profile</h2>
          <p className="text-sm text-neutral-500">
            This will be displayed on your public snippets.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white/60 px-6 py-5 shadow-sm">
          <form action={profileAction} className="space-y-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 border border-neutral-200 shadow-sm">
                <AvatarImage src={preview} className="object-cover" />
                <AvatarFallback className="bg-neutral-100 text-lg font-medium text-neutral-900">
                  {initialName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <Label
                  htmlFor="avatar"
                  className="inline-flex cursor-pointer items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50"
                >
                  <Upload className="mr-2 h-4 w-4 text-neutral-500" />
                  Upload new image
                </Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-[11px] text-neutral-500">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-neutral-900">Display Name</Label>
              <Input
                name="name"
                defaultValue={initialName}
                className="h-9 max-w-md border-neutral-200 bg-white shadow-sm focus-visible:ring-neutral-900"
              />
              <p className="text-[11px] text-neutral-500">Please use 32 characters at maximum.</p>
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-neutral-200 pt-4 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Profile visible to others</span>
              </div>
              <div className="flex items-center gap-3">
                <StatusMessage state={profileState} />
                <Button
                  type="submit"
                  disabled={isProfilePending}
                  className="h-8 rounded-full bg-neutral-900 px-4 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  {isProfilePending ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Saving
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 2. Authentication */}
      <section className="space-y-4">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-base font-semibold text-neutral-900">Authentication</h2>
          <p className="text-sm text-neutral-500">Modify login credentials.</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Email panel */}
          <form
            action={emailAction}
            className="space-y-4 border-l border-neutral-200 pl-4 md:border-l md:border-neutral-200 md:pl-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-neutral-900">Email Address</h3>
              <p className="text-xs text-neutral-500">Change the email address you use to login.</p>
            </div>

            <div className="grid max-w-md gap-4 text-sm">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-500">Current email</Label>
                <Input
                  value={email}
                  disabled
                  className="h-9 border-neutral-200 bg-neutral-50 text-neutral-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-900">New email</Label>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="new@example.com"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-900">Confirm password</Label>
                <PasswordInput
                  name="currentPassword"
                  required
                  className="h-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400">
              <StatusMessage state={emailState} />
              <Button
                type="submit"
                variant="outline"
                disabled={isEmailPending}
                className="h-8 rounded-full border-neutral-300 px-3 text-xs"
              >
                {isEmailPending ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                ) : (
                  'Update email'
                )}
              </Button>
            </div>
          </form>

          {/* Password panel */}
          <form
            action={passAction}
            className="space-y-4 border-l border-neutral-200 pl-4 md:border-l md:border-neutral-200 md:pl-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-neutral-900">Password</h3>
              <p className="text-xs text-neutral-500">
                Use a strong, unique password to secure your account.
              </p>
            </div>

            <div className="grid max-w-md gap-4 text-sm">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-900">Current password</Label>
                <PasswordInput
                  name="currentPassword"
                  required
                  className="h-9"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-900">New password</Label>
                <PasswordInput
                  name="newPassword"
                  required
                  minLength={6}
                  className="h-9"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-400">
              <StatusMessage state={passState} />
              <Button
                type="submit"
                variant="outline"
                disabled={isPassPending}
                className="h-8 rounded-full border-neutral-300 px-3 text-xs"
              >
                {isPassPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Update password'}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* 3. Danger Zone */}
      <section className="space-y-4">
        <div className="border-b border-neutral-200 pb-4">
          <h2 className="text-base font-semibold text-red-600">Danger Zone</h2>
          <p className="text-sm text-neutral-500">Irreversible actions for your account.</p>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50/40 px-5 py-4">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-neutral-900">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Delete account
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-neutral-600">
                Permanently remove your account and all content from CodeStash. This action cannot
                be undone.
              </p>
              {deleteState?.error && (
                <p className="mt-1 text-xs font-medium text-red-600">{deleteState.error}</p>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeletePending}
                  className="h-8 rounded-full bg-red-600 px-4 text-xs font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete your account? All of your data will be
                    permanently removed. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <form action={deleteAction}>
                    <AlertDialogAction
                      type="submit"
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      {isDeletePending ? 'Deleting…' : 'Yes, delete my account'}
                    </AlertDialogAction>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>
    </div>
  )
}
