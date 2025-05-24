// src/models/conversationModel.ts

import { Schema, model, Document } from 'mongoose';

export interface ConversationDocument extends Document {
  phone: string;
  messageIn: string;
  messageOut: string;
  intent: string;
  stateBefore: string;
  stateAfter: string;
  createdAt: Date;
}

const conversationSchema = new Schema<ConversationDocument>({
  phone: { type: String, required: true },
  messageIn: { type: String, required: true },
  messageOut: { type: String, required: true },
  intent: { type: String, required: true },
  stateBefore: { type: String, required: true },
  stateAfter: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);
