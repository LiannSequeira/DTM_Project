const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const { query } = require('../config/db');
const env = require('../config/env');
const { embedBatch } = require('./embedder');
const { upsertVector, getPineconeStatus } = require('./pinecone');

function sha256(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function listPdfFiles(rootDir) {
  if (!fs.existsSync(rootDir)) {
    return [];
  }

  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    entries.forEach((entry) => {
      const full = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && full.toLowerCase().endsWith('.pdf')) {
        files.push(full);
      }
    });
  }

  walk(rootDir);
  return files;
}

function splitIntoChunks(text, sourceMeta = {}) {
  const chunkSize = sourceMeta.chunkSize || 400;
  const overlap = sourceMeta.overlap || 50;

  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const words = normalized.split(' ');
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const slice = words.slice(i, i + chunkSize).join(' ');
    if (slice.trim()) {
      chunks.push(slice.trim());
    }
  }

  return chunks;
}

function detectLowText(text) {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return true;
  }

  const wordCount = cleaned.split(' ').length;
  return wordCount < 250 || cleaned.length < 600;
}

function inferSourceType(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.includes('official') || lower.includes('policy') || lower.includes('regulation') || lower.includes('rules')) {
    return 'official';
  }
  if (lower.includes('pyq') || lower.includes('previous') || lower.includes('question')) {
    return 'pyq';
  }
  return 'unknown';
}

async function ensureDocumentRecord(documentMeta) {
  if (!process.env.DATABASE_URL) {
    return { inserted: false, reason: 'DATABASE_URL missing' };
  }

  const existing = await query(
    'SELECT * FROM documents WHERE filename = $1 OR content_hash = $2 LIMIT 1',
    [documentMeta.filename, documentMeta.content_hash]
  );

  if (existing.rowCount > 0) {
    return { inserted: false, documentId: existing.rows[0].id, existed: true };
  }

  const result = await query(
    `INSERT INTO documents (
      source_type, category, title, filename, semester, course_code, subject, exam_date, year,
      page_count, authority, storage_path, ingestion_status, extraction_method, content_hash
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      documentMeta.source_type,
      documentMeta.category || null,
      documentMeta.title || null,
      documentMeta.filename,
      documentMeta.semester ?? null,
      documentMeta.course_code || null,
      documentMeta.subject || null,
      documentMeta.exam_date || null,
      documentMeta.year ?? null,
      documentMeta.page_count ?? null,
      documentMeta.authority || null,
      documentMeta.storage_path,
      documentMeta.ingestion_status,
      documentMeta.extraction_method || 'pdf-parse',
      documentMeta.content_hash,
    ]
  );

  return { inserted: true, documentId: result.rows[0].id, existed: false };
}

async function ingestAll() {
  const rootDir = env.DOCUMENTS_ROOT || path.resolve(__dirname, '../../data/documents');
  const pdfFiles = listPdfFiles(rootDir);

  if (pdfFiles.length === 0) {
    return {
      discovered: 0,
      ingested: 0,
      ocrNeeded: 0,
      chunks: 0,
      reason: 'No PDFs found under the configured documents root.',
    };
  }

  let ingested = 0;
  let ocrNeeded = 0;
  let chunks = 0;

  for (const filePath of pdfFiles) {
    const filename = path.basename(filePath);
    const contentHash = sha256(filePath);

    const sourceType = inferSourceType(filename);
    let extractedText = '';

    try {
      const data = await pdfParse(fs.readFileSync(filePath));
      extractedText = data.text || '';
    } catch (error) {
      extractedText = '';
    }

    const lowText = detectLowText(extractedText);
    const documentMeta = {
      source_type: sourceType,
      category: sourceType === 'official' ? 'official' : 'pyq',
      title: null,
      filename,
      semester: null,
      course_code: null,
      subject: null,
      exam_date: null,
      year: null,
      page_count: null,
      authority: sourceType === 'official' ? 'official' : null,
      storage_path: filePath,
      ingestion_status: lowText ? 'ocr_needed' : 'ingested',
      extraction_method: lowText ? 'pdf-parse-no-good-text' : 'pdf-parse',
      content_hash: contentHash,
    };

    const document = await ensureDocumentRecord(documentMeta);

    if (document.existed) {
      continue;
    }

    if (lowText) {
      ocrNeeded += 1;
      ingested += 1;
      continue;
    }

    const chunksList = splitIntoChunks(extractedText, { chunkSize: 400, overlap: 50 });

    for (let index = 0; index < chunksList.length; index += 1) {
      const chunkText = chunksList[index];
      const vector = await embedBatch([chunkText]);
      const pineconeStatus = getPineconeStatus();

      if (pineconeStatus.configured && vector[0]) {
        const vectorId = `${document.documentId}-chunk-${index}`;
        await upsertVector({
          id: vectorId,
          values: vector[0],
          metadata: {
            document_id: document.documentId,
            source_type: documentMeta.source_type,
            title: documentMeta.title || filename,
            filename,
            semester: documentMeta.semester,
            course_code: documentMeta.course_code,
            subject: documentMeta.subject,
            year: documentMeta.year,
            authority: documentMeta.authority,
          },
        });
      }

      await query(
        `INSERT INTO document_chunks (document_id, page_number, chunk_index, text, vector_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [document.documentId, 1, index, chunkText, undefined]
      );

      chunks += 1;
    }

    ingested += 1;
  }

  return {
    discovered: pdfFiles.length,
    ingested,
    ocrNeeded,
    chunks,
  };
}

module.exports = {
  ingestAll,
  listPdfFiles,
  determineSourceType: inferSourceType,
};
