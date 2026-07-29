# Component 03 — Shared Types — Concrete Structure Proposal

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Proposed
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento materializa documentalmente a estrutura concreta de Generic Command, Generic Event e Generic Query, eliminando o último item pendente das Open Decisions já classificadas em `SHARED_TYPES_ARTIFACT_SPECIFICATION.md` e confirmadas como lacuna real em `STRUCTURE_GAP_CONFIRMATION.md`. Nenhum conceito, contrato, padrão, ou tipo novo é criado — cada propriedade abaixo é extraída diretamente de `COMMAND_CATALOG.md`, `EVENT_CATALOG.md`, `QUERY_CATALOG.md`, `IMPLEMENTATION_GUIDELINES.md`, `SYSTEM_BLUEPRINT.md` e das ADRs já aprovadas para Shared Types. Nenhuma linguagem, tecnologia, ou formato concreto de dado é escolhido — toda propriedade é descrita conceitualmente, nunca como tipo técnico.*

---

## Generic Command

### Estrutura

| Propriedade | Descrição conceitual | Fonte |
|---|---|---|
| Nome do Command | Identificador nomeado da operação solicitada, expresso na linguagem do negócio (ex.: `CreateCustomer`) | `COMMAND_CATALOG.md`, "Business First" |
| Identificador de Submissão | Identificador único da solicitação específica, usado para verificação de idempotência | `COMMAND_CATALOG.md`, "Idempotency Where Applicable"; `IMPLEMENTATION_GUIDELINES.md`, linha 182 |
| Payload | Conjunto de parâmetros específicos da operação solicitada — opaco à forma genérica, definido por domínio | `COMMAND_CATALOG.md`, "Commands Are Explicit" |
| Versão de Contrato | Versão explícita do contrato deste Command | `COMMAND_CATALOG.md`, "Versionable Commands" |

### Propriedades

Nome do Command, Payload e Versão de Contrato são obrigatórios em todo Command, sem exceção. Identificador de Submissão é obrigatório sempre que o Command for sujeito a reprocessamento que poderia produzir efeito duplicado — condição já reconhecida como não universal pelo próprio princípio "Idempotency **Where Applicable**".

### Responsabilidades

Comunicar uma intenção de mudança de estado ainda não consolidada, dentro da fronteira de um único módulo proprietário (`BUSINESS_HUB_ARCHITECTURE.md`, Seção 7). Um Command nunca executa a si mesmo (`COMMAND_CATALOG.md`, Introdução).

### Regras Obrigatórias

- Processado exclusivamente pelo módulo já registrado como proprietário do conceito em `DOMAIN_OWNERSHIP_MATRIX.md` (`IMPLEMENTATION_GUIDELINES.md`, linha 174).
- Verificação de Permission junto ao Identity Hub sempre antes de qualquer outra verificação (`IMPLEMENTATION_GUIDELINES.md`, linha 184).
- Nunca retorna um Read Model — seu único retorno legítimo é confirmação de sucesso, de falha, ou identificador afetado (`COMMAND_CATALOG.md`, "Commands Never Query").
- Todo Command bem-sucedido publica o Evento correspondente antes de considerar sua execução concluída (`COMMAND_CATALOG.md`, "Commands May Publish Events").

### Invariantes

- Um Command nunca representa um fato já consumado (`COMMAND_CATALOG.md`, "Commands Never Represent Facts").
- O contrato de um Command já publicado, em uma dada versão, não é alterado — mudança de contrato exige nova versão (`COMMAND_CATALOG.md`, "Commands Are Immutable").
- Um Command é processado por exatamente um módulo (`COMMAND_CATALOG.md`, "Single Owner"; "No Shared Ownership").

---

## Generic Event

### Estrutura

| Propriedade | Descrição conceitual | Fonte |
|---|---|---|
| Identificador Único | Identificador que permite deduplicação e correlação | `EVENT_CATALOG.md`, Seção 7 (Regras de Publicação) |
| Timestamp de Ocorrência | Momento exato do fato de negócio, distinto do momento técnico de publicação | `EVENT_CATALOG.md`, Seção 7 |
| Referência ao Aggregate de Origem | Identificador da Entidade cujo estado o Evento descreve | `EVENT_CATALOG.md`, Seção 7 |
| Versão de Contrato | Versão explícita do contrato deste Evento | `EVENT_CATALOG.md`, "Versioned Events" |
| Nome do Evento | Identificador nomeado no particípio passado, refletindo fato já consumado (ex.: `CustomerCreated`) | `EVENT_CATALOG.md`, Introdução |
| Payload Conceitual | Conteúdo específico de domínio do fato ocorrido — opaco à forma genérica | `EVENT_CATALOG.md`, Seção 4 |

### Propriedades

