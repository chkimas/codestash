import {
  FileCode2,
  Terminal,
  FileJson,
  FileType,
  Cpu,
  Database,
  FileText,
  Code,
  FileCog
} from 'lucide-react'

export function getLanguageIcon(language: string) {
  const lang = language?.toLowerCase().trim() || ''

  // 2. Map aliases to match 'lib/constants.ts' values strictly
  const aliasMap: Record<string, string> = {
    'c++': 'cpp',
    'c#': 'csharp',
    cs: 'csharp',
    vb: 'visualbasic',
    'visual basic': 'visualbasic',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    rs: 'rust',
    golang: 'go',
    sh: 'bash',
    shell: 'bash',
    zsh: 'bash',
    next: 'nextjs',
    'next.js': 'nextjs',
    'react.js': 'react',
    vue: 'vuejs',
    'vue.js': 'vuejs',
    html: 'html5',
    css: 'css3',
    scss: 'sass',
    postgres: 'postgresql'
  }

  const normalizedLang = aliasMap[lang] || lang

  // 3. Switch based on canonical values
  switch (normalizedLang) {
    // --- FRAMEWORKS ---
    case 'nextjs':
      return <i className="devicon-nextjs-plain text-2xl text-black dark:text-white" />
    case 'react':
      return <i className="devicon-react-original colored text-2xl" />
    case 'vuejs':
      return <i className="devicon-vuejs-plain colored text-2xl" />
    case 'svelte':
      return <i className="devicon-svelte-plain colored text-2xl" />
    case 'angular':
      return <i className="devicon-angularjs-plain colored text-2xl" />
    case 'flutter':
      return <i className="devicon-flutter-plain colored text-2xl" />

    // --- LANGUAGES ---
    case 'javascript':
      return <i className="devicon-javascript-plain colored text-2xl" />
    case 'typescript':
      return <i className="devicon-typescript-plain colored text-2xl" />
    case 'python':
      return <i className="devicon-python-plain colored text-2xl" />
    case 'java':
      return <i className="devicon-java-plain colored text-2xl" />
    case 'c':
      return <i className="devicon-c-plain colored text-2xl" />
    case 'cpp': // C++
      return <i className="devicon-cplusplus-plain colored text-2xl" />
    case 'csharp': // C#
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
    case 'lua':
      return <i className="devicon-lua-plain colored text-2xl" />
    case 'perl':
      return <i className="devicon-perl-plain colored text-2xl" />
    case 'scala':
      return <i className="devicon-scala-plain colored text-2xl" />
    case 'elixir':
      return <i className="devicon-elixir-plain colored text-2xl" />
    case 'haskell':
      return <i className="devicon-haskell-plain colored text-2xl" />
    case 'clojure':
      return <i className="devicon-clojure-plain colored text-2xl" />
    case 'solidity':
      return <i className="devicon-solidity-plain text-2xl dark:text-white text-black" />
    case 'zig':
      return <i className="devicon-zig-original colored text-2xl" />
    case 'r':
      return <i className="devicon-r-plain colored text-2xl" />

    // --- MARKUP / STYLES ---
    case 'html5':
      return <i className="devicon-html5-plain colored text-2xl" />
    case 'css3':
      return <i className="devicon-css3-plain colored text-2xl" />
    case 'sass':
      return <i className="devicon-sass-original colored text-2xl" />
    case 'tailwindcss':
      return <i className="devicon-tailwindcss-original colored text-2xl" />

    // --- DATA / CONFIG / INFRA ---
    case 'postgresql':
      return <i className="devicon-postgresql-plain colored text-2xl" />
    case 'sql':
      return <Database className="h-5 w-5 text-blue-500" />
    case 'mysql':
      return <i className="devicon-mysql-plain colored text-2xl" />
    case 'mongodb':
      return <i className="devicon-mongodb-plain colored text-2xl" />
    case 'graphql':
      return <i className="devicon-graphql-plain colored text-2xl" />
    case 'docker':
      return <i className="devicon-docker-plain colored text-2xl" />

    // --- FILES / SCRIPTS ---
    case 'json':
      return <FileJson className="h-5 w-5 text-amber-500" />

    case 'yaml':
      // Red/Purple 'Y' style icon
      return <FileText className="h-5 w-5 text-rose-500" />

    case 'toml':
      // Configuration Gear
      return <FileCog className="h-5 w-5 text-slate-500" />

    case 'xml':
      // Code Brackets
      return <Code className="h-5 w-5 text-orange-600" />

    case 'markdown':
      return <FileType className="h-5 w-5 text-blue-400" />
    case 'bash':
      return <Terminal className="h-5 w-5 text-slate-600 dark:text-slate-400" />
    case 'powershell':
      return <Terminal className="h-5 w-5 text-blue-600" />
    case 'embeddedc':
    case 'assembly':
      return <Cpu className="h-5 w-5 text-orange-500" />

    case 'git':
    case 'github':
      return <i className="devicon-git-plain text-2xl text-black dark:text-white" />

    // --- FALLBACK ---
    default:
      return <FileCode2 className="h-5 w-5 text-muted-foreground" />
  }
}
