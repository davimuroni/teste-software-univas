import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    task: {
      findUnique: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('../../src/lib/prisma', () => ({ prisma: prismaMock }))

import app from '../../src/app'

describe('regras de negócio pela API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita transição inválida e não altera a tarefa (RN04)', async () => {
    prismaMock.task.findUnique.mockResolvedValue({ id: 'task-1', status: 'COMPLETED' })

    const response = await request(app)
      .put('/api/tasks/task-1')
      .send({ status: 'PENDING' })

    expect(response.status).toBe(400)
    expect(prismaMock.task.update).not.toHaveBeenCalled()
  })

  it('permite cancelar tarefa pendente pela API (RN01, RN04)', async () => {
    prismaMock.task.findUnique.mockResolvedValue({ id: 'task-2', status: 'PENDING' })
    prismaMock.task.update.mockResolvedValue({ id: 'task-2', status: 'CANCELLED' })

    const response = await request(app)
      .put('/api/tasks/task-2')
      .send({ status: 'CANCELLED' })

    expect(response.status).toBe(200)
    expect(prismaMock.task.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'task-2' }, data: { status: 'CANCELLED' } }),
    )
  })

  it('normaliza o nome de categoria ao criar (RN03)', async () => {
    prismaMock.category.findUnique.mockResolvedValue(null)
    prismaMock.category.create.mockResolvedValue({ id: 'cat-1', name: 'planejamento' })

    const response = await request(app)
      .post('/api/categories')
      .send({ name: '  Planejamento  ' })

    expect(response.status).toBe(201)
    expect(prismaMock.category.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: { name: 'planejamento' } }),
    )
  })

  it('recusa nome de categoria duplicado após normalização (RN03)', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 'cat-1', name: 'planejamento' })

    const response = await request(app)
      .post('/api/categories')
      .send({ name: ' PLANEJAMENTO ' })

    expect(response.status).toBe(409)
    expect(prismaMock.category.create).not.toHaveBeenCalled()
  })

  it('recusa nome normalizado que pertence a outra categoria ao atualizar (RN03)', async () => {
    prismaMock.category.findUnique.mockResolvedValue({ id: 'cat-1', name: 'planejamento' })

    const response = await request(app)
      .put('/api/categories/cat-2')
      .send({ name: ' PLANEJAMENTO ' })

    expect(response.status).toBe(409)
    expect(prismaMock.category.update).not.toHaveBeenCalled()
  })
})
