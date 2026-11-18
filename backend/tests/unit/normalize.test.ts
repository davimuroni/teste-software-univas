import { describe, it, expect, vi } from 'vitest'
import { normalizeName } from '../../src/utils/normalize'

describe('normalizeName — RN03', () => {
  it.each([
    { entrada: '  Trabalho   da  Faculdade ', esperado: 'trabalho da faculdade', caso: 'exemplo combinado' },
    { entrada: '  categoria', esperado: 'categoria', caso: 'espaço no início' },
    { entrada: 'categoria  ', esperado: 'categoria', caso: 'espaços no fim' },
    { entrada: 'minha   categoria', esperado: 'minha categoria', caso: 'espaços internos repetidos' },
    { entrada: 'minha\tcategoria', esperado: 'minha categoria', caso: 'tabulação interna' },
    { entrada: 'minha\ncategoria', esperado: 'minha categoria', caso: 'quebra de linha interna' },
    { entrada: 'CATEGORIA', esperado: 'categoria', caso: 'letras maiúsculas' },
    { entrada: ' categoria ', esperado: 'categoria', caso: 'espaços externos e minúsculas' },
    { entrada: 'minha\t\n  categoria', esperado: 'minha categoria', caso: 'sequência mista interna' },
    { entrada: 'categoria', esperado: 'categoria', caso: 'nome já normalizado' },
  ])('normaliza $caso', ({ entrada, esperado }) => {
    // Arrange
    const nome = entrada

    // Act
    const resultado = normalizeName(nome)

    // Assert
    expect(resultado).toBe(esperado)
  })
})
