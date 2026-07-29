# Governance Regularization

**Adaptive Business Platform v1.0 · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento decide e redige, de forma pronta para aplicação futura, a regularização das sete pendências de governança identificadas em `BUILD_VALIDATION.md`, Seções 3, 5 e 6. Nenhum código foi alterado. Nenhum arquivo TypeScript foi modificado. Nenhum contrato público foi alterado. Nenhuma arquitetura foi alterada. Consistente com a restrição de Entregável desta tarefa ("Produzir exclusivamente: `GOVERNANCE_REGULARIZATION.md`"), este documento **decide e redige o texto exato de cada amendment**, mas não aplica nenhuma dessas edições a `PACKAGE_STRUCTURE_MANIFEST.md`, a `SCOPE_FREEZE_V1.md`, ou a `DOCUMENTATION_INDEX.md` — a aplicação de cada texto já decidido permanece ação de governança distinta e futura, listada individualmente na Seção 9 (Itens Ainda Pendentes), mesmo padrão já usado em `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Seção 5 (Governance Actions), entre a decisão e sua execução.*

---

## 1. Objetivo

Regularizar, com decisão formal e texto pronto para aplicação, as sete pendências de governança já identificadas em `BUILD_VALIDATION.md`: o registro de `@abp/runtime` e de `@abp/ai-agents` em `PACKAGE_STRUCTURE_MANIFEST.md`; a Change Request de ambos em `SCOPE_FREEZE_V1.md`; o registro de `RUNTIME_ARCHITECTURE_DEFINITION.md` e de `AI_AGENTS_ARCHITECTURE_DEFINITION.md` em `DOCUMENTATION_INDEX.md`; e a decisão formal sobre o estado de `@abp/config`.

---

## 2. Decisão 1 — Inclusão de Runtime e de AI Agents em `PACKAGE_STRUCTURE_MANIFEST.md`

### Contexto

`BUILD_VALIDATION.md`, Seção 3.1, identificou que `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 2, declara exaustivamente oito agrupamentos arquiteturais de topo, e que nenhuma revisão formal ocorreu quando Runtime e AI Agents foram arquitetados e implementados — apesar de ambos já operarem, de fato, na posição exata que sua própria Architecture Definition já lhes atribui (camada transversal consumida por Automation Engine, AI Core e Business Hubs, no caso do Runtime; camada de consumo externo posicionada após o Runtime, no caso de AI Agents), sem violar nenhum princípio já fixado naquele manifesto.

### Decisão

**`PACKAGE_STRUCTURE_MANIFEST.md` é expandido de oito para dez agrupamentos arquiteturais de topo**, adicionando **Runtime** (9) e **AI Agents** (10) — nenhum dos dois é subordinado a um agrupamento já existente, pois nenhum dos oito originais os descreve com precisão: Runtime não é Automation (é consumido por Automation, mas também por AI Core e por Business Hubs, nunca de propriedade exclusiva de nenhum); AI Agents não é AI (é consumidor externo do AI Core, nunca parte de sua implementação interna).

### Texto do Amendment (pronto para aplicação)

**Seção 2 — Architectural Groupings**, adicionar ao final da lista:

> 9. **Runtime**
> 10. **AI Agents**
>
> Adicionado por `GOVERNANCE_REGULARIZATION.md`, Decisão 1, regularizando `@abp/runtime` e `@abp/ai-agents`, já implementados e já auditados (`RUNTIME_FINAL_VALIDATION.md`, `AI_AGENTS_FINAL_VALIDATION.md`, ambos APPROVED WITH OBSERVATIONS) sem registro formal prévio neste manifesto.

**Seção 3 — Grouping Responsibilities**, adicionar duas linhas à tabela:

> | **Runtime** | Espaço do substrato genérico de hospedagem de execução — Execution Context, Dispatch, Runtime Retry, Runtime Isolation Boundary, Runtime Observability — consumido por Automation Engine, por AI Core, e por Business Hubs, nunca redefinindo a lógica de nenhum dos três (`RUNTIME_ARCHITECTURE_DEFINITION.md`). |
> | **AI Agents** | Espaço da camada de consumo externo de capacidade apoiada por Agente — Agent Capability Request, Agent Delegation Record, Agent Task Result, Oversight Gate — consumida por Runtime, por Automation Engine, e por Business Hubs, nunca redefinindo o Agent Framework ou o Multi-Agent System internos do AI Core (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`). |

**Seção 4 — Dependency Matrix**, adicionar duas linhas:

> | **Runtime** | Core, Shared, Platform Services, AI (contrato externo), Business Hubs (contrato opaco), Automation (contrato opaco) | Apps, outro agrupamento redefinindo sua lógica interna |
> | **AI Agents** | Core, Shared, Platform Services, AI (contrato externo), Business Hubs (contrato opaco), Automation (contrato opaco), Runtime (contrato opaco) | Apps |

**Seção 8 — Manifest Validation Criteria**, item 1, atualizar de "Os oito agrupamentos" para "Os dez agrupamentos".

### Verificação de Não Introdução de Ciclo

A Dependency Matrix já vigente (Core/Shared/Infrastructure sem dependência; Platform Services → Core+Shared; AI → +Platform Services; Business Hubs → +Platform Services; Automation → +Business Hubs+AI; Apps → +Automation) permanece acíclica com a adição de Runtime (dependente de Automation, o elemento mais tardio da cadeia já existente) e de AI Agents (dependente de Runtime, agora o mais tardio) — nenhum dos dois é dependência de nenhum agrupamento já existente, preservando a direção estritamente unidirecional já demonstrada em `BUILD_VALIDATION.md`, Seção 4, item 7.

---

## 3. Decisão 2 — Change Request de Runtime em `SCOPE_FREEZE_V1.md`

### Contexto

`BUILD_VALIDATION.md`, Seção 3.2, identificou que Runtime nunca recebeu uma Change Request equivalente à já registrada para o AI Core em `SCOPE_FREEZE_V1.md` ("Enquadramento do AI Core — Esclarecimento"). Diferente do AI Core — cuja Change Request pôde legitimamente afirmar "nenhum escopo novo é adicionado... a Phase 4 já constava... antes da publicação original deste congelamento" —, Runtime não possui essa mesma base: `RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 0.3, já reconhece explicitamente que "não existe autoridade pré-existente para 'Runtime'". Esta Change Request, portanto, não pode ser uma mera confirmação de escopo já implícito — deve ser, com honestidade documental, um reconhecimento de extensão já construída e já validada, regularizada retroativamente.

### Decisão

**Runtime é formalmente regularizado como extensão arquitetural já compreendida na versão 1.0**, por regularização retroativa — não por confirmação de escopo pré-existente. A extensão é aceita porque: (a) decorre diretamente de uma necessidade estrutural já implícita em toda arquitetura anterior — Automation Engine, AI Core e Business Hubs sempre precisaram de algum substrato de hospedagem de execução, apenas nunca formalizado como camada própria antes deste trabalho; (b) já foi integralmente implementada e auditada, com zero import proibido, zero dependência circular, zero duplicação de responsabilidade de nenhum domínio já aprovado (`RUNTIME_FINAL_VALIDATION.md`); (c) não introduz nenhum novo Hub, nenhuma nova regra de negócio, e nenhuma nova capacidade de IA — apenas o "como" já implícito de encaminhar uma solicitação já permitida.

### Texto do Amendment (pronto para aplicação)

Adicionar a `SCOPE_FREEZE_V1.md`, imediatamente após a seção "Enquadramento do AI Core (Esclarecimento — Change Request)":

> ## Enquadramento do Runtime (Change Request — Regularização Retroativa)
>
> Diferente do esclarecimento do AI Core acima, este registro não confirma escopo já implícito — regulariza uma extensão arquitetural genuína, concebida e implementada após a publicação original deste congelamento, sem autoridade Volume I pré-existente (`RUNTIME_ARCHITECTURE_DEFINITION.md`, Seção 0.3, já reconhece esta condição explicitamente). O Runtime — substrato genérico de hospedagem de execução consumido por Automation Engine, AI Core e Business Hubs — é aqui formalmente incorporado ao escopo já congelado da versão 1.0, com base em: já ter sido integralmente implementado e auditado sem nenhuma violação de dependência, de acoplamento, ou de duplicação de responsabilidade de nenhum domínio já aprovado (`RUNTIME_FINAL_VALIDATION.md`, APPROVED WITH OBSERVATIONS); e em não introduzir nenhum novo Hub, nenhuma nova Regra de negócio, e nenhuma nova capacidade de IA — apenas o substrato de encaminhamento já implicitamente necessário a toda arquitetura anteriormente aprovada. Registrado por `GOVERNANCE_REGULARIZATION.md`, Decisão 2, em resposta à lacuna identificada em `BUILD_VALIDATION.md`, Seção 3.2.

---

## 4. Decisão 3 — Change Request de AI Agents em `SCOPE_FREEZE_V1.md`

### Contexto

Mesma situação da Decisão 2, aplicada a AI Agents: `AI_AGENTS_ARCHITECTURE_DEFINITION.md` não possui autoridade Volume I pré-existente, e nunca recebeu Change Request formal.

### Decisão

**AI Agents é formalmente regularizado como extensão arquitetural já compreendida na versão 1.0**, pela mesma via de regularização retroativa, pelas mesmas três razões já aplicadas ao Runtime: necessidade estrutural já implícita (a Action "Executar IA" do Automation Engine e o `DispatchTargetKind = "AIHub"` do Runtime já pressupunham, na prática, uma fronteira de consumo externo de capacidade de IA — AI Agents apenas formaliza essa fronteira já em uso); implementação e auditoria já concluídas sem violação (`AI_AGENTS_FINAL_VALIDATION.md`, APPROVED WITH OBSERVATIONS); e ausência de nova regra de negócio, novo Hub, ou redefinição de capacidade já existente do AI Core.

### Texto do Amendment (pronto para aplicação)

Adicionar a `SCOPE_FREEZE_V1.md`, imediatamente após a seção "Enquadramento do Runtime" (Decisão 2 acima):

> ## Enquadramento do AI Agents (Change Request — Regularização Retroativa)
>
> Mesma natureza de regularização já aplicada ao Runtime acima: AI Agents — a camada de consumo externo de capacidade apoiada por Agente, consumida por Runtime, por Automation Engine, e por Business Hubs — é formalmente incorporada ao escopo já congelado da versão 1.0, sem autoridade Volume I pré-existente (`AI_AGENTS_ARCHITECTURE_DEFINITION.md`, Seção 0.2, já reconhece a ausência de arquivo correspondente entre os documentos originalmente citados como Base Obrigatória). A extensão é aceita porque já formaliza um padrão de consumo externo do AI Core já em uso — a Action "Executar IA" (`AUTOMATION_ENGINE.md`, Capítulo 11) e a categoria `"AIHub"` do `DispatchTargetKind` (`@abp/runtime`, Sprint 7.1) já pressupunham, na prática, exatamente esta fronteira —, e porque já foi integralmente implementada e auditada sem duplicar o Agent Framework, o Reasoning, o Planning, a Memory, ou o Multi-Agent System já internos ao AI Core, e sem duplicar o Approval Engine já interno ao Automation Engine (`AI_AGENTS_FINAL_VALIDATION.md`, APPROVED WITH OBSERVATIONS). Registrado por `GOVERNANCE_REGULARIZATION.md`, Decisão 3, em resposta à lacuna identificada em `BUILD_VALIDATION.md`, Seção 3.2.

---

## 5. Decisão 4 — Registro de `RUNTIME_ARCHITECTURE_DEFINITION.md` em `DOCUMENTATION_INDEX.md`

### Decisão

**`RUNTIME_ARCHITECTURE_DEFINITION.md` é registrado como Draft**, consistente com seu próprio cabeçalho de Status já vigente, na mesma lista de `docs/implementation/`.

### Texto do Amendment (pronto para aplicação)

`DOCUMENTATION_INDEX.md`, §7.2, lista **Draft**, adicionar ao conjunto já existente:

> `RUNTIME_ARCHITECTURE_DEFINITION.md`

---

## 6. Decisão 5 — Registro de `AI_AGENTS_ARCHITECTURE_DEFINITION.md` em `DOCUMENTATION_INDEX.md`

### Decisão

**`AI_AGENTS_ARCHITECTURE_DEFINITION.md` é registrado como Draft**, mesma justificativa da Decisão 4.

### Texto do Amendment (pronto para aplicação)

`DOCUMENTATION_INDEX.md`, §7.2, lista **Draft**, adicionar ao mesmo conjunto, junto ao item da Decisão 4:

> `RUNTIME_ARCHITECTURE_DEFINITION.md` · `AI_AGENTS_ARCHITECTURE_DEFINITION.md`

---

## 7. Decisão 6 — Estado de `@abp/config`

### Contexto

`BUILD_VALIDATION.md`, Seção 3.3, identificou que `@abp/config` é um pacote órfão: `package.json` incompleto em relação ao template padrão, sem `tsconfig.json`, sem diretório `src/`, sem referência em `platform/tsconfig.json`, e sem nenhum papel não já coberto por `@abp/shared` (`ConfigurationLoader.ts`, `ConfigurationLoadFailure.ts`) — `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3, já declara "Configuration" como sub-componente de Shared, nunca como pacote independente.

### Decisão

**`@abp/config` é formalmente decidido para Remoção** — não para conclusão nem para manutenção. Justificativa: Manter perpetuaria um pacote sem posição na estrutura já aprovada, sem consumidor, e sem correspondência a nenhum dos agora dez agrupamentos (Decisão 1); Concluir exigiria construir, do zero, um segundo mecanismo de Configuration paralelo ao já existente e já suficiente em `@abp/shared`, violando diretamente `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3, e o princípio de Centralização já reafirmado em toda esta série; Remover é a única opção consistente com a arquitetura já aprovada, e de menor risco — o pacote não é referenciado por nenhum outro arquivo além de seu próprio `package.json`.

A execução desta decisão — a remoção física do diretório `platform/packages/config/` — permanece ação de governança distinta e futura, fora do escopo desta tarefa exclusivamente documental ("Não implementar código").

---

## 8. Pendências Regularizadas

| # | Pendência (`BUILD_VALIDATION.md`) | Decisão | Texto pronto para aplicação |
|---|---|---|---|
| 1 | `@abp/runtime` não registrado em `PACKAGE_STRUCTURE_MANIFEST.md` | Decisão 1 — inclusão como 9º agrupamento | Seção 2 acima |
| 2 | `@abp/ai-agents` não registrado em `PACKAGE_STRUCTURE_MANIFEST.md` | Decisão 1 — inclusão como 10º agrupamento | Seção 2 acima |
| 3 | Runtime sem Change Request em `SCOPE_FREEZE_V1.md` | Decisão 2 — regularização retroativa | Seção 3 acima |
| 4 | AI Agents sem Change Request em `SCOPE_FREEZE_V1.md` | Decisão 3 — regularização retroativa | Seção 4 acima |
| 5 | `RUNTIME_ARCHITECTURE_DEFINITION.md` não registrado em `DOCUMENTATION_INDEX.md` | Decisão 4 — registro como Draft | Seção 5 acima |
| 6 | `AI_AGENTS_ARCHITECTURE_DEFINITION.md` não registrado em `DOCUMENTATION_INDEX.md` | Decisão 5 — registro como Draft | Seção 6 acima |
| 7 | Estado indefinido de `@abp/config` | Decisão 6 — Remoção | Seção 7 acima |

---

## 9. Itens Ainda Pendentes

Nenhuma das seis decisões acima foi aplicada aos arquivos que regularizam — este documento decide e redige; não edita. Permanecem como ações de governança distintas e futuras:

- Aplicar o texto da Decisão 1 a `PACKAGE_STRUCTURE_MANIFEST.md` (Seções 2, 3, 4 e 8).
- Aplicar o texto da Decisão 2 a `SCOPE_FREEZE_V1.md` (nova seção "Enquadramento do Runtime").
- Aplicar o texto da Decisão 3 a `SCOPE_FREEZE_V1.md` (nova seção "Enquadramento do AI Agents").
- Aplicar o texto das Decisões 4 e 5 a `DOCUMENTATION_INDEX.md`, §7.2.
- Executar a remoção física de `platform/packages/config/` (Decisão 6) — ação sobre arquivo de pacote, não sobre documento, portanto também fora do escopo desta tarefa.
- **Observação residual, fora do Escopo explícito desta tarefa**: `BUILD_VALIDATION.md`, Seção 6, também apontou que os relatórios de Sprint, as Readiness Assessments, os Implementation Backlogs, e as Final Validations de Runtime e de AI Agents — além do próprio `BUILD_VALIDATION.md` — permanecem não registrados em `DOCUMENTATION_INDEX.md`. O Escopo desta tarefa autorizou exclusivamente o registro de `RUNTIME_ARCHITECTURE_DEFINITION.md` e de `AI_AGENTS_ARCHITECTURE_DEFINITION.md` (Decisões 4 e 5) — o registro do restante da família documental permanece pendência aberta, não decidida por este documento, candidata a uma futura regularização adicional.
- `GROWTH_HUB.md` permanece Draft — pendência herdada da Phase 5, não afetada por esta regularização.

---

## 10. Confirmação

Nenhum código foi alterado. Nenhum arquivo TypeScript foi modificado. Nenhum contrato público foi alterado. Nenhuma arquitetura foi alterada. `PACKAGE_STRUCTURE_MANIFEST.md`, `SCOPE_FREEZE_V1.md`, e `DOCUMENTATION_INDEX.md` permanecem, nesta etapa, inalterados — cada amendment já decidido nesta Seção permanece redigido e pronto, aguardando aplicação formal futura. A Compiler Validation não foi iniciada.

---

## Approval

| Campo | Valor |
|---|---|
| Status | GOVERNANCE REGULARIZATION DECIDED — PENDING APPLICATION |
| Version | 1.0 |
| Author | Claude |
