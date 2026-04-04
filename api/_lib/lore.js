const ALLOWED_SCOPES = {
  world: 'content/world',
  game: 'content/game',
  scenarios: 'content/scenarios',
  docs: 'docs/chatgpt-custom-gpt-pack',
};

const ALLOWED_EXTENSIONS = new Set(['.md', '.json', '.txt']);
const RAW_REPO_BASE = 'https://raw.githubusercontent.com/Elaris0128/Elaris2.0/main/';
const MANIFEST_URL = `${RAW_REPO_BASE}data/lore-index.json`;

let manifestPromise;

function normalizeText(input) {
  return String(input || '')
    .replace(/\r/g, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/[*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function extractTitle(content, relPath) {
  const headingMatch = String(content || '').match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  const pieces = String(relPath || '').replace(/\\/g, '/').split('/');
  const filename = pieces[pieces.length - 1] || relPath;
  return filename.replace(/\.[^.]+$/, '');
}

function extractExcerpt(content) {
  return String(content || '')
    .replace(/\r/g, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

function extractHeadings(content) {
  return Array.from(String(content || '').matchAll(/^(#{1,3})\s+(.+)$/gm))
    .slice(0, 24)
    .map((match) => ({
      level: match[1].length,
      text: match[2].trim(),
    }));
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.status}`);
  }
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch text: ${response.status}`);
  }
  return response.text();
}

export function listScopes() {
  return Object.keys(ALLOWED_SCOPES);
}

export function resolveScope(relPath) {
  const normalized = String(relPath || '').replace(/\\/g, '/');
  const scope = Object.entries(ALLOWED_SCOPES).find(([, root]) => normalized.startsWith(`${root}/`) || normalized === root);
  return scope ? scope[0] : null;
}

export function sanitizePath(inputPath) {
  const normalized = String(inputPath || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .trim();

  if (!normalized || normalized.includes('..')) {
    return null;
  }

  const scope = resolveScope(normalized);
  if (!scope) {
    return null;
  }

  const extension = normalized.includes('.') ? `.${normalized.split('.').pop().toLowerCase()}` : '';
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return null;
  }

  return normalized;
}

export async function getManifest() {
  if (!manifestPromise) {
    manifestPromise = fetchJson(MANIFEST_URL);
  }
  return manifestPromise;
}

function scoreItem(item, query, terms, scopeFilter) {
  if (scopeFilter && item.scope !== scopeFilter) {
    return 0;
  }

  let score = 0;
  const title = String(item.title || '').toLowerCase();
  const relPath = String(item.path || '').toLowerCase();
  const excerpt = String(item.excerpt || '').toLowerCase();
  const searchable = String(item.searchable || item.searchText || item.headingsText || '').toLowerCase();

  if (title.includes(query)) score += 120;
  if (relPath.includes(query)) score += 100;
  if (excerpt.includes(query)) score += 35;

  for (const term of terms) {
    if (title.includes(term)) score += 30;
    if (relPath.includes(term)) score += 25;
    if (excerpt.includes(term)) score += 8;
    if (searchable.includes(term)) score += 4;
  }

  return score;
}

export async function searchLore(query, scopeFilter, limit = 5) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return [];
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  const manifest = await getManifest();

  return manifest
    .map((item) => ({
      ...item,
      score: scoreItem(item, normalizedQuery, terms, scopeFilter),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || String(a.path || '').localeCompare(String(b.path || ''), 'zh-Hant'))
    .slice(0, Math.max(1, Math.min(limit, 10)))
    .map(({ score, searchable, ...item }) => item);
}

export async function readDocumentByPath(inputPath) {
  const safePath = sanitizePath(inputPath);
  if (!safePath) {
    return null;
  }

  const content = await fetchText(`${RAW_REPO_BASE}${safePath}`);

  return {
    id: safePath.replace(/[\\/]/g, '__').replace(/\.[^.]+$/, ''),
    path: safePath,
    scope: resolveScope(safePath),
    title: extractTitle(content, safePath),
    excerpt: extractExcerpt(content),
    headings: extractHeadings(content),
    content,
    wordCount: normalizeText(content).split(/\s+/).filter(Boolean).length,
  };
}
