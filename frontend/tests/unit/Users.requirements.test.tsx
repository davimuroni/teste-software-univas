import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Users from '../../src/components/Users'
import { api } from '../../src/services/api'

const emptyUsersResponse = { data: { data: [] } }

describe('Users — requisitos funcionais', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('exibe o estado de carregamento enquanto aguarda a lista (RF01)', async () => {
    let resolveRequest!: (response: typeof emptyUsersResponse) => void
    vi.spyOn(api, 'get').mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve
      }) as ReturnType<typeof api.get>,
    )

    render(<Users />)
    expect(screen.getByText('Carregando usuários...')).toBeInTheDocument()

    resolveRequest(emptyUsersResponse)
    await waitFor(() => expect(screen.queryByText('Carregando usuários...')).not.toBeInTheDocument())
  })

  it('mostra nome, email e zero tarefas para usuário sem tarefas (RF02)', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        data: [{ id: 'u1', name: 'Ana Silva', email: 'ana@example.com', createdAt: '2025-01-01', tasks: [] }],
      },
    })

    render(<Users />)

    const row = await screen.findByRole('row', { name: /Ana Silva ana@example\.com 0/ })
    expect(within(row).getByText('Ana Silva')).toBeInTheDocument()
    expect(within(row).getByText('ana@example.com')).toBeInTheDocument()
    expect(within(row).getByText('0')).toBeInTheDocument()
  })

  it('abre o formulário de criação (RF04)', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(emptyUsersResponse)
    const user = userEvent.setup()
    render(<Users />)

    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))

    expect(screen.getByText('Nome:')).toBeInTheDocument()
    expect(screen.getByText('Email:')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })

  it('fecha o formulário e limpa os campos ao cancelar (RF05)', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(emptyUsersResponse)
    const user = userEvent.setup()
    render(<Users />)

    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))
    const fields = screen.getAllByRole('textbox')
    await user.type(fields[0], 'Ana Silva')
    await user.type(fields[1], 'ana@example.com')
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Adicionar Usuário' }))
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('')
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('')
  })

  it('abre o formulário preenchido ao editar um usuário (RF06)', async () => {
    vi.spyOn(api, 'get').mockResolvedValue({
      data: {
        data: [{ id: 'u2', name: 'Bruno Lima', email: 'bruno@example.com', createdAt: '2025-01-01', tasks: [] }],
      },
    })
    const user = userEvent.setup()
    render(<Users />)

    await user.click(await screen.findByRole('button', { name: 'Editar' }))

    expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument()
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('Bruno Lima')
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('bruno@example.com')
  })

  it('associa os campos aos rótulos acessíveis (RF07)', async () => {
    vi.spyOn(api, 'get').mockResolvedValue(emptyUsersResponse)
    const user = userEvent.setup()
    render(<Users />)

    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))

    expect(screen.getByLabelText('Nome:')).toBeInTheDocument()
    expect(screen.getByLabelText('Email:')).toBeInTheDocument()
  })
})
