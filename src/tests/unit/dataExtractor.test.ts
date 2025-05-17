// ==============================
// File: src/tests/unit/dataExtractor.test.ts
// ==============================

import {
  extractName,
  extractBudget,
  extractAddress,
  extractNameSmart
} from '../../../src/services/dataExtractor';
import * as openai from '../../../src/api/openai';

describe('Funções de Extração de Dados', () => {
  describe('extractName', () => {
    it('extrai nomes simples corretamente', () => {
      expect(extractName('Meu nome é João')).toBe('João');
      expect(extractName('Oi, sou Ana')).toBe('Ana');
      expect(extractName('Sou Pedro da Silva')).toBe('Pedro');
    });

    it('extrai nomes compostos corretamente', () => {
      expect(extractName('Me chamo Maria Clara')).toBe('Maria Clara');
    });

    it('retorna null quando não encontra nome', () => {
      expect(extractName('Oi tudo bem')).toBeNull();
    });
  });

  describe('extractBudget', () => {
    it('extrai valores numéricos corretos', () => {
      expect(extractBudget('Quero gastar até 150')).toBe(150);
      expect(extractBudget('Orçamento: 1.500,00')).toBe(1500);
      expect(extractBudget('Tenho 250 reais')).toBe(250);
    });

    it('retorna null quando não há valores', () => {
      expect(extractBudget('não sei')).toBeNull();
    });
  });

  describe('extractAddress', () => {
    it('extrai endereço corretamente', () => {
      const texto = 'Meu endereço é Rua das Flores, 123, Centro.';
      const endereco = extractAddress(texto);
      expect(typeof endereco).toBe('string');
      expect(endereco!.length).toBeGreaterThan(5);
    });

    it('retorna null quando não há endereço', () => {
      expect(extractAddress('Quero agendar')).toBeNull();
    });
  });

  describe('extractNameSmart', () => {
    it('retorna nome usando regex interna', async () => {
      const nome = await extractNameSmart('Meu nome é João da Silva');
      expect(nome).toBe('João da Silva');
    });

    it('usa fallback da IA quando regex falha', async () => {
      jest.spyOn(openai.openai.chat.completions, 'create').mockResolvedValue({
        choices: [{ message: { content: 'Carlos Eduardo' } }]
      } as any);

      const nome = await extractNameSmart('Texto sem nome claro');
      expect(nome).toBe('Carlos Eduardo');

      jest.restoreAllMocks();
    });

    it('retorna null e loga erro se fallback da IA falhar', async () => {
      jest.spyOn(openai.openai.chat.completions, 'create').mockRejectedValue(new Error('Erro simulado'));

      const nome = await extractNameSmart('Texto qualquer');
      expect(nome).toBeNull();

      jest.restoreAllMocks();
    });
  });
});
