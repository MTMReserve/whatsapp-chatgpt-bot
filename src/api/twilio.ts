// ===============================
// File: src/api/twilio.ts
// ===============================
import Twilio from 'twilio';
import { env } from '../config/env';

export const twilioClient = Twilio(env.TWILIO_SID, env.TWILIO_TOKEN);