Todas as seis propriedades acima são obrigatórias em todo Evento, sem exceção — nenhuma condição de "quando aplicável" é reconhecida por `EVENT_CATALOG.md` para nenhuma delas.

### Responsabilidades

Comunicar um fato de negócio já consumado, servindo como contrato de baixo acoplamento entre módulo produtor e módulo consumidor (`EVENT_CATALOG.md`, Introdução).

### Regras Obrigatórias

- Publicado exclusivamente pelo módulo produtor já registrado em `DOMAIN_OWNERSHIP_MATRIX.md` (`EVENT_CATALOG.md`, "Single Producer").
- Publicado somente após confirmação bem-sucedida do efeito de escrita que descreve, nunca antes (`IMPLEMENTATION_GUIDELINES.md`, linha 213).
- Processado em sequência estrita por Aggregate; paralelismo permitido apenas entre Aggregates distintos (`IMPLEMENTATION_GUIDELINES.md`, linha 217).
- Consumo idempotente garantido por verificação do Identificador Único antes de aplicar efeito de Projection (`IMPLEMENTATION_GUIDELINES.md`, linha 211).

### Invariantes

- Um Evento, uma vez publicado, nunca é alterado (`EVENT_CATALOG.md`, "Immutable Events"; `IMPLEMENTATION_GUIDELINES.md`, linha 205).
- Um Evento nunca é removido, apenas sujeito à política de retenção (`EVENT_CATALOG.md`, "Nunca deletar Evento").
- Um Evento nunca representa uma instrução futura, apenas um fato já consumado (`EVENT_CATALOG.md`, "Events Represent Facts").

---

## Generic Query

### Estrutura

| Propriedade | Descrição conceitual | Fonte |
|---|---|---|
| Nome da Query | Identificador nomeado do modelo de leitura solicitado (ex.: `CustomerView`) | `QUERY_CATALOG.md`, Seção 4 |
| Filtros | Parâmetros de busca/seleção, específicos por Query — opacos à forma genérica | `IMPLEMENTATION_GUIDELINES.md`, linha 248 |
| Ordenação | Critério de ordenação do resultado, quando aplicável, específico por Query | `IMPLEMENTATION_GUIDELINES.md`, linha 252 |
| Paginação / Limite | Corte explícito de volume de resultado | `IMPLEMENTATION_GUIDELINES.md`, linha 250 |
| Versão de Contrato | Versão explícita do contrato desta Query | `QUERY_CATALOG.md`, "Versionable Queries" |

### Propriedades

Filtros e Ordenação variam por Query específica, conforme já documentado individualmente em `QUERY_CATALOG.md` para cada entrada. Paginação é obrigatória sempre que o resultado não seja de tamanho intrinsecamente limitado (`IMPLEMENTATION_GUIDELINES.md`, linha 250).

### Responsabilidades

Recuperar um Read Model já materializado, retornando um resultado de leitura sem produzir efeito colateral (`QUERY_CATALOG.md`, Introdução).

### Regras Obrigatórias

- Verificação de Permission antes de resolver o resultado, nunca depois (`QUERY_CATALOG.md`, "Authorization First").
- Servida exclusivamente pelo módulo já proprietário do Read Model consultado (`QUERY_CATALOG.md`, "Read Models Respect Ownership").
- Respeita a janela de Consistência já documentada para a Query específica, nunca uma tolerância diferente da declarada (`IMPLEMENTATION_GUIDELINES.md`, linha 254).
- Respeita Tenant Isolation, sem exceção, mesmo em Query agregada (`QUERY_CATALOG.md`, "Tenant Isolation").

### Invariantes

- Uma Query nunca altera estado (`QUERY_CATALOG.md`, "Queries Never Change State").
- Uma Query nunca publica Evento (`QUERY_CATALOG.md`, Seção 7 — Regras de Leitura).
- Uma Query nunca executa Command (`QUERY_CATALOG.md`, Seção 7 — Regras de Leitura).

---

## Convenções

**Nomenclatura**: Command em forma imperativa (verbo + substantivo, ex.: `CreateCustomer`); Evento em particípio passado, descrevendo fato consumado (ex.: `CustomerCreated`); Query como substantivo ou sufixo "View" (ex.: `CustomerView`) — convenção já observada de forma universal e consistente em todas as entradas de `COMMAND_CATALOG.md`, `EVENT_CATALOG.md` e `QUERY_CATALOG.md`.

**Versionamento**: todo Command, Evento e Query carrega uma Versão de Contrato explícita. Uma mudança aditiva (novo campo opcional) não exige nova versão; uma mudança que remove ou altera o significado de um campo já existente exige nova versão publicada em paralelo à anterior durante toda a janela de transição (`EVENT_CATALOG.md`, Capítulo 8; `IMPLEMENTATION_GUIDELINES.md`, linha 207).

