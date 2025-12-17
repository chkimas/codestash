'use client'

import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeViewerProps {
  code: string
  language: string
  className?: string
}

export function CodeViewer({ code, language, className }: CodeViewerProps) {
  const [isCopied, setIsCopied] = useState(false)

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

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#FEBC2E] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#28C840] shadow-inner" />
          </div>

          <span className="ml-2 font-mono text-xs font-medium text-neutral-400">
            snippet.{safeLanguage === 'c++' ? 'cpp' : safeLanguage}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            'h-7 gap-1.5 rounded-md px-2.5 text-xs font-medium transition-all',
            'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
            isCopied && 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
          )}
        >
          {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </Button>
      </div>

      <div className="relative bg-white text-sm">
        <SyntaxHighlighter
          language={safeLanguage}
          style={oneLight}
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
            color: '#d4d4d4',
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
