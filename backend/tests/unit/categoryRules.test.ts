import { describe, it, expect, vi } from 'vitest'
import { canDeleteCategory } from '../../src/utils/categoryRules'

describe('canDeleteCategory — RN02', () => {
  it.each([
    { tasksCount: 0, esperado: true, tecnica: 'valor-limite' },
    { tasksCount: 1, esperado: false, tecnica: 'valor-limite' },
    { tasksCount: 10, esperado: false, tecnica: 'partição' },
  ])('retorna $esperado para tasksCount=$tasksCount ($tecnica)', ({ tasksCount, esperado }) => {
    // Arrange
    const count = tasksCount

    // Act
    const resultado = canDeleteCategory(count)

    // Assert
    expect(resultado).toBe(esperado)
  })
})
