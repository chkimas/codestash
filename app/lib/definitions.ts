import { z } from 'zod'
import { LANGUAGE_VALUES } from '@/app/lib/constants'

// 1. The Shape of the Data in the Database
export type Snippet = {
  id: string
  user_id: string
  title: string
  code: string
  language: (typeof LANGUAGE_VALUES)[number]
  description?: string // Optional
  is_public: boolean
  created_at: string
}

export type User = {
  id: string
  name: string
  email: string
  password: string
}

// 2. Zod Schema for Validation (Used in Forms)
export const CreateSnippetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  code: z.string().min(1, 'Code is required').max(5000),
  language: z.enum(LANGUAGE_VALUES),
  description: z.string().optional(),
  is_public: z.boolean()
})
