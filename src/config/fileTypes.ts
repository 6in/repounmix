/**
 * ファイルタイプ設定
 * アップロードフィルタとMonaco Editorの言語設定を統合管理
 */

export interface FileTypeConfig {
  /** MIMEタイプ */
  mimeType: string;
  /** Monaco Editorの言語ID */
  monacoLanguage: string;
  /** 説明 */
  description: string;
}

/**
 * 拡張子ベースのファイルタイプ設定
 */
export const FILE_TYPE_CONFIG: Record<string, FileTypeConfig> = {
  // テキスト
  'txt': {
    mimeType: 'text/plain',
    monacoLanguage: 'plaintext',
    description: 'Plain Text'
  },
  'md': {
    mimeType: 'text/markdown',
    monacoLanguage: 'markdown',
    description: 'Markdown'
  },
  'markdown': {
    mimeType: 'text/markdown',
    monacoLanguage: 'markdown',
    description: 'Markdown'
  },
  
  // JavaScript/TypeScript
  'js': {
    mimeType: 'text/javascript',
    monacoLanguage: 'javascript',
    description: 'JavaScript'
  },
  'jsx': {
    mimeType: 'text/javascript',
    monacoLanguage: 'javascript',
    description: 'JavaScript (JSX)'
  },
  'mjs': {
    mimeType: 'text/javascript',
    monacoLanguage: 'javascript',
    description: 'JavaScript (ES Module)'
  },
  'cjs': {
    mimeType: 'text/javascript',
    monacoLanguage: 'javascript',
    description: 'JavaScript (CommonJS)'
  },
  'ts': {
    mimeType: 'text/typescript',
    monacoLanguage: 'typescript',
    description: 'TypeScript'
  },
  'tsx': {
    mimeType: 'text/typescript',
    monacoLanguage: 'typescript',
    description: 'TypeScript (TSX)'
  },
  
  // Web
  'html': {
    mimeType: 'text/html',
    monacoLanguage: 'html',
    description: 'HTML'
  },
  'htm': {
    mimeType: 'text/html',
    monacoLanguage: 'html',
    description: 'HTML'
  },
  'css': {
    mimeType: 'text/css',
    monacoLanguage: 'css',
    description: 'CSS'
  },
  'scss': {
    mimeType: 'text/x-scss',
    monacoLanguage: 'scss',
    description: 'SCSS'
  },
  'sass': {
    mimeType: 'text/x-sass',
    monacoLanguage: 'sass',
    description: 'Sass'
  },
  'less': {
    mimeType: 'text/x-less',
    monacoLanguage: 'less',
    description: 'Less'
  },
  'vue': {
    mimeType: 'text/x-vue',
    monacoLanguage: 'html',
    description: 'Vue'
  },
  'svelte': {
    mimeType: 'text/x-svelte',
    monacoLanguage: 'html',
    description: 'Svelte'
  },
  
  // Python
  'py': {
    mimeType: 'text/x-python',
    monacoLanguage: 'python',
    description: 'Python'
  },
  'pyw': {
    mimeType: 'text/x-python',
    monacoLanguage: 'python',
    description: 'Python (Windows)'
  },
  
  // Ruby
  'rb': {
    mimeType: 'text/x-ruby',
    monacoLanguage: 'ruby',
    description: 'Ruby'
  },
  'rake': {
    mimeType: 'text/x-ruby',
    monacoLanguage: 'ruby',
    description: 'Rakefile'
  },
  
  // Go
  'go': {
    mimeType: 'text/x-go',
    monacoLanguage: 'go',
    description: 'Go'
  },
  'mod': {
    mimeType: 'text/x-go-mod',
    monacoLanguage: 'go',
    description: 'Go Module'
  },
  'sum': {
    mimeType: 'text/x-go-sum',
    monacoLanguage: 'plaintext',
    description: 'Go Checksum'
  },
  
  // Rust
  'rs': {
    mimeType: 'text/x-rust',
    monacoLanguage: 'rust',
    description: 'Rust'
  },
  
  // Java
  'java': {
    mimeType: 'text/x-java',
    monacoLanguage: 'java',
    description: 'Java'
  },
  
  // C/C++
  'c': {
    mimeType: 'text/x-c',
    monacoLanguage: 'c',
    description: 'C'
  },
  'h': {
    mimeType: 'text/x-c',
    monacoLanguage: 'c',
    description: 'C Header'
  },
  'cpp': {
    mimeType: 'text/x-c++',
    monacoLanguage: 'cpp',
    description: 'C++'
  },
  'hpp': {
    mimeType: 'text/x-c++',
    monacoLanguage: 'cpp',
    description: 'C++ Header'
  },
  'cc': {
    mimeType: 'text/x-c++',
    monacoLanguage: 'cpp',
    description: 'C++'
  },
  'cxx': {
    mimeType: 'text/x-c++',
    monacoLanguage: 'cpp',
    description: 'C++'
  },
  
  // C#
  'cs': {
    mimeType: 'text/x-csharp',
    monacoLanguage: 'csharp',
    description: 'C#'
  },
  
  // PHP
  'php': {
    mimeType: 'text/x-php',
    monacoLanguage: 'php',
    description: 'PHP'
  },
  
  // Swift
  'swift': {
    mimeType: 'text/x-swift',
    monacoLanguage: 'swift',
    description: 'Swift'
  },
  
  // Kotlin
  'kt': {
    mimeType: 'text/x-kotlin',
    monacoLanguage: 'kotlin',
    description: 'Kotlin'
  },
  'kts': {
    mimeType: 'text/x-kotlin',
    monacoLanguage: 'kotlin',
    description: 'Kotlin Script'
  },
  
  // Scala
  'scala': {
    mimeType: 'text/x-scala',
    monacoLanguage: 'scala',
    description: 'Scala'
  },
  
  // データ形式
  'json': {
    mimeType: 'application/json',
    monacoLanguage: 'json',
    description: 'JSON'
  },
  'jsonc': {
    mimeType: 'application/json',
    monacoLanguage: 'json',
    description: 'JSON with Comments'
  },
  'xml': {
    mimeType: 'application/xml',
    monacoLanguage: 'xml',
    description: 'XML'
  },
  'yaml': {
    mimeType: 'text/yaml',
    monacoLanguage: 'yaml',
    description: 'YAML'
  },
  'yml': {
    mimeType: 'text/yaml',
    monacoLanguage: 'yaml',
    description: 'YAML'
  },
  'toml': {
    mimeType: 'text/x-toml',
    monacoLanguage: 'ini',
    description: 'TOML'
  },
  'ini': {
    mimeType: 'text/x-ini',
    monacoLanguage: 'ini',
    description: 'INI'
  },
  'conf': {
    mimeType: 'text/plain',
    monacoLanguage: 'ini',
    description: 'Configuration'
  },
  'config': {
    mimeType: 'text/plain',
    monacoLanguage: 'ini',
    description: 'Configuration'
  },
  
  // シェル・スクリプト
  'sh': {
    mimeType: 'text/x-sh',
    monacoLanguage: 'shell',
    description: 'Shell Script'
  },
  'bash': {
    mimeType: 'text/x-sh',
    monacoLanguage: 'shell',
    description: 'Bash Script'
  },
  'zsh': {
    mimeType: 'text/x-sh',
    monacoLanguage: 'shell',
    description: 'Zsh Script'
  },
  'fish': {
    mimeType: 'text/x-sh',
    monacoLanguage: 'shell',
    description: 'Fish Script'
  },
  'ps1': {
    mimeType: 'text/x-powershell',
    monacoLanguage: 'powershell',
    description: 'PowerShell'
  },
  'bat': {
    mimeType: 'text/x-bat',
    monacoLanguage: 'bat',
    description: 'Batch File'
  },
  'cmd': {
    mimeType: 'text/x-bat',
    monacoLanguage: 'bat',
    description: 'Command File'
  },
  
  // SQL
  'sql': {
    mimeType: 'text/x-sql',
    monacoLanguage: 'sql',
    description: 'SQL'
  },
  
  // GraphQL
  'graphql': {
    mimeType: 'text/x-graphql',
    monacoLanguage: 'graphql',
    description: 'GraphQL'
  },
  'gql': {
    mimeType: 'text/x-graphql',
    monacoLanguage: 'graphql',
    description: 'GraphQL'
  },
  
  // その他
  'svg': {
    mimeType: 'image/svg+xml',
    monacoLanguage: 'xml',
    description: 'SVG'
  },
  'log': {
    mimeType: 'text/plain',
    monacoLanguage: 'plaintext',
    description: 'Log File'
  },
  'env': {
    mimeType: 'text/plain',
    monacoLanguage: 'ini',
    description: 'Environment Variables'
  },
  'gitignore': {
    mimeType: 'text/plain',
    monacoLanguage: 'plaintext',
    description: 'Git Ignore'
  },
  'editorconfig': {
    mimeType: 'text/plain',
    monacoLanguage: 'ini',
    description: 'Editor Config'
  },
  'eslintrc': {
    mimeType: 'application/json',
    monacoLanguage: 'json',
    description: 'ESLint Config'
  },
  'prettierrc': {
    mimeType: 'application/json',
    monacoLanguage: 'json',
    description: 'Prettier Config'
  },
};

