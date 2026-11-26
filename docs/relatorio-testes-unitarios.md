# Relatório de testes unitários

**Unidade testada:** `taskRules.ts` (RN01), `categoryRules.ts` (RN02) e `normalize.ts` (RN03).

## Casos de teste

As requisições abaixo são chamadas às funções unitárias. A função de regra informa uma decisão; ela não altera diretamente o estado persistido da tarefa ou da categoria.

### RN01 — Transição de status

| # | Estado inicial | Requisição | Resposta esperada | Efeito esperado |
|---|---|---|---|---|
| 1 | Tarefa `PENDING` | `canTransition(PENDING, PENDING)` | `false` | Status permanece `PENDING`. |
| 2 | Tarefa `PENDING` | `canTransition(PENDING, IN_PROGRESS)` | `true` | Transição permitida para `IN_PROGRESS`. |
| 3 | Tarefa `PENDING` | `canTransition(PENDING, COMPLETED)` | `false` | Status permanece `PENDING`. |
| 4 | Tarefa `PENDING` | `canTransition(PENDING, CANCELLED)` | `true` | Transição permitida para `CANCELLED`. |
| 5 | Tarefa `IN_PROGRESS` | `canTransition(IN_PROGRESS, PENDING)` | `false` | Status permanece `IN_PROGRESS`. |
| 6 | Tarefa `IN_PROGRESS` | `canTransition(IN_PROGRESS, IN_PROGRESS)` | `false` | Status permanece `IN_PROGRESS`. |
| 7 | Tarefa `IN_PROGRESS` | `canTransition(IN_PROGRESS, COMPLETED)` | `true` | Transição permitida para `COMPLETED`. |
| 8 | Tarefa `IN_PROGRESS` | `canTransition(IN_PROGRESS, CANCELLED)` | `true` | Transição permitida para `CANCELLED`. |
| 9 | Tarefa `COMPLETED` | `canTransition(COMPLETED, PENDING)` | `false` | Status permanece `COMPLETED`. |
| 10 | Tarefa `COMPLETED` | `canTransition(COMPLETED, IN_PROGRESS)` | `false` | Status permanece `COMPLETED`. |
| 11 | Tarefa `COMPLETED` | `canTransition(COMPLETED, COMPLETED)` | `false` | Status permanece `COMPLETED`. |
| 12 | Tarefa `COMPLETED` | `canTransition(COMPLETED, CANCELLED)` | `false` | Status permanece `COMPLETED`. |
| 13 | Tarefa `CANCELLED` | `canTransition(CANCELLED, PENDING)` | `false` | Status permanece `CANCELLED`. |
| 14 | Tarefa `CANCELLED` | `canTransition(CANCELLED, IN_PROGRESS)` | `false` | Status permanece `CANCELLED`. |
| 15 | Tarefa `CANCELLED` | `canTransition(CANCELLED, COMPLETED)` | `false` | Status permanece `CANCELLED`. |
| 16 | Tarefa `CANCELLED` | `canTransition(CANCELLED, CANCELLED)` | `false` | Status permanece `CANCELLED`. |

### RN02 — Exclusão de categoria

| # | Estado inicial | Requisição | Resposta esperada | Efeito esperado |
|---|---|---|---|---|
| 17 | Categoria sem tarefas (`tasksCount = 0`) | `canDeleteCategory(0)` | `true` | Exclusão autorizada pela regra; a função não exclui a categoria. |
| 18 | Categoria com uma tarefa (`tasksCount = 1`) | `canDeleteCategory(1)` | `false` | Exclusão impedida pela regra; categoria permanece. |
| 19 | Categoria com dez tarefas (`tasksCount = 10`) | `canDeleteCategory(10)` | `false` | Exclusão impedida pela regra; categoria permanece. |

### RN03 — Normalização de nomes

