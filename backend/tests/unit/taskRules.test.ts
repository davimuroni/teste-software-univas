import { describe, it, expect, vi } from 'vitest'
import { canTransition } from '../../src/utils/taskRules'

describe('canTransition — RN01', () => {
  it.each([
    { from: 'PENDING', to: 'PENDING', esperado: false },
    { from: 'PENDING', to: 'IN_PROGRESS', esperado: true },
    { from: 'PENDING', to: 'COMPLETED', esperado: false },
    { from: 'PENDING', to: 'CANCELLED', esperado: true },
    { from: 'IN_PROGRESS', to: 'PENDING', esperado: false },
    { from: 'IN_PROGRESS', to: 'IN_PROGRESS', esperado: false },
    { from: 'IN_PROGRESS', to: 'COMPLETED', esperado: true },
    { from: 'IN_PROGRESS', to: 'CANCELLED', esperado: true },
    { from: 'COMPLETED', to: 'PENDING', esperado: false },
    { from: 'COMPLETED', to: 'IN_PROGRESS', esperado: false },
    { from: 'COMPLETED', to: 'COMPLETED', esperado: false },
    { from: 'COMPLETED', to: 'CANCELLED', esperado: false },
    { from: 'CANCELLED', to: 'PENDING', esperado: false },
    { from: 'CANCELLED', to: 'IN_PROGRESS', esperado: false },
    { from: 'CANCELLED', to: 'COMPLETED', esperado: false },
    { from: 'CANCELLED', to: 'CANCELLED', esperado: false },
  ])('de $from para $to retorna $esperado', ({ from, to, esperado }) => {
    // Arrange
    const origem = from
    const destino = to

    // Act
    const resultado = canTransition(origem, destino)

    // Assert
    expect(resultado).toBe(esperado)
  })
})
