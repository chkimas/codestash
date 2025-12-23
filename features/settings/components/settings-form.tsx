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
import { Textarea } from '@/components/ui/textarea'

function StatusMessage({ state }: { state: SettingsState }) {
  if (!state) return null
  if (state.error) return <p className="text-xs font-medium text-destructive mt-2">{state.error}</p>
  if (state.message)
    return <p className="text-xs font-medium text-foreground mt-2">{state.message}</p>
  return null
}

export function SettingsForm({
  initialName,
  initialBio,
  email,
  initialImage
}: {
  initialName: string
  initialBio: string
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
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* 1. Public Profile */}
      <section className="space-y-4">
        <div className="pb-2">
          <h2 className="text-base font-semibold text-foreground">Public Profile</h2>
          <p className="text-sm text-muted-foreground">
            This will be displayed on your public snippets.
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
          <form action={profileAction} className="space-y-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
              <Avatar className="h-20 w-20 border border-border shadow-sm">
                <AvatarImage src={preview} className="object-cover" />
                <AvatarFallback className="bg-muted text-lg font-medium text-muted-foreground">
                  {initialName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <Label
                  htmlFor="avatar"
                  className="inline-flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <Upload className="mr-2 h-4 w-4 text-muted-foreground" />
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
                <p className="text-[11px] text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Display Name</Label>
              <Input
                name="name"
                defaultValue={initialName}
                className="h-9 max-w-md bg-background border-border"
              />
              <p className="text-[11px] text-muted-foreground">
                Please use 32 characters at maximum.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Bio / Tagline</Label>
              <Textarea
                name="bio"
                defaultValue={initialBio}
                placeholder="Sharing knowledge through elegant code solutions..."
                className="resize-none bg-background border-border min-h-[80px]"
                maxLength={160}
              />
              <p className="text-[11px] text-muted-foreground flex justify-between">
                <span>Brief description about yourself or showcase your site.</span>
                <span>Max 160 chars.</span>
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-dashed border-border pt-4 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span>Profile visible to others</span>
              </div>
              <div className="flex items-center gap-3">
                <StatusMessage state={profileState} />
                <Button
                  type="submit"
                  disabled={isProfilePending}
                  size="sm"
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isProfilePending ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
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
        <div className="pb-2">
          <h2 className="text-base font-semibold text-foreground">Authentication</h2>
          <p className="text-sm text-muted-foreground">Modify login credentials.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Email panel */}
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <form action={emailAction} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">Email Address</h3>
                <p className="text-xs text-muted-foreground">
                  Change the email address you use to login.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Current email</Label>
                  <Input
                    value={email}
                    disabled
                    className="h-9 bg-muted/50 text-muted-foreground border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">New email</Label>
                  <Input
                    name="email"
                    type="email"
                    required
                    placeholder="new@example.com"
                    className="h-9 bg-background border-border"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Confirm password</Label>
                  <PasswordInput
                    name="currentPassword"
                    required
                    className="h-9 bg-background border-border"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <StatusMessage state={emailState} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={isEmailPending}
                  className="h-8 rounded-full border-border bg-transparent text-xs hover:bg-muted"
                >
                  {isEmailPending ? (
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  ) : (
                    'Update email'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Password panel */}
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
            <form action={passAction} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">Password</h3>
                <p className="text-xs text-muted-foreground">
                  Use a strong, unique password to secure your account.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">Current password</Label>
                  <PasswordInput
                    name="currentPassword"
                    required
                    className="h-9 bg-background border-border"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-foreground">New password</Label>
                  <PasswordInput
                    name="newPassword"
                    required
                    minLength={6}
                    className="h-9 bg-background border-border"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <StatusMessage state={passState} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={isPassPending}
                  className="h-8 rounded-full border-border bg-transparent text-xs hover:bg-muted"
                >
                  {isPassPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Update password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Danger Zone */}
      <section className="space-y-4">
        <div className="pb-2">
          <h2 className="text-base font-semibold text-destructive">Danger Zone</h2>
          <p className="text-sm text-muted-foreground">Irreversible actions for your account.</p>
        </div>

        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Delete account
              </div>
              <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                Permanently remove your account and all content from CodeStash. This action cannot
                be undone.
              </p>
              {deleteState?.error && (
                <p className="mt-1 text-xs font-medium text-destructive">{deleteState.error}</p>
              )}
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isDeletePending}
                  className="h-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Account Deletion</AlertDialogTitle>
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
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