| # | Estado inicial (nome recebido) | Requisição | Resposta esperada | Efeito esperado |
|---|---|---|---|---|
| 20 | `"  Trabalho   da  Faculdade "` | `normalizeName(nome)` | `"trabalho da faculdade"` | Retorna nome sem espaços externos, espaços internos repetidos ou maiúsculas. |
| 21 | `"  categoria"` | `normalizeName(nome)` | `"categoria"` | Remove espaços iniciais. |
| 22 | `"categoria  "` | `normalizeName(nome)` | `"categoria"` | Remove espaços finais. |
| 23 | `"minha   categoria"` | `normalizeName(nome)` | `"minha categoria"` | Reduz espaços internos consecutivos a um espaço. |
| 24 | `"minha\tcategoria"` | `normalizeName(nome)` | `"minha categoria"` | Substitui tabulação interna por um espaço. |
| 25 | `"minha\ncategoria"` | `normalizeName(nome)` | `"minha categoria"` | Substitui quebra de linha interna por um espaço. |
| 26 | `"CATEGORIA"` | `normalizeName(nome)` | `"categoria"` | Converte letras para minúsculas. |
| 27 | `" categoria "` | `normalizeName(nome)` | `"categoria"` | Remove espaços externos e normaliza maiúsculas/minúsculas. |
| 28 | `"minha\t\n  categoria"` | `normalizeName(nome)` | `"minha categoria"` | Normaliza sequência mista de espaços em branco. |
| 29 | `"categoria"` | `normalizeName(nome)` | `"categoria"` | Mantém nome já normalizado. |

### RN04 — Atualização de status pela API

| Estado inicial | Requisição | Resposta esperada | Efeito esperado |
|---|---|---|---|
| Tarefa existente em status final (`COMPLETED` ou `CANCELLED`) | `PUT /api/tasks/:id` com uma mudança de status proibida pela RN01 | HTTP `400` | A tarefa permanece sem alteração; `task.update` não é chamado. |

## Execução das suítes

Comando executado nos diretórios `backend/` e `frontend/`: `npm.cmd test`.

| Parte | Arquivos | Testes | Aprovados | Reprovados |
|---|---:|---:|---:|---:|
| Backend | 4 | 34 | 34 | 0 |
| Frontend | 2 | 7 | 7 | 0 |

Cobertura de linhas e score global de mutação não foram calculados.

## Problemas encontrados e ajustes aplicados

| Regra | Problema encontrado | Ajuste aplicado | Verificação |
|---|---|---|---|
| RN01 | `PENDING → CANCELLED` retornava `false`, embora a transição seja permitida. | Incluída a transição na regra `canTransition`. | `taskRules.test.ts`: caso passa. |
| RN04 | A API respondia HTTP `200` para transição inválida e tentava atualizar a tarefa. | A API consulta o status atual, valida `canTransition` e responde HTTP `400` antes de atualizar. | `businessRules.integration.test.ts`: caso passa e confirma que `task.update` não é chamado. |
| RN03 | A criação salvava nomes sem normalização e aceitava variações duplicadas. | Nome normalizado antes de criar; conflito normalizado retorna HTTP `409`. Atualização de categoria também verifica duplicidade. | Três testes de integração para criação normalizada, duplicidade na criação e duplicidade na atualização passam. |
| RF07 | Rótulos de formulário não estavam associados aos campos. | Associados os elementos `label` e `input` por identificadores. | `Users.requirements.test.tsx`: consulta por `getByLabelText` passa. |

O teste conserva a expectativa definida pela especificação. O código de produção não foi alterado.

## Checklist de revisão e sinais de alerta

| Verificação | Resultado | Observação |
|---|---|---|
| Casos conferidos com `docs/especificacao.md` | Conforme | 16 casos RN01, 3 RN02, 10 RN03 e testes de integração RN03/RN04. |
| Estrutura de preparação, ação e verificação | Conforme | Os testes seguem Arrange, Act, Assert. |
| Expectativas explícitas e testes sem `skip`, `only` ou `todo` | Conforme | Casos tabulados com `it.each` e verificados com `toBe`. |
| Arquivos de produção preservados | Conforme | Nenhum arquivo em `backend/src/` foi modificado. |
| Importações sem uso | Ajustado | Removido `vi` não utilizado dos três testes unitários. |
| RN01 `PENDING → CANCELLED` | Corrigido | Transição adicionada e teste passou. |
| RN04 — HTTP 400 e tarefa sem alteração | Corrigido e coberto | Teste de integração verificou resposta e ausência de chamada de atualização. |
| Nomes duplicados após normalização (RN03) | Corrigido e coberto | Criação e atualização recusam nome normalizado já cadastrado. |
| Requisitos frontend RF01–RF07 | Cobertos | Os 7 testes existentes e novos passaram. |
| Dependências de teste do frontend | Ajustado | Dependências instaladas pelo `npm.cmd ci` usando `package-lock.json`; o Vitest ficou disponível sem alterar arquivos de versão. |
| Versão do Node no frontend | **Alerta** | O ambiente usa Node `v22.17.1`, abaixo do requisito `>=26` declarado no `package.json`. A suíte passou apesar do aviso de versão. |
| Relato das duas execuções | Conforme | Backend e frontend executados; resultados registrados abaixo. |

