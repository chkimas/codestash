import { Code2 } from 'lucide-react'
import { SiJson, SiYaml } from 'react-icons/si'
import { BsFiletypeXml, BsFiletypeKey } from 'react-icons/bs'

export function getLanguageIcon(language: string | undefined | null) {
  if (!language) return <Code2 className="text-slate-500" />

  const langKey = language.toLowerCase()

  switch (langKey) {
    case 'json':
      return <SiJson className="text-yellow-600 text-2xl" />
    case 'yaml':
    case 'yml':
      return <SiYaml className="text-purple-500 text-2xl" />
    case 'xml':
      return <BsFiletypeXml className="text-orange-500 text-2xl" />
    case 'toml':
      return <BsFiletypeKey className="text-slate-600 dark:text-slate-300 text-2xl" />
  }

  const deviconMap: Record<string, string> = {
    cpp: 'cplusplus',
    'c++': 'cplusplus',
    'c#': 'csharp',
    sql: 'postgresql',
    postgres: 'postgresql',
    shell: 'bash',
    vb: 'visualbasic',
    nextjs: 'nextjs',
    node: 'nodejs',
    aws: 'amazonwebservices'
  }

  const iconName = deviconMap[langKey] || langKey

  return (
    <i
      className={`devicon-${iconName}-plain colored text-2xl`}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    />
  )
}
