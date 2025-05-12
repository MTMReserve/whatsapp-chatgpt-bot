// ==============================
// File: src/tests/unit/dataExtractor.test.ts
// ==============================

import {
  extractName,
  extractBudget,
  extractAddress
} from '../../../src/services/dataExtractor';

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
      expect(extractBudget('Custa R$200,75?')).toBe(200.75);
    });

    it('retorna null quando não há valor', () => {
      expect(extractBudget('Não falei nenhum valor')).toBeNull();
    });
  });

  describe('extractAddress', () => {
    it('reconhece endereços plausíveis', () => {
      expect(extractAddress('Rua das Flores, 123 - Bairro Centro')).toBe('Rua das Flores, 123 - Bairro Centro');
      expect(extractAddress('Avenida Brasil, número 45')).toBe('Avenida Brasil, número 45');
    });

    it('retorna null para texto genérico curto', () => {
      expect(extractAddress('ok')).toBeNull();
      expect(extractAddress('tudo certo')).toBeNull();
    });
  });
});
