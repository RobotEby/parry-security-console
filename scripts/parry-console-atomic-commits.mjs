#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import path from "node:path";
import process, { stdin as input, stdout as output } from "node:process";
import readline from "node:readline/promises";

const SCRIPT_NAME = "parry-console-atomic-commits";
const REPO_NAME = "parry-security-console";
const VALID_TYPES = new Set([
  "feat",
  "fix",
  "chore",
  "refactor",
  "style",
  "docs",
  "test",
  "build",
  "ci",
  "perf",
  "revert",
]);
const LANGUAGES = new Set(["en", "pt-br"]);
const ENV_EXAMPLES = new Set([
  ".env.example",
  ".env.local.example",
  ".env.production.example",
  ".env.staging.example",
  ".env.test.example",
]);
const ROOT_BUILD_CONFIG_FILES = new Set([
  "package.json",
  "package-lock.json",
  "vite.config.ts",
  "vitest.config.ts",
  "tsconfig.json",
  "eslint.config.js",
  ".prettierrc",
  ".prettierignore",
  "components.json",
  "index.html",
]);
const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".cache",
  ".turbo",
  "logs",
  "tmp",
  "temp",
  "test-results",
]);
const LOCAL_DATA_EXTENSIONS = new Set([".sqlite", ".sqlite3", ".db", ".dump", ".backup", ".bak"]);
const FIX_SIGNALS = [
  "fix",
  "bug",
  "correct",
  "prevent",
  "resolve",
  "validate",
  "validation",
  "invalid",
  "error",
  "failure",
  "fallback",
  "redact",
  "sensitive",
  "token",
  "undefined",
  "null",
  "regression",
  "security",
];
const STYLE_SIGNALS = [
  "classname",
  "tailwind",
  "css",
  "styles.css",
  "layout",
  "spacing",
  "color",
  "theme",
  "responsive",
  "mobile",
];
const PERF_SIGNALS = [
  "memo",
  "usememo",
  "usecallback",
  "lazy",
  "suspense",
  "cache",
  "staletime",
  "pagination",
  "debounce",
  "virtual",
  "optimize",
  "performance",
];
const SAFE_SECRET_VALUES = [
  "example",
  "placeholder",
  "changeme",
  "change-me",
  "your-token",
  "your_api_key",
  "localhost",
  "127.0.0.1",
  "process.env",
  "import.meta.env",
  "must-not-survive",
  "demo",
  "mock",
];

const HIGHLIGHTS = {
  adminValidation: {
    en: "Improves Admin API response validation before rendering.",
    "pt-br": "Melhora a validação de respostas do Admin API antes da renderização.",
  },
  redaction: {
    en: "Improves sensitive metadata redaction in the console.",
    "pt-br": "Melhora a redação de metadados sensíveis no console.",
  },
  threatFiltering: {
    en: "Improves threat event filtering and investigation flow.",
    "pt-br": "Melhora o fluxo de filtros e investigação de eventos de ameaça.",
  },
  dashboardVisibility: {
    en: "Improves dashboard visibility for security metrics.",
    "pt-br": "Melhora a visibilidade do dashboard para métricas de segurança.",
  },
  responsive: {
    en: "Improves responsive behavior across console pages.",
    "pt-br": "Melhora o comportamento responsivo entre páginas do console.",
  },
  uiConsistency: {
    en: "Improves reusable UI consistency across the application.",
    "pt-br": "Melhora a consistência da UI reutilizável na aplicação.",
  },
  validationCoverage: {
    en: "Adds validation coverage for safer future refactors.",
    "pt-br": "Adiciona cobertura de validação para refatorações futuras mais seguras.",
  },
  documentation: {
    en: "Improves project documentation and developer onboarding.",
    "pt-br": "Melhora a documentação do projeto e o onboarding de desenvolvimento.",
  },
  buildReliability: {
    en: "Improves build, lint, or test reliability.",
    "pt-br": "Melhora a confiabilidade de build, lint ou testes.",
  },
  designMaintainability: {
    en: "Keeps the design system easier to review and maintain.",
    "pt-br": "Mantém o design system mais fácil de revisar e manter.",
  },
  settingsSafety: {
    en: "Improves API connection settings safety for local and demo modes.",
    "pt-br": "Melhora a segurança das configurações de conexão da API em modos local e demo.",
  },
};

function printHelp() {
  console.log(
    `
${SCRIPT_NAME}

Creates one focused Conventional Commit per eligible changed file in ${REPO_NAME}.

Usage:
  node scripts/parry-console-atomic-commits.mjs [options]
  npm run commit:atomic -- [options]

Options:
  --dry-run             Print the commit plan without staging or committing.
  --yes, -y             Approve every generated commit automatically.
  --include-deleted     Include deleted files. Deleted files are ignored by default.
  --include-env         Include real .env files after secret scanning.
  --pt-br               Generate commit bodies in Portuguese.
  --en                  Generate commit bodies in English.
  --language <lang>     Generate commit bodies in en or pt-br.
  --help, -h            Show this help.

Examples:
  npm run commit:atomic -- --dry-run
  npm run commit:atomic
  npm run commit:atomic -- --yes
  npm run commit:atomic -- --pt-br
`.trim(),
  );
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    autoApprove: false,
    includeDeleted: false,
    includeEnv: false,
    language: "en",
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--yes" || arg === "-y") {
      options.autoApprove = true;
    } else if (arg === "--include-deleted") {
      options.includeDeleted = true;
    } else if (arg === "--include-env") {
      options.includeEnv = true;
    } else if (arg === "--pt-br") {
      options.language = "pt-br";
    } else if (arg === "--en") {
      options.language = "en";
    } else if (arg === "--language") {
      const language = argv[index + 1];
      if (!LANGUAGES.has(language)) {
        throw new CliError(`Invalid language: ${language ?? "(missing)"}`);
      }
      options.language = language;
      index += 1;
    } else if (arg.startsWith("--language=")) {
      const language = arg.slice("--language=".length);
      if (!LANGUAGES.has(language)) {
        throw new CliError(`Invalid language: ${language}`);
      }
      options.language = language;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else {
      throw new CliError(`Unknown option: ${arg}`);
    }
  }

  return options;
}

class CliError extends Error {}

