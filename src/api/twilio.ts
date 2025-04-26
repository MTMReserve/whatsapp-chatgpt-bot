// ===============================
// File: src/api/twilio.ts
// ===============================
import Twilio from 'twilio';

// Agora usamos o process.env direto, sem importar env
export const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);
