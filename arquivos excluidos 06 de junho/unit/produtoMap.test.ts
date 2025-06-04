// src/tests/unit/produtoMap.test.ts

import { produtoMap, ProdutoID } from '../../../src/produto/produtoMap';

describe('produtoMap', () => {
  it('deve retornar um produto válido com todas as propriedades essenciais', () => {
    const produto = produtoMap['produto1'];

    expect(produto).toBeDefined();
    expect(produto.nome).toBeTruthy();
    expect(produto.descricao).toBeTruthy();
    expect(Array.isArray(produto.beneficios)).toBe(true);
    expect(typeof produto.preco).toBe('string');
  });

  it('deve conter pelo menos dois produtos cadastrados', () => {
    const chaves = Object.keys(produtoMap);
    expect(chaves.length).toBeGreaterThanOrEqual(2);
  });

  it('deve retornar undefined para produto inválido', () => {
    const produtoInvalido = (produtoMap as any)['produto3'];
    expect(produtoInvalido).toBeUndefined();
  });

  it('cada produto deve ter no mínimo 3 benefícios', () => {
    for (const id in produtoMap) {
      const produto = produtoMap[id as ProdutoID];
      expect(produto.beneficios.length).toBeGreaterThanOrEqual(3);
    }
  });
});
