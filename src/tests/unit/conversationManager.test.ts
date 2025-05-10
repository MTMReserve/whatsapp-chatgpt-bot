// src/tests/unit/conversationManager.test.ts

import { getSystemPrompt } from '../../../src/services/conversationManager';
import * as prompts from '../../../src/prompts';

describe('ConversationManager', () => {
  it('deve retornar o prompt de sistema correto', () => {
    expect(getSystemPrompt()).toEqual(prompts.perfilClientePrompt);
  });
});
