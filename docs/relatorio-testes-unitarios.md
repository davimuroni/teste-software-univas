# Relatório — Testes unitários com IA generativa

**Aluno(s):** não informado  
**Ferramenta de IA utilizada:** Codex  
**Unidade testada:** `backend/src/utils/taskRules.ts` (RN01), `backend/src/utils/normalize.ts` (RN03) e `backend/src/utils/categoryRules.ts` (RN02, teste já existente)

## 1. Tabela de casos (elaborada antes de usar a IA)

### RN01 — Transição de status

| # | Entrada (de → para) | Resultado esperado | Técnica | Regra |
|---|---|---:|---|---|
| 1 | `PENDING → PENDING` | `false` | Mesmo status | RN01 |
| 2 | `PENDING → IN_PROGRESS` | `true` | Transição permitida | RN01 |
| 3 | `PENDING → COMPLETED` | `false` | Transição não listada | RN01 |
| 4 | `PENDING → CANCELLED` | `true` | Transição permitida | RN01 |
| 5 | `IN_PROGRESS → PENDING` | `false` | Transição não listada | RN01 |
| 6 | `IN_PROGRESS → IN_PROGRESS` | `false` | Mesmo status | RN01 |
| 7 | `IN_PROGRESS → COMPLETED` | `true` | Transição permitida | RN01 |
| 8 | `IN_PROGRESS → CANCELLED` | `true` | Transição permitida | RN01 |
| 9 | `COMPLETED → PENDING` | `false` | Status final | RN01 |
| 10 | `COMPLETED → IN_PROGRESS` | `false` | Status final | RN01 |
| 11 | `COMPLETED → COMPLETED` | `false` | Mesmo status; status final | RN01 |
| 12 | `COMPLETED → CANCELLED` | `false` | Status final | RN01 |
| 13 | `CANCELLED → PENDING` | `false` | Status final | RN01 |
| 14 | `CANCELLED → IN_PROGRESS` | `false` | Status final | RN01 |
| 15 | `CANCELLED → COMPLETED` | `false` | Status final | RN01 |
| 16 | `CANCELLED → CANCELLED` | `false` | Mesmo status; status final | RN01 |

### RN03 — Normalização de nomes

| # | Entrada | Resultado esperado | Técnica | Regra |
|---|---|---|---|---|
| 17 | `"  Trabalho   da  Faculdade "` | `"trabalho da faculdade"` | Combinação das etapas (exemplo da especificação) | RN03 |
| 18 | `"  categoria"` | `"categoria"` | Espaço em branco no início | RN03 |
| 19 | `"categoria  "` | `"categoria"` | Espaços em branco no fim | RN03 |
| 20 | `"minha   categoria"` | `"minha categoria"` | Espaços internos repetidos | RN03 |
| 21 | `"minha\tcategoria"` | `"minha categoria"` | Tabulação interna | RN03 |
| 22 | `"minha\ncategoria"` | `"minha categoria"` | Quebra de linha interna | RN03 |
| 23 | `"CATEGORIA"` | `"categoria"` | Conversão para minúsculas | RN03 |
| 24 | `" categoria "` | `"categoria"` | Espaços externos e maiúsculas/minúsculas | RN03 |
| 25 | `"minha\t\n  categoria"` | `"minha categoria"` | Sequência mista de espaços em branco | RN03 |
| 26 | `"categoria"` | `"categoria"` | Nome já normalizado | RN03 |

## 2. Prompt utilizado

```text
Implemente testes unitários para RN01 e RN03 em backend/tests/unit, usando as tabelas
de casos acima como requisitos. Siga AGENTS.md, não altere src/ nem instale dependências.
RN01: cubra as 16 combinações de status listadas na tabela, com os resultados esperados.
RN03: cubra os 10 casos de normalização listados na tabela, com os resultados esperados.
Inclua teste de duplicidade apenas se houver função ou API de comparação identificável;
não invente uma função. Use a implementação somente para conhecer a assinatura.
Ao finalizar, informe arquivos e testes criados.
```

## 3. Revisão do teste gerado

| Problema encontrado no teste gerado | Ajuste solicitado ou realizado |
|---|---|
| O caso RN01 `PENDING → CANCELLED` falha: o teste espera `true`, conforme especificação, mas a função retorna `false`. O teste está correto e evidencia divergência na implementação. | Solicitar ajuste no código de produção para permitir o cancelamento de tarefa pendente conforme RN01. Nenhum arquivo em `src/` foi alterado; manter o teste e a expectativa. |
| A regra de nomes duplicados normalizados não recebeu teste: a especificação descreve a regra, mas não identifica uma função/API comparadora testável. | Identificar a operação responsável pela comparação ou esclarecer a interface testável; então acrescentar um caso que compare nomes diferentes com a mesma normalização. Não inventar uma função de produção. |
| Nenhum outro problema funcional foi observado nos testes gerados; os demais casos passaram. | Nenhum ajuste necessário nos testes que passaram. |

## 4. Resultados

- Testes criados para RN01 e RN03: 26; teste preexistente de RN02: 3; total executado: 29.
- Aprovados: 28 | reprovados: 1 (RN01 `PENDING → CANCELLED`).
- Cobertura de linhas da unidade: não medida.
- Score de mutação: não calculado. O Stryker encontrou 47 mutantes, mas parou na execução inicial dos testes porque `canTransition — RN01 > de PENDING para CANCELLED retorna true` falhou (esperado `true`, recebido `false`). Como a mutação não chegou a ser executada/classificada, não há sobreviventes identificados para converter em novos casos na tabela.

## 5. Defeitos encontrados (divergências entre especificação e código)

| Regra | Comportamento especificado | Comportamento observado | Teste que evidencia |
|---|---|---|---|
| RN01 | `PENDING → CANCELLED` é permitida e deve retornar `true`. | A função retornou `false`. | `canTransition`: “de PENDING para CANCELLED retorna true”. |
