export interface LanguageInfo {
  id: string;
  name: string;
  extension: string;
  isWeb?: boolean;
  isRunnable?: boolean;
}

export const languages: LanguageInfo[] = [
  { id: "javascript", name: "JavaScript", extension: ".js", isWeb: true, isRunnable: true },
  { id: "typescript", name: "TypeScript", extension: ".ts", isRunnable: true },
  { id: "python", name: "Python", extension: ".py", isRunnable: true },
  { id: "java", name: "Java", extension: ".java", isRunnable: true },
  { id: "cpp", name: "C++", extension: ".cpp", isRunnable: true },
  { id: "c", name: "C", extension: ".c", isRunnable: true },
  { id: "csharp", name: "C#", extension: ".cs", isRunnable: true },
  { id: "go", name: "Go", extension: ".go", isRunnable: true },
  { id: "rust", name: "Rust", extension: ".rs", isRunnable: true },
  { id: "ruby", name: "Ruby", extension: ".rb", isRunnable: true },
  { id: "php", name: "PHP", extension: ".php", isRunnable: true },
  { id: "swift", name: "Swift", extension: ".swift", isRunnable: true },
  { id: "kotlin", name: "Kotlin", extension: ".kt", isRunnable: true },
  { id: "html", name: "HTML", extension: ".html", isWeb: true, isRunnable: true },
  { id: "css", name: "CSS", extension: ".css", isWeb: true },
  { id: "sql", name: "SQL", extension: ".sql" },
  { id: "json", name: "JSON", extension: ".json" },
  { id: "yaml", name: "YAML", extension: ".yaml" },
  { id: "markdown", name: "Markdown", extension: ".md" },
  { id: "bash", name: "Bash", extension: ".sh", isRunnable: true },
];

export function isWebLanguage(languageId: string): boolean {
  return languageId === 'html' || languageId === 'css';
}

export function needsPreview(languageId: string): boolean {
  return languageId === 'html' || languageId === 'css' || languageId === 'javascript';
}

export function canRunInBrowser(languageId: string): boolean {
  return languageId === 'javascript' || languageId === 'html' || languageId === 'css';
}

export function isRunnableLanguage(languageId: string): boolean {
  const lang = languages.find(l => l.id === languageId);
  return lang?.isRunnable ?? false;
}

