import { openai } from '../../api/openai';
import OpenAI from 'openai';

describe('OpenAI ', () => {
  it('deve estar definido e ser instância de OpenAI', () => {
    expect(openai).toBeDefined();
    expect(openai).toBeInstanceOf(OpenAI);
  });
});
