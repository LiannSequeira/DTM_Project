const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { pathToFileURL } = require('url');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');

const DOCUMENT_ROOT = path.resolve(__dirname, '../../../data/documents');
const CATALOG_PATH = path.resolve(__dirname, '../../../data/catalog/index.json');

function normalizeText(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function asRelativePath(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const root = DOCUMENT_ROOT.replace(/\\/g, '/');
  return normalized.startsWith(root) ? normalized.slice(root.length + 1) : normalized;
}

function fileIdFromPath(filePath) {
  const relative = asRelativePath(filePath);
  return relative
    .toLowerCase()
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'document';
}

function parseSemester(fileName, filePath = '') {
  const haystack = `${fileName} ${filePath}`.toLowerCase();
  const match = haystack.match(/(?:sem|semester)\s*([1-9])/i);
  if (match) return Number(match[1]);
  return null;
}

function parseYear(fileName = '') {
  const match = fileName.match(/((?:19|20)\d{2})/);
  return match ? Number(match[1]) : null;
}

function parseCourseCode(fileName = '') {
  const match = fileName.match(/\b(?:\d{2}[A-Z]{2,5}\d{3,4}[A-Z]?|[A-Z]{2,5}\d{3,4}[A-Z]?)\b/);
  return match ? match[0] : null;
}

function parseTitleFromText(text, fileName) {
  const cleaned = normalizeText(text).slice(0, 200);
  if (!cleaned) return fileName.replace(/\.[^.]+$/, '');

  const firstLine = cleaned.split(/\s{2,}|\n+/)[0] || '';
  const withoutPage = firstLine.replace(/\s*•\s*Page\s*\d+.*$/i, '').replace(/\s*Page\s*\d+.*$/i, '');
  const candidate = withoutPage.replace(/^[^A-Za-z0-9]+/, '').trim();
  return candidate.length > 2 ? candidate : fileName.replace(/\.[^.]+$/, '');
}

function inferSourceType(filePath, fileName) {
  const haystack = `${filePath} ${fileName}`.toLowerCase();
  if (haystack.includes('srm_') || haystack.includes('hostel') || haystack.includes('scholarship') || haystack.includes('safety') || haystack.includes('regulation') || haystack.includes('ragging') || haystack.includes('policy')) {
    return 'official';
  }
  if (haystack.includes('pyq') || haystack.includes('previous') || haystack.includes('/sem ') || /\/sem\s*[1-9]\//i.test(haystack)) {
    return 'pyq';
  }
  return 'unknown';
}

function inferSubject(fileName, text = '') {
  const haystack = `${fileName} ${text}`.toLowerCase();
  const explicitPatterns = [
    [/\bdata structures\b/, 'Data Structures'],
    [/\bcomputer networks\b/, 'Computer Networks'],
    [/\bfull stack\b|\bfullstack\b/, 'Full Stack Development'],
    [/\bdatabase management systems\b|\bdbms\b/, 'Database Management Systems'],
    [/\bweb development\b/, 'Web Development'],
    [/\bcalculus\b/, 'Calculus'],
    [/\bchemistry\b/, 'Chemistry'],
    [/\bphysics\b/, 'Physics'],
    [/\bmathematics\b/, 'Mathematics'],
  ];

  for (const [pattern, value] of explicitPatterns) {
    if (pattern.test(haystack)) return value;
  }

  return null;
}

function detectLowText(text = '', fileName = '', sourceType = 'unknown') {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  const filenameKeywords = /(hostel|scholarship|safety|ragging|regulation|misconduct|policy)/i;

  if (sourceType === 'official' && filenameKeywords.test(fileName || '')) {
    return false;
  }

  return words.length < 180 || !text || text.trim().length < 200;
}

function splitIntoChunks(text, chunkWords = 220, overlapWords = 35) {
  const words = normalizeText(text).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks = [];
  for (let i = 0; i < words.length; i += chunkWords - overlapWords) {
    const slice = words.slice(i, i + chunkWords).join(' ');
    if (slice.trim()) chunks.push(slice.trim());
  }
  return chunks;
}

function parsePageNumbers(text = '') {
  const matches = [...text.matchAll(/(?:^|\s|•|\.|,)(?:Page|PAGE)\s+(\d+)/gi)];
  if (matches.length > 0) return [Number(matches[0][1])];
  return [1];
}

function discoverPdfFiles(startDir = DOCUMENT_ROOT) {
  const files = [];

  if (!fs.existsSync(startDir)) return files;

  for (const entry of fs.readdirSync(startDir, { withFileTypes: true })) {
    const fullPath = path.join(startDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...discoverPdfFiles(fullPath));
    } else if (entry.isFile() && fullPath.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

function readLocalIndex() {
  if (!fs.existsSync(CATALOG_PATH)) {
    return { documents: [], generatedAt: null };
  }

  try {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && Array.isArray(parsed.documents) ? parsed : { documents: [], generatedAt: null };
  } catch (error) {
    return { documents: [], generatedAt: null };
  }
}

async function buildLocalIndex() {
  const files = discoverPdfFiles();
  const documents = [];

  for (let i = 0; i < files.length; i += 1) {
    const filePath = files[i];
    const fileName = path.basename(filePath);

    let text = '';
    try {
      text = await extractPdfText(filePath);
    } catch (error) {
      text = '';
    }

    const sourceType = inferSourceType(filePath, fileName);
    const title = parseTitleFromText(text, fileName);
    const needsReview = detectLowText(text, fileName, sourceType);
    const chunks = splitIntoChunks(text).map((chunk, index) => ({
      chunkIndex: index,
      pageNumber: parsePageNumbers(chunk)[0],
      text: chunk,
    }));

    documents.push({
      id: fileIdFromPath(filePath),
      sourceType,
      category: sourceType === 'official' ? 'official' : 'pyq',
      title,
      filename: fileName,
      semester: parseSemester(fileName, filePath),
      courseCode: parseCourseCode(fileName),
      subject: inferSubject(fileName, text),
      year: parseYear(fileName),
      pageCount: text ? Math.max(1, (text.match(/Page\s+\d+/gi) || []).length || 1) : 1,
      authority: sourceType === 'official' ? 'SRM' : null,
      storagePath: filePath,
      needsReview,
      text,
      chunks,
      path: filePath,
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    documents,
  };

  fs.mkdirSync(path.dirname(CATALOG_PATH), { recursive: true });
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(payload, null, 2));

  return payload;
}

async function getAllDocuments() {
  const index = readLocalIndex();
  if (index.documents.length === 0 && fs.existsSync(DOCUMENT_ROOT)) {
    return (await buildLocalIndex()).documents;
  }

  const files = discoverPdfFiles();
  const localIds = new Set(index.documents.map((doc) => doc.id));
  const missing = files.filter((file) => !localIds.has(fileIdFromPath(file)));

  if (missing.length > 0) {
    const rebuilt = await buildLocalIndex();
    return rebuilt.documents;
  }

  return index.documents;
}

async function listDocuments(filters = {}) {
  const docs = await getAllDocuments();
  const shouldKeepReviewDocs = filters.includeNeedsReview === true || filters.needsReview === true || Boolean(filters.search);
  let results = docs.filter((doc) => shouldKeepReviewDocs || !doc.needsReview);

  if (filters.sourceType) {
    const value = String(filters.sourceType).toLowerCase();
    results = results.filter((doc) => String(doc.sourceType).toLowerCase() === value || String(doc.category).toLowerCase() === value);
  }

  if (filters.semester) {
    const semester = Number(filters.semester);
    results = results.filter((doc) => Number(doc.semester) === semester);
  }

  if (filters.year) {
    const year = Number(filters.year);
    results = results.filter((doc) => Number(doc.year) === year);
  }

  if (filters.subject) {
    const subjectValue = String(filters.subject).toLowerCase();
    results = results.filter((doc) => (doc.subject || '').toLowerCase().includes(subjectValue) || (doc.filename || '').toLowerCase().includes(subjectValue));
  }

  if (filters.courseCode) {
    const courseValue = String(filters.courseCode).toLowerCase();
    results = results.filter((doc) => {
      const docCode = String(doc.courseCode || '').toLowerCase();
      const filename = String(doc.filename || '').toLowerCase();
      return docCode.includes(courseValue) || filename.includes(courseValue);
    });
  }

  if (filters.search) {
    const query = String(filters.search);
    results = results.filter((doc) => matchesDocumentSearch(doc, query));
  }

  const it = Number(filters.offset || 0);
  const limit = Number(filters.limit || 100);
  const paginated = results.slice(it, it + limit);

  return {
    documents: paginated,
    total: results.length,
    configured: true,
    reason: null,
  };
}

async function getDocumentById(id) {
  const docs = await getAllDocuments();
  return docs.find((doc) => String(doc.id) === String(id)) || null;
}

async function getDocumentFilePath(document) {
  if (!document) return null;
  const candidate = document.storagePath || document.path;
  if (candidate && fs.existsSync(candidate)) return candidate;
  if (candidate && fs.existsSync(path.resolve(candidate))) return path.resolve(candidate);
  return null;
}

function normalizeSearchValue(value = '') {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesDocumentSearch(doc, query) {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return true;

  const haystack = normalizeSearchValue(
    `${doc.title || ''} ${doc.filename || ''} ${doc.subject || ''} ${doc.courseCode || ''}`
  );

  if (!haystack) return false;
  if (haystack.includes(normalizedQuery)) return true;

  const stopWords = new Set([
    'what', 'when', 'where', 'which', 'why', 'how', 'who', 'the', 'are', 'is', 'a', 'an',
    'for', 'from', 'with', 'about', 'show', 'find', 'me', 'please', 'papers', 'paper',
    'previous', 'question', 'questions', 'available', 'does', 'do', 'can', 'tell', 'give',
    'and', 'or', 'of', 'to', 'in', 'on', 'this', 'that', 'these', 'those', 'all', 'any',
    'semester', 'sem', 'years', 'year'
  ]);

  const keywords = normalizedQuery
    .split(/\s+/)
    .filter((token) => token.length > 2 && !stopWords.has(token));

  if (keywords.length === 0) return haystack.includes(normalizedQuery);

  const matches = keywords.filter((token) => {
    const variants = new Set([token, token.replace(/s$/, ''), token.replace(/es$/, ''), token.replace(/ies$/, 'y')]);
    return Array.from(variants).some((variant) => haystack.includes(variant));
  });
  return matches.length >= 1;
}

async function extractPdfText(filePath) {
  const buffer = fs.readFileSync(filePath);

  try {
    const pdfData = await pdfParse(buffer);
    if (pdfData && typeof pdfData.text === 'string' && pdfData.text.trim()) {
      return pdfData.text;
    }
  } catch (error) {
    // Ignore and fall back to pdfjs-dist below.
  }

  try {
    const uint8 = new Uint8Array(buffer);
    const standardFontDataUrl = pathToFileURL(
      path.resolve(__dirname, '../../node_modules/pdfjs-dist/standard_fonts')
    ).href;

    const pdfDocument = await pdfjsLib.getDocument({
      data: uint8,
      standardFontDataUrl,
    }).promise;

    let text = '';
    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const content = await page.getTextContent();
      text += (content.items || [])
        .map((item) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      text += '\n';
    }

    return text.trim();
  } catch (error) {
    return '';
  }
}

module.exports = {
  DOCUMENT_ROOT,
  CATALOG_PATH,
  buildLocalIndex,
  getAllDocuments,
  listDocuments,
  getDocumentById,
  getDocumentFilePath,
  discoverPdfFiles,
  inferSourceType,
};
