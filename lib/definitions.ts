import { z } from 'zod'
import { PROGRAMMING_LANGUAGES } from '@/lib/constants'
export type LanguageValue = (typeof PROGRAMMING_LANGUAGES)[number]['value']

export interface Snippet {
  id: string
  user_id: string
  title: string
  code: string
  language: LanguageValue
  description?: string | null
  is_public: boolean
  created_at: string
  author_name?: string
  author_image?: string
  is_favorited?: boolean
  favorite_count?: number
}

export type User = {
  id: string
  name: string
  email: string
  password: string
}

export const CreateSnippetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  code: z.string().min(1, 'Code is required').max(5000),
  language: z.enum(
    PROGRAMMING_LANGUAGES.map((l) => l.value) as [LanguageValue, ...LanguageValue[]]
  ),
  description: z.string().optional(),
  is_public: z.boolean()
})

export const RegisterSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Be at least 6 characters long.' }),
    confirmPassword: z.string().min(6, { message: 'Must be at least 6 characters.' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  })
