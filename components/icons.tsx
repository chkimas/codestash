import { FileCode2, Terminal } from 'lucide-react'

export function getLanguageIcon(language: string) {
  const lang = language?.toLowerCase() || ''

  const mapping: Record<string, string> = {
    'c++': 'cplusplus',
    cpp: 'cplusplus',
    'c#': 'csharp',
    cs: 'csharp',
    'c-sharp': 'csharp',
    vb: 'visualbasic',
    'visual basic': 'visualbasic',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    go: 'go',
    golang: 'go',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    next: 'nextjs',
    'next.js': 'nextjs',
    'react.js': 'react',
    'vue.js': 'vue',
    html5: 'html',
    css3: 'css'
  }

  const normalizedLang = mapping[lang] || lang

  switch (normalizedLang) {
    case 'nextjs':
      return <i className="devicon-nextjs-plain text-2xl text-black dark:text-white" />

    case 'github':
    case 'git':
      return <i className="devicon-git-plain text-2xl text-black dark:text-white" />

    // --- STANDARD COLORED ICONS ---
    case 'react':
      return <i className="devicon-react-original colored text-2xl" />
    case 'typescript':
      return <i className="devicon-typescript-plain colored text-2xl" />
    case 'javascript':
      return <i className="devicon-javascript-plain colored text-2xl" />
    case 'python':
      return <i className="devicon-python-plain colored text-2xl" />
    case 'java':
      return <i className="devicon-java-plain colored text-2xl" />
    case 'c':
      return <i className="devicon-c-plain colored text-2xl" />
    case 'cplusplus':
      return <i className="devicon-cplusplus-plain colored text-2xl" />
    case 'csharp':
      return <i className="devicon-csharp-plain colored text-2xl" />
    case 'rust':
      return <i className="devicon-rust-plain text-2xl dark:text-white text-black" />
    case 'go':
      return <i className="devicon-go-original-wordmark colored text-2xl" />
    case 'ruby':
      return <i className="devicon-ruby-plain colored text-2xl" />
    case 'php':
      return <i className="devicon-php-plain colored text-2xl" />
    case 'swift':
      return <i className="devicon-swift-plain colored text-2xl" />
    case 'kotlin':
      return <i className="devicon-kotlin-plain colored text-2xl" />
    case 'dart':
      return <i className="devicon-dart-plain colored text-2xl" />
    case 'flutter':
      return <i className="devicon-flutter-plain colored text-2xl" />
    case 'html':
      return <i className="devicon-html5-plain colored text-2xl" />
    case 'css':
      return <i className="devicon-css3-plain colored text-2xl" />
    case 'tailwindcss':
    case 'tailwind':
      return <i className="devicon-tailwindcss-original colored text-2xl" />
    case 'postgresql':
    case 'sql':
      return <i className="devicon-postgresql-plain colored text-2xl" />
    case 'mysql':
      return <i className="devicon-mysql-plain colored text-2xl" />
    case 'mongodb':
      return <i className="devicon-mongodb-plain colored text-2xl" />
    case 'docker':
      return <i className="devicon-docker-plain colored text-2xl" />
    case 'bash':
      return <Terminal className="h-5 w-5 text-neutral-500" />

    // --- FALLBACK ---
    default:
      return <FileCode2 className="h-5 w-5 text-neutral-400" />
  }
}
