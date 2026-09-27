const express = require('express');
const router = express.Router();
const { listDocuments, getDocumentById, getDocumentFilePath } = require('../services/documents');

function normalizeDocType(value) {
  const raw = String(value || '').toLowerCase();
  if (raw === 'official' || raw === 'policy') return 'official';
  if (raw === 'pyq' || raw === 'previous') return 'pyq';
  return raw || null;
}

router.get('/resource-hub/tree', async (req, res) => {
  const docs = await listDocuments({ limit: 500 });
  const categories = [
    {
      id: 'official',
      label: 'Official Documents',
      documents: docs.documents.filter((doc) => doc.sourceType === 'official'),
    },
    {
      id: 'pyq',
      label: 'Previous Year Questions',
      documents: docs.documents.filter((doc) => doc.sourceType === 'pyq'),
    },
  ];

  res.json({ categories, total: docs.total || 0 });
});

router.get('/resource-hub/documents', async (req, res) => {
  const rawType = normalizeDocType(req.query.type || req.query.sourceType);
  const filters = {
    sourceType: rawType,
    semester: req.query.semester || undefined,
    year: req.query.year || undefined,
    subject: req.query.subject || undefined,
    courseCode: req.query.courseCode || undefined,
    search: req.query.search || undefined,
    limit: req.query.limit || 100,
  };

  const docs = await listDocuments(filters);
  res.json({
    documents: docs.documents,
    total: docs.total || 0,
    configured: docs.configured !== false,
    reason: docs.reason || null,
  });
});

router.get('/documents/:id', async (req, res) => {
  const document = await getDocumentById(req.params.id);

  if (!document) {
    return res.status(404).json({ error: 'Document not found', code: 'DOCUMENT_NOT_FOUND' });
  }

  res.json({
    ...document,
    source_type: document.sourceType,
    url: `/api/documents/${document.id}/file`,
  });
});

router.get('/documents/:id/file', async (req, res) => {
  const document = await getDocumentById(req.params.id);

  if (!document) {
    return res.status(404).json({ error: 'Document not found', code: 'DOCUMENT_NOT_FOUND' });
  }

  const filePath = await getDocumentFilePath(document);

  if (!filePath) {
    return res.status(404).json({ error: 'Document file is missing', code: 'FILE_NOT_FOUND' });
  }

  res.sendFile(filePath, (error) => {
    if (error && !res.headersSent) {
      res.status(500).json({ error: 'Unable to serve document file', code: 'FILE_SERVE_ERROR' });
    }
  });
});

module.exports = router;
