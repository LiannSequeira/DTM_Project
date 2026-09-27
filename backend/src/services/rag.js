const { listDocuments } = require('./documents');

function normalizeText(input = '') {
  return String(input || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

function getQueryKeywords(message) {
  const stopWords = new Set([
    'what', 'when', 'where', 'which', 'why', 'how', 'who', 'the', 'are', 'is', 'a', 'an',
    'for', 'from', 'with', 'about', 'show', 'find', 'me', 'please', 'paper', 'papers',
    'question', 'questions', 'previous', 'available', 'does', 'do', 'can', 'tell', 'give',
    'and', 'or', 'of', 'to', 'in', 'on', 'this', 'that', 'these', 'those', 'all', 'any',
    'semester', 'sem', 'rules', 'rule', 'data', 'paper', 'papers'
  ]);
  return normalizeText(message)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !stopWords.has(token));
}

function inferSubjectFromQuery(message) {
  const text = normalizeText(message);
  if (/\bdata structures\b|\bds\b/.test(text)) return 'Data Structures';
  if (/\bcomputer networks\b|\bcn\b/.test(text)) return 'Computer Networks';
  if (/\bdatabase management systems\b|\bdbms\b/.test(text)) return 'Database Management Systems';
  if (/\bfull stack\b|\bfullstack\b/.test(text)) return 'Full Stack Development';
  return null;
}

function inferSemesterFromQuery(message) {
  const match = normalizeText(message).match(/semester\s*([1-9])/i) || normalizeText(message).match(/sem\s*([1-9])/i);
  return match ? Number(match[1]) : null;
}

function classifyQuery(message) {
  const text = normalizeText(message);

  if (/(hostel|scholarship|safety|ragging|discipline|policy|regulation|rules|anti ragging|misconduct|admission|fees|attendance)/.test(text)) {
    return 'official_policy';
  }

  if (/(semester\s*[1-9]|question papers?|previous year|pyq|find .*paper|show .*papers|semester [0-9]|data structures|computer networks|cn|ds)/.test(text)) {
    return 'pyq_search';
  }

  return 'unknown';
}

function extractBestSnippet(doc, query) {
  const q = normalizeText(query);
  const haystack = normalizeText(doc.text || '');
  const title = normalizeText(doc.title || doc.filename || '');
  const candidates = [];

  if (!haystack && title) {
    return title.slice(0, 220);
  }

  if (!haystack) return '';

  const tokens = q.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    const idx = haystack.indexOf(token);
    if (idx >= 0) {
      candidates.push(idx);
    }
  }

  if (candidates.length === 0) {
    return haystack.slice(0, 500);
  }

  const target = Math.min(...candidates);
  const start = Math.max(0, target - 220);
  const end = Math.min(haystack.length, target + 420);
  return haystack.slice(start, end);
}

function buildResourceList(documents) {
  return documents.map((doc) => ({
    documentId: doc.id,
    title: doc.title || doc.filename,
    url: `/api/documents/${doc.id}/file`,
  }));
}

function buildCitation(doc) {
  const pageNumber = doc.pageNumber || doc.page || doc.chunks?.[0]?.pageNumber || 1;
  return {
    documentId: doc.id,
    title: doc.title || doc.filename,
    page: Number(pageNumber) || 1,
    sourceType: doc.sourceType || 'official',
    url: `/api/documents/${doc.id}/file`,
  };
}

function buildQueryVariants(query) {
  const normalized = normalizeText(query);
  const variants = new Set();

  for (const fragment of normalized.split(/\s+/)) {
    if (!fragment) continue;
    variants.add(fragment);
    variants.add(fragment.replace(/s$/, ''));
    variants.add(fragment.replace(/ies$/, 'y'));
    variants.add(fragment.replace(/sses$/, 'ss'));
  }

  return Array.from(variants).filter((value) => value.length > 1);
}

function getRelevantOfficialPolicy(message) {
  const text = normalizeText(message);

  if (/(hostel|accommodation|room|mess)/.test(text)) return 'hostel';
  if (/(scholarship|financial aid|fee waiver)/.test(text)) return 'scholarship';
  if (/(safety|ragging|anti[- ]ragging|misconduct|discipline|regulation)/.test(text)) return 'safety';

  return null;
}

