// ===============================
// File: src/api/openai.ts
// ===============================
import OpenAI from 'openai';

// Não importa mais env!

export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_KEY || '',
});
