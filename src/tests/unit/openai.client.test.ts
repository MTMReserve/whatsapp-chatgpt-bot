import { openaiClient } from '../../api/openai';
import OpenAI from 'openai';

describe('OpenAI Client', () => {
  it('deve estar definido e ser instância de OpenAI', () => {
    expect(openaiClient).toBeDefined();
    expect(openaiClient).toBeInstanceOf(OpenAI);
  });
});