function filterOfficialDocs(docs, policy) {
  if (!policy) return docs.slice(0, 6);

  return docs
    .filter((doc) => {
      const label = normalizeText(`${doc.title || ''} ${doc.filename || ''}`).toLowerCase();

      if (policy === 'hostel') return /hostel/.test(label);
      if (policy === 'scholarship') return /scholarship/.test(label);
      if (policy === 'safety') return /(safety|ragging|misconduct|anti[- ]ragging|regulation)/.test(label);
      return false;
    })
    .slice(0, 6);
}

function filterPyqDocs(docs, message) {
  const semester = inferSemesterFromQuery(message);
  const subject = inferSubjectFromQuery(message);
  const queryText = normalizeText(message);
  const variants = buildQueryVariants(message);

  let filtered = docs;

  if (semester) {
    filtered = filtered.filter((doc) => Number(doc.semester) === semester);
  }

  if (subject) {
    const subjectCode = normalizeText(subject).toLowerCase();
    const subjectMatches = filtered.filter((doc) => {
      const label = normalizeText(`${doc.title || ''} ${doc.filename || ''} ${doc.subject || ''} ${doc.courseCode || ''}`).toLowerCase();
      return (
        normalizeText(doc.subject || '').toLowerCase() === subjectCode ||
        label.includes(subjectCode) ||
        label.includes(subjectCode.replace(/\s+/g, ''))
      );
    });

    if (subjectMatches.length) {
      return subjectMatches.slice(0, 8);
    }
  }

  if (semester && filtered.length) {
    return filtered.slice(0, 8);
  }

  if (variants.length) {
    const directMatches = filtered.filter((doc) => {
      const label = normalizeText(`${doc.title || ''} ${doc.filename || ''} ${doc.subject || ''} ${doc.courseCode || ''}`).toLowerCase();
      return variants.some((variant) => variant && label.includes(variant));
    });

    if (directMatches.length) {
      return directMatches.slice(0, 8);
    }
  }

  if (/(previous|pyq|question|paper|papers)/.test(queryText) && !semester && !subject) {
    return filtered.slice(0, 8);
  }

  return [];
}

async function searchRelevantDocuments(message, forceSourceType = null) {
  const category = classifyQuery(message);
  const sourceType = forceSourceType || (category === 'official_policy' ? 'official' : category === 'pyq_search' ? 'pyq' : null);
  if (!sourceType) return [];

  const allDocs = await listDocuments({
    sourceType,
    limit: 200,
    includeNeedsReview: true,
  });

  const docs = allDocs.documents || [];
  if (!docs.length) return [];

  if (sourceType === 'official') {
    const policy = getRelevantOfficialPolicy(message);
    const matches = filterOfficialDocs(docs, policy);
    if (matches.length) return matches;
    return docs.slice(0, 6);
  }

  return filterPyqDocs(docs, message);
}

function buildAnswerFromDocs(message, docs, category) {
  if (!docs || docs.length === 0) {
    return {
      answer: 'I could not verify that from the local SRM PDF set available in this project. The relevant information was not found in the indexed official or PYQ documents.',
      citations: [],
      resources: [],
    };
  }

  if (category === 'pyq_search') {
    const list = docs.map((doc) => {
      const parts = [];
      if (doc.semester) parts.push(`Semester ${doc.semester}`);
      if (doc.year) parts.push(String(doc.year));
      if (doc.subject) parts.push(doc.subject);
      return `${doc.title}${parts.length ? ` (${parts.join(' • ')})` : ''}`;
    });

    return {
      answer: `I found the following relevant papers:\n- ${list.join('\n- ')}`,
      citations: docs.map(buildCitation),
      resources: buildResourceList(docs),
    };
  }

  const snippets = docs
    .map((doc) => {
      const excerpt = extractBestSnippet(doc, message);
      return excerpt ? `From ${doc.title || doc.filename}: ${excerpt.slice(0, 300)}` : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  const answerText = snippets.length > 0
    ? snippets.join('\n\n')
    : 'I found a relevant official SRM document, but the extracted text in this local copy is too limited to quote directly.';

  return {
    answer: answerText,
    citations: docs.map(buildCitation),
    resources: buildResourceList(docs),
  };
}

async function answerQuestion(message) {
  const category = classifyQuery(message);
  const forceSourceType = category === 'official_policy' ? 'official' : category === 'pyq_search' ? 'pyq' : null;
  const docs = await searchRelevantDocuments(message, forceSourceType);

  if (docs.length === 0) {
    return {
      answer: 'I could not verify that from the local documents currently available in this project.',
      citations: [],
      resources: [],
    };
  }

  return buildAnswerFromDocs(message, docs, category);
}

module.exports = {
  classifyQuery,
  answerQuestion,
};