function runGit(args, cwd, options = {}) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });

  if (result.status !== 0) {
    const stderr = (result.stderr ?? "").trim();
    const stdout = (result.stdout ?? "").trim();
    const details = stderr || stdout || `git exited with status ${result.status}`;
    throw new Error(`git ${args.join(" ")} failed: ${details}`);
  }

  return result.stdout ?? "";
}

function tryGit(args, cwd) {
  const result = spawnSync("git", args, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    status: result.status ?? 1,
  };
}

function slash(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function normalizeRelative(relativePath) {
  return slash(relativePath).replace(/^\.\//, "");
}

function sortEntries(entries) {
  return [...entries].sort((left, right) => {
    const leftKey = left.oldPath ? `${left.oldPath}\0${left.path}` : left.path;
    const rightKey = right.oldPath ? `${right.oldPath}\0${right.path}` : right.path;
    return leftKey.localeCompare(rightKey);
  });
}

function parsePorcelainStatus(output) {
  const chunks = output.split("\0").filter(Boolean);
  const entries = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    if (chunk.length < 4) continue;
    const status = chunk.slice(0, 2);
    const filePath = normalizeRelative(chunk.slice(3));
    let oldPath;

    if (status.includes("R") || status.includes("C")) {
      oldPath = normalizeRelative(chunks[index + 1] ?? "");
      index += 1;
    }

    entries.push({
      status,
      path: filePath,
      oldPath,
    });
  }

  return entries;
}

function parseNameStatus(output) {
  const chunks = output.split("\0").filter(Boolean);
  const paths = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const status = chunks[index];
    if (status.startsWith("R") || status.startsWith("C")) {
      paths.push(normalizeRelative(chunks[index + 1] ?? ""));
      paths.push(normalizeRelative(chunks[index + 2] ?? ""));
      index += 2;
    } else {
      paths.push(normalizeRelative(chunks[index + 1] ?? ""));
      index += 1;
    }
  }

  return paths.filter(Boolean);
}

function isDirectory(root, relativePath) {
  try {
    return lstatSync(path.join(root, relativePath)).isDirectory();
  } catch {
    return false;
  }
}

function isDeleted(entry) {
  return entry.status.includes("D") && !entry.status.includes("R");
}

function isRename(entry) {
  return Boolean(entry.oldPath) && entry.status.includes("R");
}

function isUntracked(entry) {
  return entry.status === "??";
}

function isEnvFile(relativePath) {
  const base = path.posix.basename(relativePath);
  return base === ".env" || base.startsWith(".env.");
}

function isAllowedEnvExample(relativePath) {
  return ENV_EXAMPLES.has(path.posix.basename(relativePath));
}

function isRootBuildConfig(relativePath) {
  return !relativePath.includes("/") && ROOT_BUILD_CONFIG_FILES.has(relativePath);
}

function hasIgnoredDirectory(relativePath) {
  const parts = relativePath.split("/");
  return parts.some((part) => IGNORED_DIRS.has(part));
}

function ignoreReason(entry, options) {
  const filePath = entry.path;
  const base = path.posix.basename(filePath);
  const ext = path.posix.extname(filePath).toLowerCase();

  if (isDeleted(entry) && !options.includeDeleted) {
    return "deleted file requires --include-deleted";
  }
  if (hasIgnoredDirectory(filePath)) {
    return "generated, dependency, cache, log, or temporary directory";
  }
  if (base.endsWith(".log")) {
    return "log file";
  }
  if (LOCAL_DATA_EXTENSIONS.has(ext)) {
    return "local database, dump, or backup file";
  }
  if (isEnvFile(filePath) && !isAllowedEnvExample(filePath) && !options.includeEnv) {
    return "real env file requires --include-env";
  }

  return "";
}

function collectFiles(root, relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  const files = [];
  const stack = [absoluteDirectory];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;
    for (const dirent of readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, dirent.name);
      const relativePath = normalizeRelative(path.relative(root, absolutePath));
      if (hasIgnoredDirectory(relativePath)) continue;
      if (dirent.isDirectory()) {
        stack.push(absolutePath);
      } else if (dirent.isFile()) {
        files.push(relativePath);
      }
    }
  }

  return files.sort((left, right) => left.localeCompare(right));
}

function listUntrackedFiles(root, relativePath) {
  const output = runGit(
    ["ls-files", "--others", "--exclude-standard", "-z", "--", relativePath],
    root,
  );
  return output
    .split("\0")
    .filter(Boolean)
    .map(normalizeRelative)
    .sort((left, right) => left.localeCompare(right));
}

function expandEntries(root, entries) {
  const expanded = [];

  for (const entry of entries) {
    if (isUntracked(entry) && isDirectory(root, entry.path)) {
      const files = listUntrackedFiles(root, entry.path);
      const fallbackFiles = files.length > 0 ? files : collectFiles(root, entry.path);
      for (const filePath of fallbackFiles) {
        expanded.push({ status: "??", path: filePath });
      }
    } else {
      expanded.push(entry);
    }
  }

  return uniqueEntries(sortEntries(expanded));
}

function discoverEnvCandidates(root, existingEntries) {
  const known = new Set(existingEntries.map((entry) => entry.path));
  const envEntries = [];
  const stack = [root];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) continue;

    for (const dirent of readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, dirent.name);
      const relativePath = normalizeRelative(path.relative(root, absolutePath));
      if (hasIgnoredDirectory(relativePath)) continue;

      if (dirent.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }
      if (!dirent.isFile() || !isEnvFile(relativePath) || known.has(relativePath)) continue;

      envEntries.push({
        status: "??",
        path: relativePath,
        discoveredByIncludeEnv: true,
      });
    }
  }

  return sortEntries(envEntries);
}

