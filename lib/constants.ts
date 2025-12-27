export const PROGRAMMING_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'dart', label: 'Dart' },
  { value: 'sql', label: 'SQL' },
  { value: 'html5', label: 'HTML' },
  { value: 'css3', label: 'CSS' },
  { value: 'sass', label: 'SCSS' },
  { value: 'bash', label: 'Shell / Bash' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'toml', label: 'TOML' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'docker', label: 'Dockerfile' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'r', label: 'R' },
  { value: 'lua', label: 'Lua' },
  { value: 'perl', label: 'Perl' },
  { value: 'scala', label: 'Scala' },
  { value: 'elixir', label: 'Elixir' },
  { value: 'haskell', label: 'Haskell' },
  { value: 'clojure', label: 'Clojure' },
  { value: 'embeddedc', label: 'Assembly' },
  { value: 'solidity', label: 'Solidity' },
  { value: 'zig', label: 'Zig' },
  { value: 'vuejs', label: 'Vue' },
  { value: 'react', label: 'React' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'nextjs', label: 'Next.js' }
] as const

// Type-safe language values
export const LANGUAGE_VALUES = PROGRAMMING_LANGUAGES.map(
  (lang) => lang.value
) as (typeof PROGRAMMING_LANGUAGES)[number]['value'][]

// Route Protection
export const PROTECTED_PATHS = ['/settings', '/create'] as const
export const GUEST_ONLY_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/update-password',
  '/verify-mfa'
] as const
export const PUBLIC_PATHS = ['/', '/u', '/explore', '/library'] as const

// Application Limits
export const APP_LIMITS = {
  // Snippet limits
  SNIPPET: {
    TITLE_MAX: 60,
    CODE_MAX: 10000,
    DESCRIPTION_MAX: 500,
    PER_USER_MAX: 100 // Prevent abuse
  },
  // Storage limits
  STORAGE: {
    AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
    ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const
  },
  // Rate limiting
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 60,
    SNIPPET_CREATIONS_PER_HOUR: 20
  },
  // Supabase free tier hard limits
  SUPABASE_FREE_TIER: {
    MAX_ROWS: 500,
    MAX_STORAGE_MB: 1,
    MAX_REQUESTS_PER_SECOND: 10,
    MAX_CONCURRENT_REQUESTS: 5
  }
} as const

// SEO Constants
export const SEO = {
  SITE_NAME: 'CodeStash',
  DEFAULT_TITLE: 'CodeStash - Share and Discover Code Snippets',
  DEFAULT_DESCRIPTION:
    'A platform for developers to save, share, and discover useful code snippets across multiple programming languages.',
  THEME_COLOR: '#3b82f6',
  TWITTER_HANDLE: '@codestash'
} as const

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute for user-specific data
  MEDIUM: 300, // 5 minutes for public snippets
  LONG: 3600, // 1 hour for language lists
  STATIC: 86400 // 24 hours for static assets
} as const

// Error Messages (centralized for consistency)
export const ERROR_MESSAGES = {
  AUTH: {
    UNAUTHORIZED: 'You must be logged in to perform this action.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.'
  },
  SNIPPET: {
    NOT_FOUND: 'Snippet not found.',
    ACCESS_DENIED: 'You do not have permission to edit this snippet.',
    TOO_LARGE: `Code snippet exceeds maximum size of ${APP_LIMITS.SNIPPET.CODE_MAX} characters.`,
    LIMIT_REACHED: `You have reached the limit of ${APP_LIMITS.SNIPPET.PER_USER_MAX} snippets.`
  },
  VALIDATION: {
    REQUIRED: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters.',
    USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores.'
  },
  GENERAL: {
    SERVER_ERROR: 'An unexpected error occurred. Please try again.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.'
  }
} as const

// Feature flags (for gradual rollouts)
export const FEATURE_FLAGS = {
  ENABLE_MFA: true,
  ENABLE_SNIPPET_SHARING: true,
  ENABLE_PROFILE_AVATARS: true,
  ENABLE_ANALYTICS: false // Set to true when you add analytics
} as const

// Helper type for feature flags
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS

// Export type guards for runtime type safety
export const isLanguageValue = (value: string): value is (typeof LANGUAGE_VALUES)[number] => {
  return LANGUAGE_VALUES.includes(value as (typeof LANGUAGE_VALUES)[number])
}

export const isProtectedPath = (pathname: string): boolean => {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export const isGuestOnlyPath = (pathname: string): boolean => {
  return GUEST_ONLY_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export const isPublicPath = (pathname: string): boolean => {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}
