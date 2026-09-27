const path = require('path');
const dotenv = require('dotenv');

const rootEnvPath = path.resolve(__dirname, '../../../.env');
const backendEnvPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: backendEnvPath });

module.exports = {
  PORT: Number(process.env.PORT || 4000),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'development-secret-change-me',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_INDEX: process.env.PINECONE_INDEX || '',
  PINECONE_NAMESPACE: process.env.PINECONE_NAMESPACE || 'campus-companion',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  LLM_BASE_URL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  DOCUMENTS_ROOT: process.env.DOCUMENTS_ROOT || path.resolve(__dirname, '../../../data/documents'),
  PDF_STORAGE_PATH: process.env.PDF_STORAGE_PATH || path.resolve(__dirname, '../../../data/documents'),
  APP_ENV: process.env.APP_ENV || 'development',
};