### Problemas registrados e ajustes

| Problema | Registro ou ajuste |
|---|---|
| RN01, RN04 e RN03 tinham divergências entre regra e implementação. | Regras de transição, atualização de tarefa e criação/edição de categorias ajustadas; testes unitários e de integração passam. |
| Vitest não estava disponível no frontend. | Dependências instaladas via `npm.cmd ci`; `package-lock.json` não foi alterado. |
| RF07 não associava os rótulos aos campos. | `label` e `input` associados; teste de acessibilidade passa. |
| Node do ambiente está abaixo do requisito declarado. | Testes passaram em Node `v22.17.1`, mas o projeto declara `>=26`; usar a versão declarada em CI/produção. |

## Avaliação com quatro sabotagens

As sabotagens foram aplicadas em cópias temporárias isoladas; as alterações experimentais não foram aplicadas ao código de produção. Cada teste direcionado detectou a mutação introduzida.

| # | Alteração sabotada | Teste que falhou | Resultado observado |
|---|---|---|---|
| 1 | Trocar a transição permitida `PENDING → IN_PROGRESS` por `PENDING → COMPLETED`. | RN01: `de PENDING para IN_PROGRESS retorna true`. | Esperado `true`, recebido `false`. |
| 2 | Remover a permissão de cancelar tarefa `IN_PROGRESS`. | RN01: `de IN_PROGRESS para CANCELLED retorna true`. | Esperado `true`, recebido `false`. |
| 3 | Inverter a condição de exclusão para aceitar somente `tasksCount !== 0`. | RN02: `retorna true para tasksCount=0`. | Esperado `true`, recebido `false`. |
| 4 | Converter o nome para maiúsculas em vez de minúsculas. | RN03: `normaliza letras maiúsculas`. | Esperado `categoria`, recebido `CATEGORIA`. |

Na reexecução direcionada, cada variante teve 1 teste-alvo reprovado; os demais casos ficaram fora do filtro de execução. Resultado: 4 de 4 sabotagens detectadas. Isso não representa um score global do Stryker.

## Prompts de execução

### Backend

```text
Use docs/especificacao.md e a tabela deste relatório como fonte dos resultados esperados. Mantenha ou implemente testes para RN01 (16 transições), RN02 (0, 1 e múltiplas tarefas), RN03 (normalização e nomes duplicados) e RN04 (HTTP 400 para transições inválidas sem alterar a tarefa). Corrija o código de produção quando divergir da especificação; não altere os resultados esperados dos testes. Não invente funções nem endpoints e não instale, remova ou atualize dependências. Execute `npm.cmd test` e `npm.cmd run build` no backend e informe os resultados.
```

### Frontend

```text
Use RF01–RF07 em docs/especificacao.md como fonte dos resultados esperados para o componente Users. Cubra carregamento, listagem com quantidade de tarefas (incluindo zero), erro da API, abertura do formulário de criação, cancelamento com limpeza dos campos, edição com formulário preenchido e associação acessível dos rótulos. Use React Testing Library e userEvent; substitua chamadas HTTP por mocks/spies, sem rede. Corrija a implementação do componente se necessário para atender à especificação; não altere expectativas dos testes. Não instale, remova ou atualize dependências. Execute `npm.cmd test` e `npm.cmd run build` no frontend e informe os resultados.
```

## Execução das suítes backend e frontend

| Parte | Comando | Resultado |
|---|---|---|
| Backend | `npm.cmd test` em `backend/` | 4 arquivos; 34 testes; todos aprovados. |
| Frontend | `npm.cmd test` em `frontend/` | 2 arquivos; 7 testes; todos aprovados. Vite exibiu aviso de configuração e o npm avisou que Node `v22.17.1` está abaixo do requisito `>=26`. |

A instalação foi feita pelo lockfile após solicitação. Os ajustes de implementação, cobertura e acessibilidade foram aplicados. As suítes de backend e frontend passaram integralmente.

### Builds

| Parte | Comando | Resultado |
|---|---|---|
| Backend | `npm.cmd run build` em `backend/` | TypeScript compilou com sucesso. |
| Frontend | `npm.cmd run build` em `frontend/` | TypeScript e Vite produziram o build com sucesso. |
