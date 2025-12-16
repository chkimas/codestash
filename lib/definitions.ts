import { z } from 'zod'
import { PROGRAMMING_LANGUAGES } from '@/lib/constants'

export type LanguageValue = (typeof PROGRAMMING_LANGUAGES)[number]['value']
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

export interface Snippet {
  id: string
  user_id: string
  title: string
  code: string
  language: LanguageValue
  description?: string | null
  is_public: boolean
  updated_at: string
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
  title: z.string().min(1, 'Title is required').max(60, 'Title must be less than 60 characters'),
  code: z.string().min(10, 'Code snippet is too short').max(10000, 'Code snippet is too large'),
  language: z.string().min(1, 'Language is required'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
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

export const ProfileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(50, 'Name must be less than 50 characters.')
    .optional()
    .or(z.literal('')),
  avatar: z
    .custom<File>((val) => val instanceof File, 'Please upload a file.')
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 2MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    )
    .optional()
    .nullable()
})