function uniqueEntries(entries) {
  const seen = new Set();
  const outputEntries = [];

  for (const entry of entries) {
    const key = `${entry.status}\0${entry.oldPath ?? ""}\0${entry.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    outputEntries.push(entry);
  }

  return outputEntries;
}

function scanSecrets(root, entry) {
  if (isDeleted(entry)) return "";

  const absolutePath = path.join(root, entry.path);
  if (!existsSync(absolutePath)) return "file is missing from disk";

  const buffer = readFileSync(absolutePath);
  const text = buffer.toString("utf8");
  const checks = [
    [/(-----BEGIN [A-Z ]*PRIVATE KEY-----)/, "private key block"],
    [/\b(A3T[A-Z0-9]|AKIA|ASIA)[A-Z0-9]{16}\b/, "AWS access key"],
    [/\bgh[pousr]_[A-Za-z0-9_]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b/i, "GitHub token"],
    [/\bxox[abprs]-[A-Za-z0-9-]{20,}\b/i, "Slack token"],
    [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/, "JWT"],
  ];

  for (const [pattern, reason] of checks) {
    if (pattern.test(text)) return `possible secret detected: ${reason}`;
  }

  const sensitiveAssignment = findSensitiveAssignment(text);
  if (sensitiveAssignment) {
    return `possible secret detected: ${sensitiveAssignment}`;
  }

  return "";
}

function findSensitiveAssignment(text) {
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("//") || line.startsWith("*")) continue;

    const parsed = parsePotentialSecretAssignment(line);
    if (!parsed || !isSensitiveKeyName(parsed.key)) continue;

    const value = cleanupSecretValue(parsed.value);
    if (!parsed.staticValue && isCodeExpressionValue(value)) continue;

    if (!isSafeSecretValue(value)) {
      const key = parsed.key.replace(/^.*[/.]/, "");
      return `${key} has a non-placeholder value`;
    }
  }

  return "";
}

function parsePotentialSecretAssignment(line) {
  const envMatch = line.match(/^\s*([A-Z][A-Z0-9_]*[A-Z0-9])\s*=\s*(.*)$/);
  if (envMatch) {
    return { key: envMatch[1], value: envMatch[2], staticValue: true };
  }

  const jsMatch = line.match(
    /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(.+)$/,
  );
  if (jsMatch) {
    return { key: jsMatch[1], value: jsMatch[2], staticValue: startsWithStringLiteral(jsMatch[2]) };
  }

  const quotedObjectMatch = line.match(/^\s*["']([^"']+)["']\s*:\s*(.+)$/);
  if (quotedObjectMatch) {
    return {
      key: quotedObjectMatch[1],
      value: quotedObjectMatch[2],
      staticValue: startsWithStringLiteral(quotedObjectMatch[2]),
    };
  }

  const yamlMatch = line.match(/^\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*:\s*(.+)$/);
  if (yamlMatch) {
    return {
      key: yamlMatch[1],
      value: yamlMatch[2],
      staticValue: startsWithStringLiteral(yamlMatch[2]),
    };
  }

  return null;
}

function isSensitiveKeyName(key) {
  const normalized = key.replace(/[^A-Za-z0-9]+/g, "_").toUpperCase();
  const parts = normalized.split("_").filter(Boolean);
  const lower = key.toLowerCase();

  if (
    parts.includes("PASSWORD") ||
    parts.includes("PASSWD") ||
    parts.includes("SECRET") ||
    parts.includes("TOKEN")
  ) {
    return true;
  }
  if (normalized.includes("API_KEY") || normalized.includes("PRIVATE_KEY")) return true;
  if (normalized.includes("DATABASE_URL") || normalized.includes("DB_URL")) return true;
  if (normalized.includes("JWT_SECRET")) return true;
  if (/(password|passwd|secret|token)$/i.test(key)) return true;
  if (/(apiKey|privateKey|databaseUrl|dbUrl|jwtSecret)$/i.test(key)) return true;
  return /(^|[_.-])(password|passwd|secret|token|api[-_]?key|private[-_]?key|database[-_]?url|db[-_]?url|jwt[-_]?secret)([_.-]|$)/i.test(
    lower,
  );
}

function startsWithStringLiteral(value) {
  return /^['"`]/.test(value.trim());
}

function isCodeExpressionValue(value) {
  const trimmed = value.trim();
  if (!trimmed || startsWithStringLiteral(trimmed)) return false;
  if (trimmed.includes("process.env") || trimmed.includes("import.meta.env")) return true;
  if (/\b(undefined|null|true|false)\b/.test(trimmed)) return true;
  return /[?.(){}[\]|&]/.test(trimmed);
}

