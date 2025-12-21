'use client'

import { useState, useEffect } from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism'
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface CodeViewerProps {
  code: string
  language: string
  className?: string
}

export function CodeViewer({ code, language, className }: CodeViewerProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const normalizeLanguage = (lang: string) => {
    const lower = lang.toLowerCase()
    const map: Record<string, string> = {
      'next.js': 'tsx',
      nextjs: 'tsx',
      react: 'tsx',
      vue: 'html',
      'c++': 'cpp',
      'c#': 'csharp',
      shell: 'bash',
      sh: 'bash'
    }
    return map[lower] || lower
  }

  const safeLanguage = normalizeLanguage(language)
  const syntaxTheme = mounted && resolvedTheme === 'dark' ? oneDark : oneLight

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/40 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#28C840] shadow-inner" />
          </div>

          <span className="ml-2 font-mono text-xs font-medium text-muted-foreground">
            snippet.{safeLanguage === 'c++' ? 'cpp' : safeLanguage}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            'h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all',
            'text-muted-foreground hover:bg-muted hover:text-foreground',
            isCopied && 'text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20'
          )}
        >
          {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>

      <div className="relative bg-background/50 text-sm">
        <SyntaxHighlighter
          language={safeLanguage}
          style={syntaxTheme}
          showLineNumbers={true}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace'
          }}
          codeTagProps={{
            style: { background: 'transparent' }
          }}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1.5em',
            color: mounted && resolvedTheme === 'dark' ? '#6e7681' : '#d4d4d4',
            textAlign: 'right',
            userSelect: 'none'
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}