/**
 * 特殊なファイル名の設定（拡張子なし）
 */
export const SPECIAL_FILE_CONFIG: Record<string, FileTypeConfig> = {
  'Makefile': {
    mimeType: 'text/x-makefile',
    monacoLanguage: 'makefile',
    description: 'Makefile'
  },
  'Dockerfile': {
    mimeType: 'text/x-dockerfile',
    monacoLanguage: 'dockerfile',
    description: 'Dockerfile'
  },
  'Rakefile': {
    mimeType: 'text/x-ruby',
    monacoLanguage: 'ruby',
    description: 'Rakefile'
  },
  'Gemfile': {
    mimeType: 'text/x-ruby',
    monacoLanguage: 'ruby',
    description: 'Gemfile'
  },
  'Procfile': {
    mimeType: 'text/plain',
    monacoLanguage: 'plaintext',
    description: 'Procfile'
  },
  'LICENSE': {
    mimeType: 'text/plain',
    monacoLanguage: 'plaintext',
    description: 'License'
  },
  'README': {
    mimeType: 'text/markdown',
    monacoLanguage: 'markdown',
    description: 'README'
  },
  'CHANGELOG': {
    mimeType: 'text/markdown',
    monacoLanguage: 'markdown',
    description: 'Changelog'
  },
  'CONTRIBUTING': {
    mimeType: 'text/markdown',
    monacoLanguage: 'markdown',
    description: 'Contributing Guide'
  },
};