**Identificação**: todo Command carrega Identificador de Submissão (idempotência, quando aplicável); todo Evento carrega Identificador Único (deduplicação e correlação); toda Query é resolvida contra Filtros que já identificam unicamente o escopo do resultado solicitado.

**Ownership**: todo Command é processado exclusivamente pelo módulo proprietário (Single Owner); todo Evento é publicado exclusivamente pelo produtor (Single Producer); toda Query é servida exclusivamente pelo módulo proprietário do Read Model — os três já registrados em `DOMAIN_OWNERSHIP_MATRIX.md`.

**Rastreabilidade**: Tracing conecta o processamento de um Command, a mudança de Aggregate resultante, e o Evento publicado em consequência (`BUSINESS_HUB_ARCHITECTURE.md`, Seção "Observabilidade"); toda Query é observável através de Logs e Tracing (`QUERY_CATALOG.md`, Seção 7).

**Compatibilidade**: toda evolução de contrato preserva a capacidade de um consumidor já existente continuar processando a versão anterior durante o período de transição — princípio Backward Compatibility, já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Seção 9, e detalhado em `EVENT_CATALOG.md`, Capítulo 8.

---

## Validação

✓ Compatível com toda a arquitetura já aprovada — nenhuma propriedade contradiz `BUSINESS_HUB_ARCHITECTURE.md`, `DOMAIN_OWNERSHIP_MATRIX.md`, ou `SAAS_ARCHITECTURE.md`.
✓ Compatível com `COMMAND_CATALOG.md` — toda propriedade de Generic Command corresponde a um atributo ou princípio já catalogado.
✓ Compatível com `EVENT_CATALOG.md` — toda propriedade de Generic Event corresponde a uma regra já publicada na Seção 7 (Regras de Publicação).
✓ Compatível com `QUERY_CATALOG.md` — toda propriedade de Generic Query corresponde a um atributo ou princípio já catalogado.
✓ Compatível com `SYSTEM_BLUEPRINT.md` — nenhuma propriedade contradiz a Event-Driven Architecture nem a separação CQRS já estabelecidas.
✓ Compatível com `platform/PACKAGE_STRUCTURE_MANIFEST.md` — nenhum vocabulário de domínio introduzido; os três tipos permanecem genéricos, residentes em Core.
✓ Nenhuma alteração arquitetural.
✓ Nenhuma expansão de escopo.
✓ Nenhum novo conceito criado — toda propriedade já existia, dispersa, em documentação oficial já aprovada.
✓ Nenhuma funcionalidade criada — este documento não implementa nenhum dos três tipos.

### Verificação contra os Critérios de Aceitação (`ADR_SHARED_TYPES_ACCEPTANCE_CRITERIA.md`)

| Critério | Atendido? | Como |
|---|---|---|
| Neutralidade de Domínio | ✓ | Payload e Filtros permanecem opacos; nenhum campo de domínio específico é definido |
| Compatibilidade com os Catálogos Oficiais | ✓ | Cada propriedade rastreada a um dos três catálogos |
| Ausência de Acoplamento Adicional | ✓ | Nenhuma referência a Business Hub específico; apenas Ownership genérico via `DOMAIN_OWNERSHIP_MATRIX.md` |
| Independência Tecnológica | ✓ | Nenhum tipo de dado concreto, formato, linguagem, ou tecnologia definidos — toda propriedade é conceitual |
| Evolução Controlada | ✓ | Seção "Versionamento" define compatibilidade aditiva e transição de versão |
| Coerência entre Command, Event e Query | ✓ | Command referencia o Evento que publica; Evento referencia o Aggregate que um Command anterior originou; Query nunca cruza para escrita |

---

## Traceability

| Seção | Fonte |
|---|---|
| Generic Command | `COMMAND_CATALOG.md`, Seções 3, 4 e 7; `IMPLEMENTATION_GUIDELINES.md`, Seção 5 |
| Generic Event | `EVENT_CATALOG.md`, Seções 3, 4 e 7; `IMPLEMENTATION_GUIDELINES.md`, Seção 6 |
| Generic Query | `QUERY_CATALOG.md`, Seções 3, 4 e 7; `IMPLEMENTATION_GUIDELINES.md`, Seção 7 |
| Convenções | `EVENT_CATALOG.md`, Capítulo 8; `BUSINESS_HUB_ARCHITECTURE.md`, Seção 9; `DOMAIN_OWNERSHIP_MATRIX.md` |
| Validação | `ADR_SHARED_TYPES_ACCEPTANCE_CRITERIA.md`; `platform/PACKAGE_STRUCTURE_MANIFEST.md` |

Nenhum documento ausente foi identificado entre as fontes obrigatórias desta proposta.

---

## Approval

| Campo | Valor |
|---|---|
| Status | SHARED TYPES STRUCTURE APPROVED |
| Version | 1.0 |
| Author | Claude |