function cleanupSecretValue(rawValue) {
  return rawValue
    .replace(/\s+#.*$/, "")
    .replace(/\s+\/\/.*$/, "")
    .replace(/[,;]\s*$/, "")
    .trim()
    .replace(/^['"`]/, "")
    .replace(/['"`]$/, "")
    .trim();
}

function isSafeSecretValue(value) {
  if (!value) return true;
  const normalized = value.toLowerCase();
  if (normalized.length < 12) return true;
  if (normalized.startsWith("${") && normalized.endsWith("}")) return true;
  if (normalized.startsWith("<") && normalized.endsWith(">")) return true;
  if (/^\$\{?[a-z_][a-z0-9_]*\}?$/i.test(value)) return true;
  return SAFE_SECRET_VALUES.some((safeValue) => normalized.includes(safeValue));
}

function classifyDomain(relativePath) {
  const isTestPath =
    relativePath.startsWith("src/test/") ||
    relativePath.includes("/__tests__/") ||
    /(?:^|[.-])(test|spec)\.[cm]?[tj]sx?$/i.test(relativePath);

  if (isTestPath) {
    return {
      key: "test",
      label: "test suite",
      area: "quality assurance",
      capability: "validar componentes, filtros, configuração, API client e regressões",
    };
  }
  if (relativePath.startsWith(".github/workflows/")) {
    return {
      key: "ci",
      label: "CI workflow",
      area: "continuous integration",
      capability: "validar lint, typecheck, testes e build em automação",
    };
  }
  if (/\.md$/i.test(relativePath) || relativePath === "README.md") {
    return {
      key: "docs",
      label: "project documentation",
      area: "developer documentation",
      capability: "explicar arquitetura, uso, limitações e configuração do console",
    };
  }
  if (isRootBuildConfig(relativePath)) {
    return {
      key: "project-config",
      label: "project configuration",
      area: "build and tooling",
      capability: "manter configuração de build, lint, testes, aliases e tooling",
    };
  }
  if (relativePath === ".gitignore" || relativePath.startsWith("scripts/")) {
    return {
      key: "project-config",
      label: "project configuration",
      area: "build and tooling",
      capability: "manter configuração de build, lint, testes, aliases e tooling",
    };
  }
  if (relativePath === "src/main.tsx" || relativePath.startsWith("src/app/")) {
    return {
      key: "app",
      label: "app bootstrap",
      area: "application shell and routing",
      capability: "inicializar providers, rotas e estrutura base da SPA",
    };
  }
  if (relativePath.startsWith("src/components/layout/")) {
    return {
      key: "layout",
      label: "console layout",
      area: "navigation and application chrome",
      capability: "organizar sidebar, topbar e shell visual do console",
    };
  }
  if (relativePath.startsWith("src/components/charts/")) {
    return {
      key: "charts",
      label: "security chart",
      area: "metrics visualization",
      capability: "apresentar métricas de requests, severidade e detectores",
    };
  }
  if (relativePath.startsWith("src/components/ui/")) {
    return {
      key: "ui",
      label: "design system component",
      area: "shared interface primitives",
      capability: "manter componentes reutilizáveis, acessíveis e consistentes",
    };
  }
  if (relativePath.startsWith("src/features/dashboard/")) {
    return {
      key: "dashboard",
      label: "dashboard page",
      area: "security overview",
      capability: "apresentar visão geral de métricas, atividade e estado do sistema",
    };
  }
  if (relativePath.startsWith("src/features/events/")) {
    return {
      key: "events",
      label: "threat events workflow",
      area: "threat event investigation",
      capability: "listar, filtrar, detalhar e visualizar eventos de ameaça",
    };
  }
  if (relativePath.startsWith("src/features/bans/")) {
    return {
      key: "bans",
      label: "bans page",
      area: "active bans and blocks",
      capability: "exibir bloqueios, bans e entidades restringidas",
    };
  }
  if (relativePath.startsWith("src/features/policies/")) {
    return {
      key: "policies",
      label: "policies page",
      area: "route policy visibility",
      capability: "apresentar políticas configuradas no Admin API",
    };
  }
  if (relativePath.startsWith("src/features/health/")) {
    return {
      key: "health",
      label: "health page",
      area: "service health monitoring",
      capability: "exibir estado operacional do Admin API",
    };
  }
  if (relativePath.startsWith("src/features/settings/")) {
    return {
      key: "settings",
      label: "settings flow",
      area: "API connection settings",
      capability: "configurar URL do Admin API, token local/demo e modo de conexao",
    };
  }
  if (relativePath.startsWith("src/lib/api/")) {
    return {
      key: "api",
      label: "Admin API client",
      area: "API contracts and data fetching",
      capability: "buscar, validar, normalizar e mockar respostas do Parry Admin API",
    };
  }
  if (relativePath.startsWith("src/lib/config/")) {
    return {
      key: "config",
      label: "runtime configuration",
      area: "environment and runtime settings",
      capability: "resolver configuração de ambiente e modo de API com segurança",
    };
  }
  if (relativePath === "src/lib/utils.ts" || relativePath.startsWith("src/lib/utils/")) {
    return {
      key: "utils",
      label: "utility layer",
      area: "formatting and data safety",
      capability: "formatar dados, calcular severidade e redigir metadados sensíveis",
    };
  }
  if (relativePath.startsWith("src/lib/hooks/")) {
    return {
      key: "lib-hooks",
      label: "shared React hook",
      area: "reusable frontend behavior",
      capability: "encapsular comportamento reutilizável da UI",
    };
  }
  if (relativePath.startsWith("src/hooks/")) {
    return {
      key: "app-hooks",
      label: "application hook",
      area: "responsive UI behavior",
      capability: "adaptar a experiência do console ao dispositivo",
    };
  }
  if (relativePath === "src/styles.css") {
    return {
      key: "styles",
      label: "design system component",
      area: "shared interface primitives",
      capability: "manter componentes reutilizáveis, acessíveis e consistentes",
    };
  }

  return {
    key: "frontend",
    label: "project configuration",
    area: "build and tooling",
    capability: "manter configuração de build, lint, testes, aliases e tooling",
  };
}

function getEntryText(root, entry, hasHead) {
  const absolutePath = path.join(root, entry.path);

  if (isDeleted(entry) || (!isUntracked(entry) && hasHead)) {
    const paths = isRename(entry) ? [entry.oldPath, entry.path] : [entry.path];
    const result = tryGit(["diff", "--no-ext-diff", "--", ...paths.filter(Boolean)], root);
    if (result.ok && result.stdout.trim()) return result.stdout;
  }

  if (existsSync(absolutePath) && lstatSync(absolutePath).isFile()) {
    return readFileSync(absolutePath, "utf8");
  }

  return "";
}

function analyzeEntry(root, entry, hasHead) {
  const text = getEntryText(root, entry, hasHead);
  const lower = text.toLowerCase();
  const fileLower = entry.path.toLowerCase();
  const changedText = `${fileLower}\n${lower}`;

  return {
    text,
    lower,
    isNew: isUntracked(entry) || entry.status.includes("A"),
    hasRevertSignal:
      /^this reverts commit\b/im.test(text) ||
      /^revert\s+"[^"]+"/im.test(text) ||
      /\brevert:\s+/i.test(text),
    hasFixSignal: FIX_SIGNALS.some((signal) => changedText.includes(signal)),
    hasStyleSignal: STYLE_SIGNALS.some((signal) => changedText.includes(signal)),
    hasPerfSignal: PERF_SIGNALS.some((signal) => changedText.includes(signal)),
    hasRefactorSignal: /\b(refactor|reorganize|extract|split|rename|cleanup|simplify)\b/i.test(
      changedText,
    ),
    hasOnlyStyleExtension: /\.(css|scss|sass|less)$/i.test(entry.path),
  };
}

function inferType(entry, domain, analysis) {
  if (analysis.hasRevertSignal) return "revert";
  if (domain.key === "test") return "test";
  if (domain.key === "docs") return "docs";
  if (domain.key === "ci") return "ci";
  if (entry.path === ".gitignore") return "chore";
  if (domain.key === "project-config") return isScriptAutomation(entry.path) ? "chore" : "build";
  if (analysis.hasOnlyStyleExtension) return "style";
  if (analysis.isNew && isPerformanceFocusedNewFile(entry, domain, analysis)) return "perf";
  if (analysis.isNew && isFixFocusedNewFile(entry, domain, analysis)) return "fix";
  if (analysis.isNew && isFrontendFeatureDomain(domain)) return "feat";
  if (analysis.hasPerfSignal) return "perf";
  if (
    analysis.hasFixSignal &&
    ["api", "config", "utils", "events", "settings"].includes(domain.key)
  ) {
    return "fix";
  }
  if ((analysis.hasOnlyStyleExtension || analysis.hasStyleSignal) && !analysis.isNew) {
    return "style";
  }
  if (analysis.hasRefactorSignal) return "refactor";
  if (analysis.hasStyleSignal) return "style";
  if (["ui", "layout", "charts"].includes(domain.key)) return "style";
  if (["api", "config", "utils"].includes(domain.key)) return "refactor";
  return "chore";
}

function isFrontendFeatureDomain(domain) {
  return [
    "ui",
    "layout",
    "charts",
    "dashboard",
    "events",
    "bans",
    "policies",
    "health",
    "settings",
    "app",
    "api",
    "config",
    "utils",
    "lib-hooks",
    "app-hooks",
  ].includes(domain.key);
}

function isPerformanceFocusedNewFile(entry, domain, analysis) {
  if (entry.path === "src/lib/hooks/useDebouncedValue.ts") return true;
  if (entry.path === "src/lib/api/hooks.ts" && analysis.hasPerfSignal) return true;
  return domain.key === "events" && /debounce|virtual|optimize|performance/i.test(analysis.text);
}

function isFixFocusedNewFile(entry) {
  return [
    "src/features/events/eventFilters.ts",
    "src/lib/api/client.ts",
    "src/lib/api/schemas.ts",
    "src/lib/config/runtime-config.ts",
    "src/lib/utils/redact.ts",
  ].includes(entry.path);
}

function isScriptAutomation(relativePath) {
  return relativePath.startsWith("scripts/") || /commit/i.test(relativePath);
}

function generateSubject(entry, domain, type, analysis) {
  const description = subjectDescription(entry, domain, type, analysis);
  return normalizeSubject(`${type}: ${description}`);
}

function subjectDescription(entry, domain, type, analysis) {
  const filePath = entry.path;
  const base = path.posix.basename(filePath);
  const name = base.replace(/\.[^.]+$/, "");
  const newPrefix = analysis.isNew ? "add" : "update";

  if (type === "revert") return `revert ${shortDomainName(domain, filePath)} change`;
  if (filePath === ".gitignore") return "update repository ignore rules";
  if (filePath === "README.md") return "update security console README";
  if (filePath === "package.json") return "update project scripts and metadata";
  if (filePath === "package-lock.json") return "update npm dependency lockfile";
  if (filePath === "vite.config.ts") return "update Vite configuration";
  if (filePath === "vitest.config.ts") return "update Vitest configuration";
  if (filePath === "tsconfig.json") return "update TypeScript configuration";
  if (filePath === "eslint.config.js") return "update ESLint configuration";
  if (filePath === ".prettierrc") return "update Prettier formatting configuration";
  if (filePath === ".prettierignore") return "update Prettier ignore rules";
  if (filePath === "components.json") return "update design system registry configuration";
  if (filePath === "index.html") return "update application HTML entrypoint";
  if (isEnvFile(filePath)) return "update example environment configuration";
  if (filePath.startsWith(".github/workflows/")) return `${newPrefix} project validation workflow`;
  if (filePath === "scripts/parry-console-atomic-commits.mjs") {
    return "add security console atomic commit automation";
  }
  if (filePath === "src/main.tsx") return `${newPrefix} React application entrypoint`;
  if (filePath === "src/styles.css") return "refine console design system styles";

  if (domain.key === "app") {
    if (base === "router.tsx") return `${newPrefix} application routing`;
    if (base === "providers.tsx") return `${newPrefix} application providers`;
    if (base === "App.tsx") return `${newPrefix} application shell`;
    return `${newPrefix} app bootstrap wiring`;
  }
  if (domain.key === "layout") {
    if (base === "AppShell.tsx") return `${newPrefix} console application shell`;
    if (base === "Sidebar.tsx") return `${newPrefix} console sidebar navigation`;
    if (base === "Topbar.tsx") return `${newPrefix} console topbar controls`;
    return "refine console layout spacing";
  }
  if (domain.key === "charts") {
    if (base === "SeverityChart.tsx") return `${newPrefix} severity metrics chart`;
    if (base === "DetectorChart.tsx") return `${newPrefix} detector metrics chart`;
    if (base === "RequestsChart.tsx") return `${newPrefix} request metrics chart`;
    return `${newPrefix} security metrics chart`;
  }
  if (domain.key === "ui") {
    if (type === "test") return `${newPrefix} ${humanizeName(name)} coverage`;
    return `${newPrefix} design system ${humanizeName(name)} component`;
  }
  if (domain.key === "dashboard")
    return `${newPrefix} dashboard page coverage`.replace(
      "add dashboard page coverage",
      "add dashboard page",
    );
  if (domain.key === "events") return eventsDescription(filePath, base, type, newPrefix);
  if (domain.key === "bans") return `${newPrefix} bans page`;
  if (domain.key === "policies") return `${newPrefix} policies page`;
  if (domain.key === "health") return `${newPrefix} health page`;
  if (domain.key === "settings") return settingsDescription(base, type, newPrefix);
  if (domain.key === "api") return apiDescription(base, type, newPrefix);
  if (domain.key === "config") {
    if (type === "fix") return "correct runtime configuration fallback";
    return `${newPrefix} runtime configuration resolution`;
  }
  if (domain.key === "utils") return utilsDescription(base, type, newPrefix);
  if (domain.key === "lib-hooks") {
    if (base === "useDebouncedValue.ts") return `${newPrefix} debounced value hook`;
    if (base === "useRuntimeConfig.ts") return `${newPrefix} runtime config hook`;
    return `${newPrefix} shared React hook`;
  }
  if (domain.key === "app-hooks") {
    if (base === "use-mobile.tsx") return `${newPrefix} responsive mobile hook`;
    return `${newPrefix} application hook`;
  }
  if (domain.key === "test") {
    return testDescription(filePath, base, newPrefix);
  }
  if (domain.key === "docs") return "update project documentation";
  if (domain.key === "ci") return `${newPrefix} project validation workflow`;

  return `${newPrefix} ${shortDomainName(domain, filePath)} change`;
}

function eventsDescription(filePath, base, type, newPrefix) {
  if (base === "ThreatEventTable.tsx") return `${newPrefix} threat events table`;
  if (base === "ThreatEventDrawer.tsx") return `${newPrefix} threat event drawer`;
  if (base === "EventDetailPage.tsx") return `${newPrefix} threat event detail page`;
  if (base === "EventsPage.tsx") return `${newPrefix} threat events page`;
  if (base === "eventFilters.ts") {
    return type === "fix"
      ? "correct threat event filter validation"
      : `${newPrefix} threat event filter parsing`;
  }
  if (base === "useEventFilters.ts") return `${newPrefix} threat event filter hook`;
  if (filePath.includes("__tests__")) return `${newPrefix} threat events workflow coverage`;
  return `${newPrefix} threat events workflow`;
}

function testDescription(filePath, base, newPrefix) {
  if (base === "render.tsx") return `${newPrefix} test render utilities`;
  if (base === "setup.ts") return `${newPrefix} test environment setup`;
  if (filePath.startsWith("src/components/ui/")) return `${newPrefix} json preview coverage`;
  if (filePath.startsWith("src/features/dashboard/")) return `${newPrefix} dashboard page coverage`;
  if (filePath.startsWith("src/features/events/")) {
    if (base.startsWith("eventFilters.")) return `${newPrefix} threat event filters coverage`;
    return `${newPrefix} threat events page coverage`;
  }
  if (filePath.startsWith("src/features/settings/")) {
    return `${newPrefix} API connection form coverage`;
  }
  if (filePath.startsWith("src/lib/api/")) {
    const target = base.replace(/\.(test|spec)\.[cm]?[tj]sx?$/i, "");
    if (target === "client") return `${newPrefix} Admin API client coverage`;
    if (target === "detectors") return `${newPrefix} detector labels coverage`;
    if (target === "parry-api") return `${newPrefix} Admin API data access coverage`;
    if (target === "query-keys") return `${newPrefix} Admin API query key coverage`;
    if (target === "schemas") return `${newPrefix} Admin API schema coverage`;
  }
  if (filePath.startsWith("src/lib/config/")) return `${newPrefix} runtime configuration coverage`;
  if (filePath.startsWith("src/lib/utils/"))
    return `${newPrefix} sensitive metadata redaction coverage`;
  return `${newPrefix} test coverage`;
}

function settingsDescription(base, type, newPrefix) {
  if (base === "ApiConnectionForm.tsx") return `${newPrefix} API connection settings form`;
  if (base === "SettingsPage.tsx") return `${newPrefix} settings page`;
  if (type === "fix") return "correct API connection settings validation";
  return `${newPrefix} settings flow`;
}

function apiDescription(base, type, newPrefix) {
  if (base === "client.ts")
    return type === "fix"
      ? "correct Admin API request handling"
      : `${newPrefix} Admin API fetch client`;
  if (base === "parry-api.ts") return `${newPrefix} Admin API data access layer`;
  if (base === "schemas.ts")
    return type === "fix"
      ? "correct Admin API response validation"
      : `${newPrefix} Admin API response schemas`;
  if (base === "mocks.ts") return `${newPrefix} Admin API mock fixtures`;
  if (base === "types.ts") return `${newPrefix} Admin API response types`;
  if (base === "query-keys.ts") return `${newPrefix} Admin API query keys`;
  if (base === "hooks.ts") return `${newPrefix} Admin API query hooks`;
  if (base === "detectors.ts") return `${newPrefix} detector labels`;
  return `${newPrefix} Admin API client behavior`;
}

function utilsDescription(base, type, newPrefix) {
  if (base === "redact.ts") {
    return type === "fix"
      ? "redact sensitive metadata fields"
      : `${newPrefix} sensitive metadata redaction`;
  }
  if (base === "format.ts") return `${newPrefix} console data formatting utilities`;
  if (base === "severity.ts") return `${newPrefix} severity helpers`;
  if (base === "utils.ts") return `${newPrefix} utility class merger`;
  return `${newPrefix} utility layer behavior`;
}

function humanizeName(name) {
  return name
    .replace(/^use-?/, "")
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .trim();
}

function shortDomainName(domain, filePath) {
  if (domain.key !== "frontend") return domain.label;
  return humanizeName(path.posix.basename(filePath).replace(/\.[^.]+$/, "")) || "frontend";
}

function normalizeSubject(subject) {
  let normalized = subject.replace(/\s+/g, " ").trim().replace(/\.$/, "");
  if (normalized.length <= 100) return normalized;

  normalized = normalized
    .slice(0, 100)
    .replace(/\s+\S*$/, "")
    .replace(/[,;:.-]$/, "");
  return normalized.trim();
}

function validateSubject(subject) {
  const match = subject.match(/^([a-z]+): ([a-z0-9].*)$/);
  if (!match || !VALID_TYPES.has(match[1])) {
    return "subject must start with a valid Conventional Commit type and description";
  }
  if (/^[a-z]+\(.*\): /.test(subject)) return "subject must not include a scope";
  if (subject.length > 100) return "subject must be at most 100 characters";
  if (subject.endsWith(".")) return "subject must not end with a period";
  if (
    /^(chore: update file|feat: add component|fix: fix bug|refactor: update code)$/i.test(subject)
  ) {
    return "subject is too generic";
  }
  return "";
}

function dedupeSubjects(items) {
  const counts = new Map();
  const used = new Set();

  for (const item of items) {
    counts.set(item.subject, (counts.get(item.subject) ?? 0) + 1);
  }

  for (const item of items) {
    let subject = item.subject;
    if ((counts.get(subject) ?? 0) > 1 || used.has(subject)) {
      const qualifier = subjectQualifier(item.entry.path);
      subject = normalizeSubject(`${subject} for ${qualifier}`);
    }

    let nextSubject = subject;
    let suffix = 2;
    while (used.has(nextSubject)) {
      nextSubject = normalizeSubject(`${subject} ${suffix}`);
      suffix += 1;
    }
    item.subject = nextSubject;
    used.add(item.subject);
  }
}

function subjectQualifier(relativePath) {
  const parts = relativePath.split("/");
  const base = humanizeName(path.posix.basename(relativePath).replace(/\.[^.]+$/, ""));
  if (parts.includes("features")) return `${parts[parts.indexOf("features") + 1]} ${base}`.trim();
  if (parts.includes("components"))
    return `${parts[parts.indexOf("components") + 1]} ${base}`.trim();
  if (parts.includes("lib")) return `${parts[parts.indexOf("lib") + 1]} ${base}`.trim();
  return base || path.posix.dirname(relativePath).replace(/\//g, " ");
}

function buildBody(item, language) {
  const { entry, domain, type, highlights } = item;
  const highlightLines = highlights.map((highlightKey) => HIGHLIGHTS[highlightKey][language]);

  if (language === "pt-br") {
    return [
      "Descrição:",
      "",
      `* Atualiza \`${entry.path}\` como uma alteração atômica e isolada.`,
      `* Mantém o commit focado na área de \`${domain.area}\` do Parry Security Console.`,
      `* Reforça a responsabilidade de \`${domain.label}\`: \`${domain.capability}\`.`,
      `* Classifica a alteração como \`${type}\` para manter o histórico legível.`,
      ...highlightLines.map((line) => `* ${line}`),
      "",
      "Impacto:",
      "",
      `* Facilita revisões futuras porque este commit versiona apenas \`${entry.path}\`.`,
      "* Reduz o risco de misturar alterações não relacionadas de UI, API, configuração ou testes.",
      "* Preserva um histórico limpo para a evolução do security console.",
    ].join("\n");
  }

  return [
    "Description:",
    "",
    `* Updates \`${entry.path}\` as an isolated atomic change.`,
    `* Keeps the commit focused on the \`${domain.area}\` area of Parry Security Console.`,
    `* Supports the \`${domain.label}\` responsibility: \`${domain.capability}\`.`,
    `* Classifies the change as \`${type}\` to keep the repository history readable.`,
    ...highlightLines.map((line) => `* ${line}`),
    "",
    "Impact:",
    "",
    `* Makes future reviews easier because this commit only stages \`${entry.path}\`.`,
    "* Reduces the risk of mixing unrelated UI, API, configuration, or test changes.",
    "* Preserves a clean Git history for security-console evolution.",
  ].join("\n");
}

function selectHighlights(entry, domain, analysis) {
  const keys = [];
  const lower = analysis.lower;

  addHighlight(
    keys,
    domain.key === "api" || /zod|schema|parse|validation/.test(lower),
    "adminValidation",
  );
  addHighlight(
    keys,
    /redact|sensitive|token|secret|metadata/.test(lower) || entry.path.includes("redact"),
    "redaction",
  );
  addHighlight(
    keys,
    domain.key === "events" || /filter|investigation|threat event/.test(lower),
    "threatFiltering",
  );
  addHighlight(
    keys,
    domain.key === "dashboard" || domain.key === "charts" || /metrics|chart/.test(lower),
    "dashboardVisibility",
  );
  addHighlight(
    keys,
    domain.key === "app-hooks" || /responsive|mobile|sidebar|topbar/.test(lower),
    "responsive",
  );
  addHighlight(keys, domain.key === "ui", "uiConsistency");
  addHighlight(keys, domain.key === "test", "validationCoverage");
  addHighlight(keys, domain.key === "docs", "documentation");
  addHighlight(keys, ["project-config", "ci"].includes(domain.key), "buildReliability");
  addHighlight(
    keys,
    domain.key === "ui" || entry.path === "src/styles.css",
    "designMaintainability",
  );
  addHighlight(keys, domain.key === "settings" || domain.key === "config", "settingsSafety");

  if (keys.length === 0) {
    addHighlight(keys, true, "buildReliability");
  }

  return keys.slice(0, 4);
}

function addHighlight(keys, condition, key) {
  if (condition && !keys.includes(key)) keys.push(key);
}

function printHeader(context) {
  console.log(`\n${SCRIPT_NAME}`);
  console.log("=".repeat(SCRIPT_NAME.length));
  console.log(`Repository: ${REPO_NAME}`);
  console.log(`Root path: ${context.root}`);
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`HEAD exists: ${context.hasHead ? "yes" : "no"}`);
  console.log(`Dry run: ${context.options.dryRun ? "yes" : "no"}`);
  console.log(`Auto approve: ${context.options.autoApprove ? "yes" : "no"}`);
  console.log(`Body language: ${context.options.language}`);
  console.log(`Entries detected: ${context.rawEntries.length}`);
  console.log(`Files after expansion: ${context.expandedEntries.length}`);
  console.log(`Files to process: ${context.items.length}`);
  for (const item of context.items) {
    console.log(`  - ${item.entry.path}`);
  }
  console.log(`Ignored files: ${context.ignored.length}`);
  for (const ignored of context.ignored) {
    console.log(`  - ${ignored.path} (${ignored.reason})`);
  }
}

function printItem(item) {
  console.log("\n---");
  console.log(`File: ${item.entry.path}`);
  console.log(`Git status: ${displayStatus(item.entry)}`);
  if (isRename(item.entry)) {
    console.log(`Rename: ${item.entry.oldPath} -> ${item.entry.path}`);
  }
  console.log(`Subject: ${item.subject}`);
  console.log("Body:");
  console.log(item.body);
}

function displayStatus(entry) {
  return entry.status.trim() || entry.status;
}

async function promptAction(rl, item) {
  while (true) {
    const answer = (
      await rl.question("Action [c=commit, e=edit subject, b=edit body, s=skip, q=quit]: ")
    )
      .trim()
      .toLowerCase();

    if (answer === "" || answer === "c") return "commit";
    if (answer === "s") return "skip";
    if (answer === "q") return "quit";
    if (answer === "e") {
      const nextSubject = (await rl.question("Subject: ")).trim();
      if (!nextSubject) {
        console.log("Subject unchanged.");
        continue;
      }
      const error = validateSubject(nextSubject);
      if (error) {
        console.log(`Invalid subject: ${error}`);
        continue;
      }
      item.subject = nextSubject;
      console.log(`Subject updated: ${item.subject}`);
      continue;
    }
    if (answer === "b") {
      console.log("Enter body lines. Finish with a single '.' line.");
      const lines = [];
      while (true) {
        const line = await rl.question("> ");
        if (line === ".") break;
        lines.push(line);
      }
      if (lines.length === 0) {
        console.log("Body unchanged.");
      } else {
        item.body = lines.join("\n");
        console.log("Body updated.");
      }
      continue;
    }

    console.log("Unknown action. Use c, e, b, s, or q.");
  }
}

function clearStaging(root, hasHead) {
  if (hasHead) {
    runGit(["reset", "--quiet", "HEAD", "--"], root);
    return;
  }
  runGit(["rm", "-r", "--cached", "--quiet", "--ignore-unmatch", "--", "."], root);
}

function stageEntry(root, entry, options) {
  if (isRename(entry)) {
    runGit(["add", "-A", "--", entry.oldPath, entry.path], root);
    return;
  }
  if (isDeleted(entry)) {
    runGit(["add", "--", entry.path], root);
    return;
  }

  const addArgs = ["add"];
  if (isEnvFile(entry.path) && !isAllowedEnvExample(entry.path) && options.includeEnv) {
    addArgs.push("-f");
  }
  addArgs.push("--", entry.path);
  runGit(addArgs, root);
}

function validateStagedPaths(root, entry) {
  const output = runGit(["diff", "--cached", "--name-status", "-z", "--find-renames"], root);
  const stagedPaths = new Set(parseNameStatus(output));
  const expectedPaths = new Set(isRename(entry) ? [entry.oldPath, entry.path] : [entry.path]);

  if (stagedPaths.size === 0) {
    throw new Error("no staged diff was produced for this file");
  }

  for (const stagedPath of stagedPaths) {
    if (!expectedPaths.has(stagedPath)) {
      throw new Error(`unexpected staged path: ${stagedPath}`);
    }
  }
}

function createCommit(root, item) {
  runGit(["commit", "-m", item.subject, "-m", item.body], root, {
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function buildItems(root, entries, hasHead, language) {
  const items = entries.map((entry) => {
    const domain = classifyDomain(entry.path);
    const analysis = analyzeEntry(root, entry, hasHead);
    const type = inferType(entry, domain, analysis);
    const subject = generateSubject(entry, domain, type, analysis);
    const highlights = selectHighlights(entry, domain, analysis);
    const item = { entry, domain, analysis, type, subject, highlights };
    item.body = buildBody(item, language);
    return item;
  });

  dedupeSubjects(items);
  for (const item of items) {
    const error = validateSubject(item.subject);
    if (error) {
      throw new Error(`Generated invalid subject for ${item.entry.path}: ${error}`);
    }
    item.body = buildBody(item, language);
  }

  return items;
}

function prepareEntries(root, rawEntries, options) {
  let expandedEntries = expandEntries(root, rawEntries);
  if (options.includeEnv) {
    expandedEntries = uniqueEntries(
      sortEntries([...expandedEntries, ...discoverEnvCandidates(root, expandedEntries)]),
    );
  }

  const ignored = [];
  const candidates = [];

  for (const entry of expandedEntries) {
    const reason = ignoreReason(entry, options);
    if (reason) {
      ignored.push({ path: entry.path, status: displayStatus(entry), reason });
      continue;
    }
    candidates.push(entry);
  }

  const processable = [];
  for (const entry of candidates) {
    const reason = scanSecrets(root, entry);
    if (reason) {
      ignored.push({ path: entry.path, status: displayStatus(entry), reason });
      continue;
    }
    processable.push(entry);
  }

  return {
    expandedEntries,
    ignored: ignored.sort((left, right) => left.path.localeCompare(right.path)),
    processable: sortEntries(processable),
  };
}

function printSummary(summary) {
  console.log("\nSummary");
  console.log("=======");
  console.log(`Commits created: ${summary.commits}`);
  console.log(`Dry-run items: ${summary.dryRun}`);
  console.log(`Files ignored: ${summary.ignored}`);
  console.log(`Files skipped: ${summary.skipped}`);
  console.log(`Errors: ${summary.errors.length}`);
  for (const error of summary.errors) {
    console.log(`  - ${error.path}: ${error.message}`);
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    if (error instanceof CliError) {
      console.error(error.message);
      printHelp();
      process.exitCode = 1;
      return;
    }
    throw error;
  }

  if (options.help) {
    printHelp();
    return;
  }

  const root = realpathSync(runGit(["rev-parse", "--show-toplevel"], process.cwd()).trim());
  const hasHead = tryGit(["rev-parse", "--verify", "HEAD"], root).ok;
  const rawStatus = runGit(["status", "--porcelain=v1", "-z"], root);
  const rawEntries = parsePorcelainStatus(rawStatus);
  const { expandedEntries, ignored, processable } = prepareEntries(root, rawEntries, options);
  const items = buildItems(root, processable, hasHead, options.language);

  printHeader({ root, hasHead, options, rawEntries, expandedEntries, ignored, items });

  const summary = {
    commits: 0,
    dryRun: 0,
    ignored: ignored.length,
    skipped: 0,
    errors: [],
  };

  if (items.length === 0) {
    printSummary(summary);
    return;
  }

  let rl;
  if (!options.dryRun && !options.autoApprove) {
    rl = readline.createInterface({ input, output });
  }

  let currentHasHead = hasHead;

  try {
    for (const item of items) {
      printItem(item);

      if (options.dryRun) {
        console.log("Result: dry-run only");
        summary.dryRun += 1;
        continue;
      }

      if (!options.autoApprove) {
        const action = await promptAction(rl, item);
        if (action === "skip") {
          console.log("Result: skipped");
          summary.skipped += 1;
          continue;
        }
        if (action === "quit") {
          console.log("Result: quit requested");
          break;
        }
      }

      try {
        clearStaging(root, currentHasHead);
        stageEntry(root, item.entry, options);
        validateStagedPaths(root, item.entry);
        createCommit(root, item);
        currentHasHead = true;
        clearStaging(root, currentHasHead);
        console.log("Result: committed");
        summary.commits += 1;
      } catch (error) {
        try {
          clearStaging(root, currentHasHead);
        } catch {
          // Keep the original error visible in the summary.
        }
        console.log(`Result: error - ${error.message}`);
        summary.errors.push({ path: item.entry.path, message: error.message });
      }
    }
  } finally {
    rl?.close();
  }

  printSummary(summary);
}

main().catch((error) => {
  console.error(`${SCRIPT_NAME}: ${error.message}`);
  process.exitCode = 1;
});