/**
 * 除外するディレクトリ・ファイルのパターン
 */
export const EXCLUDE_PATTERNS = [
  '.git',
  '.svn',
  '.hg',
  'node_modules',
  '.DS_Store',
  'Thumbs.db',
  '__pycache__',
  '.pytest_cache',
  '.venv',
  'venv',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'coverage',
  '.cache',
  'target', // Rust
  'bin', // 一般的なバイナリディレクトリ
  'obj', // C#
];

/**
 * 許可されたドットファイル
 */
export const ALLOWED_DOT_FILES = [
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.json',
  '.prettierrc',
  '.prettierrc.js',
  '.prettierrc.json',
  '.env',
  '.env.example',
  '.env.local',
  '.env.development',
  '.env.production',
  '.nvmrc',
  '.npmrc',
  '.yarnrc',
  '.babelrc',
  '.babelrc.js',
  '.babelrc.json',
];

/**
 * MIME_TYPESマップを生成（後方互換性のため）
 */
export const MIME_TYPES: Record<string, string> = Object.entries(FILE_TYPE_CONFIG).reduce(
  (acc, [ext, config]) => {
    acc[ext] = config.mimeType;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * ファイルタイプ設定を取得
 */
export function getFileTypeConfig(fileName: string): FileTypeConfig {
  // 1. 特殊なファイル名（拡張子なし）
  const fileNameUpper = fileName.toUpperCase();
  for (const [specialName, config] of Object.entries(SPECIAL_FILE_CONFIG)) {
    if (fileNameUpper === specialName.toUpperCase() || fileNameUpper.startsWith(specialName.toUpperCase())) {
      return config;
    }
  }

  // 2. 拡張子ベース
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext && ext in FILE_TYPE_CONFIG) {
    return FILE_TYPE_CONFIG[ext];
  }

  // 3. デフォルト
  return {
    mimeType: 'text/plain',
    monacoLanguage: 'plaintext',
    description: 'Plain Text'
  };
}

/**
 * MIMEタイプからMonaco言語IDを取得
 */
export function getMonacoLanguageFromMimeType(mimeType: string): string {
  for (const config of Object.values(FILE_TYPE_CONFIG)) {
    if (config.mimeType === mimeType) {
      return config.monacoLanguage;
    }
  }
  
  for (const config of Object.values(SPECIAL_FILE_CONFIG)) {
    if (config.mimeType === mimeType) {
      return config.monacoLanguage;
    }
  }
  
  return 'plaintext';
}

/**
 * サポートされている拡張子のリストを取得
 */
export function getSupportedExtensions(): string[] {
  return Object.keys(FILE_TYPE_CONFIG);
}

/**
 * サポートされているファイルタイプの説明を取得
 */
export function getSupportedFileTypes(): Array<{ ext: string; description: string }> {
  return Object.entries(FILE_TYPE_CONFIG).map(([ext, config]) => ({
    ext,
    description: config.description
  }));
}