export function detectLanguage(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed || trimmed === "// Start typing...") return null;

  // HTML patterns - CHECK FIRST before TypeScript (to avoid <tag> being detected as generics)
  // Strong HTML indicators
  if (/<!DOCTYPE\s+html/i.test(trimmed)) {
    return "html";
  }
  if (/^<html[\s>]/im.test(trimmed)) {
    return "html";
  }
  // HTML document structure
  if (/<head[\s>]|<body[\s>]|<title[\s>]/i.test(trimmed) && /<\/\w+>/.test(trimmed)) {
    return "html";
  }
  // Common HTML tags with closing tags (not self-closing JSX style)
  const htmlBlockTags = /<(div|span|p|h[1-6]|ul|ol|li|table|tr|td|th|form|input|button|a|img|section|article|header|footer|nav|main|aside)[\s>]/i;
  const hasClosingTags = /<\/\w+>/.test(trimmed);
  const hasHtmlAttributes = /\s(class|id|style|href|src|alt|type|name|value|placeholder)=/i.test(trimmed);
  
  if (htmlBlockTags.test(trimmed) && (hasClosingTags || hasHtmlAttributes)) {
    // Make sure it's not JSX (no import/export, no const/let/var declarations at top)
    const hasJsxIndicators = /^(import |export |const |let |var |function )/m.test(trimmed);
    const hasReactPatterns = /React\.|useState|useEffect|className=\{/.test(trimmed);
    if (!hasJsxIndicators && !hasReactPatterns) {
      return "html";
    }
  }

  // PHP patterns - check early as it starts with <
  if (/^<\?php/i.test(trimmed) || /<\?php/i.test(trimmed)) {
    return "php";
  }

  // Python patterns
  if (/^(def |class |import |from .+ import|print\(|if __name__|#.*python)/m.test(trimmed)) {
    return "python";
  }
  if (/^\s*(def |elif |except |lambda |async def)/m.test(trimmed)) {
    return "python";
  }

  // TypeScript patterns (must check before JavaScript)
  // Type annotations with TypeScript-specific types
  if (/:\s*(string|number|boolean|void|any|unknown|never)\b/.test(trimmed)) {
    // But not if it looks like CSS (property: value;)
    if (!/^\s*[\.\#]?\w+\s*\{/m.test(trimmed)) {
      return "typescript";
    }
  }
  // Interface or type declarations
  if (/interface\s+\w+\s*\{/.test(trimmed) || /type\s+\w+\s*=/.test(trimmed)) {
    return "typescript";
  }
  // Generic type parameters in function/class context (not HTML tags)
  // Look for patterns like: function name<T>, Array<T>, Promise<T>
  if (/\w+<\w+>/.test(trimmed) && /:\s*\w+/.test(trimmed) && !/<\/\w+>/.test(trimmed)) {
    return "typescript";
  }

  // JavaScript/JSX patterns
  if (/^(const |let |var |function |import |export |=>\s*\{|console\.)/m.test(trimmed)) {
    // Check if it has TypeScript-specific features
    if (/:\s*(string|number|boolean|void|any|unknown|never)\b/.test(trimmed)) {
      return "typescript";
    }
    return "javascript";
  }
  if (/React\.|useState|useEffect|className=\{/.test(trimmed)) {
    return "javascript";
  }

  // CSS patterns
  if (/^\s*[\.\#]?\w+\s*\{[\s\S]*?\}/m.test(trimmed) && /:.*;/.test(trimmed)) {
    if (/^(body|html|div|span|p|h[1-6]|\.|\#|\*|@media|@keyframes)/m.test(trimmed)) {
      return "css";
    }
  }
  // CSS with properties
  if (/^\s*(@import|@charset|@font-face|@media|@keyframes|\*|body|html|\.[a-zA-Z]|#[a-zA-Z])/m.test(trimmed)) {
    if (/\{[\s\S]*?:[\s\S]*?;[\s\S]*?\}/.test(trimmed)) {
      return "css";
    }
  }

  // JSON patterns
  if (/^\s*[\[\{]/.test(trimmed) && /[\]\}]\s*$/.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {}
  }

  // SQL patterns
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE)\s/im.test(trimmed)) {
    return "sql";
  }

  // Go patterns
  if (/^package\s+\w+|^func\s+\w+|^import\s+\(|fmt\.\w+/.test(trimmed)) {
    return "go";
  }

  // Rust patterns
  if (/^(fn |let mut |impl |struct |enum |use |pub fn|mod )/m.test(trimmed)) {
    return "rust";
  }

  // Java patterns
  if (/^(public class|private class|protected class|package\s+\w+;|import\s+java\.)/m.test(trimmed)) {
    return "java";
  }

  // C/C++ patterns
  if (/^#include\s*[<"]/.test(trimmed)) {
    if (/iostream|vector|string|std::/.test(trimmed)) {
      return "cpp";
    }
    return "c";
  }
  if (/int main\s*\(/.test(trimmed)) {
    if (/cout|cin|std::/.test(trimmed)) {
      return "cpp";
    }
    return "c";
  }

  // C# patterns
  if (/^using\s+System;|^namespace\s+\w+|public\s+class/.test(trimmed)) {
    return "csharp";
  }

  // Ruby patterns
  if (/^(require |gem |def \w+|class \w+ < |end$|puts )/m.test(trimmed)) {
    return "ruby";
  }

  // Bash patterns
  if (/^#!\/bin\/(ba)?sh|^\s*(echo |if \[|for \w+ in|while |done|fi)/m.test(trimmed)) {
    return "bash";
  }

  // YAML patterns
  if (/^\w+:\s*$/m.test(trimmed) && /^\s+-\s+/m.test(trimmed)) {
    return "yaml";
  }

  // Markdown patterns
  if (/^#+ /.test(trimmed) || /^\*\*\w+\*\*/.test(trimmed) || /^\[.+\]\(.+\)/.test(trimmed)) {
    return "markdown";
  }

  return null;
}

export function getLanguageInfo(id: string): LanguageInfo | undefined {
  return languages.find(l => l.id === id);
}

export function getExtension(languageId: string): string {
  const lang = getLanguageInfo(languageId);
  return lang?.extension || ".txt";
}
