export interface LanguageInfo {
  id: string;
  name: string;
  extension: string;
}

export const languages: LanguageInfo[] = [
  { id: "javascript", name: "JavaScript", extension: ".js" },
  { id: "typescript", name: "TypeScript", extension: ".ts" },
  { id: "python", name: "Python", extension: ".py" },
  { id: "java", name: "Java", extension: ".java" },
  { id: "cpp", name: "C++", extension: ".cpp" },
  { id: "c", name: "C", extension: ".c" },
  { id: "csharp", name: "C#", extension: ".cs" },
  { id: "go", name: "Go", extension: ".go" },
  { id: "rust", name: "Rust", extension: ".rs" },
  { id: "ruby", name: "Ruby", extension: ".rb" },
  { id: "php", name: "PHP", extension: ".php" },
  { id: "swift", name: "Swift", extension: ".swift" },
  { id: "kotlin", name: "Kotlin", extension: ".kt" },
  { id: "html", name: "HTML", extension: ".html" },
  { id: "css", name: "CSS", extension: ".css" },
  { id: "sql", name: "SQL", extension: ".sql" },
  { id: "json", name: "JSON", extension: ".json" },
  { id: "yaml", name: "YAML", extension: ".yaml" },
  { id: "markdown", name: "Markdown", extension: ".md" },
  { id: "bash", name: "Bash", extension: ".sh" },
];

export function detectLanguage(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed || trimmed === "// Start typing...") return null;

  // Python patterns
  if (/^(def |class |import |from .+ import|print\(|if __name__|#.*python)/m.test(trimmed)) {
    return "python";
  }
  if (/^\s*(def |elif |except |lambda |async def)/m.test(trimmed)) {
    return "python";
  }

  // TypeScript patterns (must check before JavaScript)
  if (/:\s*(string|number|boolean|void|any|unknown|never)\b/.test(trimmed)) {
    return "typescript";
  }
  if (/interface\s+\w+\s*\{/.test(trimmed) || /type\s+\w+\s*=/.test(trimmed)) {
    return "typescript";
  }
  if (/<\w+>/.test(trimmed) && /:\s*\w+/.test(trimmed)) {
    return "typescript";
  }

  // JavaScript/JSX patterns
  if (/^(const |let |var |function |import |export |=>\s*\{|console\.)/m.test(trimmed)) {
    return "javascript";
  }
  if (/React\.|useState|useEffect|<\w+\s*\/?>/.test(trimmed)) {
    return "javascript";
  }

  // HTML patterns
  if (/^<!DOCTYPE|^<html|^<head|^<body|^<div|^<p|^<h[1-6]/im.test(trimmed)) {
    return "html";
  }

  // CSS patterns
  if (/^\s*[\.\#]?\w+\s*\{[\s\S]*?\}/m.test(trimmed) && /:.*;/.test(trimmed)) {
    if (/^(body|html|div|span|p|h[1-6]|\.|\#|\*|@media|@keyframes)/m.test(trimmed)) {
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

  // PHP patterns
  if (/^<\?php|^\$\w+\s*=/.test(trimmed)) {
    return "php";
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
