// src/tests/integration/conversationManager.test.ts

import { getSystemPrompt } from '../../../src/services/conversationManager';
import * as prompts from '../../../src/prompts';

describe('Integração: ConversationManager', () => {
  it('deve carregar o prompt de sistema com sucesso', () => {
    const prompt = getSystemPrompt();
    expect(prompt).toBe(prompts.perfilClientePrompt);
  });
});
