# Volume II Foundational Decisions

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento registra formalmente as decisões arquiteturais decorrentes de `VOLUME_II_CONSOLIDATION_REPORT.md`, e as decisões adicionais produzidas pela auditoria "Phase 4 — AI Core Architectural Governance Remediation". Ele não altera `AI_MANIFESTO.md`, `AI_AGENT_ECOSYSTEM.md`, `AI_GOVERNANCE.md`, ou `AI_HUB.md`, e não inicia nenhuma implementação. A Seção 5 registra que as quatro ações de governança da Versão 1.0 já foram executadas fora deste documento; as Decisions 007 e 008, adicionadas na Versão 1.1, não exigem nenhuma ação de execução própria além do já registrado em seus respectivos Impact.*

---

## 1. Purpose

Este documento torna oficiais as decisões de governança que `VOLUME_II_CONSOLIDATION_REPORT.md` identificou como necessárias, mas não tomou por conta própria — aquele relatório analisou evidência; este documento decide sobre ela, na mesma separação de responsabilidade já usada no Repository Cleanup entre `REPOSITORY_AUDIT_REPORT.md` e `REPOSITORY_DECISIONS.md`. Nenhuma decisão aqui registrada é executada por este documento — sua execução pertence às Governance Actions listadas na Seção 5, cada uma explicitamente pendente.

---

## 2. Decision 004 — Foundational Document

### Contexto

`VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 4, identificou que dois documentos reivindicam simultaneamente o papel de fundação do Volume II: `AI_MANIFESTO.md` (`docs/ai/`, Status Frozen) e `AI_AGENT_ECOSYSTEM.md` (`docs/architecture/ai/`, Status Draft), sem que nenhum dos dois cite ou reconheça o outro.

### Evidências

- `DOCUMENTATION_INDEX.md`, §6, já designa `ai/AI_MANIFESTO.md (Frozen)` como o Main Document do Volume II — a única designação formalmente vigente no sistema de documentação.
- Os sete documentos subsequentes do Volume II (`AI_ARCHITECTURE.md`, `AI_ORCHESTRATOR.md`, `AGENT_FRAMEWORK.md`, `CONTEXT_FRAMEWORK.md`, `AI_GOVERNANCE.md`, `AI_OBSERVABILITY.md`, `AI_IMPLEMENTATION.md`) citam `AI_MANIFESTO.md` explicitamente como a filosofia da qual dependem; nenhum cita `AI_AGENT_ECOSYSTEM.md`.
- `AI_AGENT_ECOSYSTEM.md` não está registrado em `DOCUMENTATION_INDEX.md`, tem data de modificação posterior a toda a série já existente, e não é citado por nenhum documento da plataforma além do próprio `VOLUME_II_CONSOLIDATION_REPORT.md` e do `VOLUME_II_AI_HANDBOOK.md`.
- O conflito identificado é de autoridade estrutural (dois documentos não podem ambos ser fonte única de verdade), não de conteúdo — as definições centrais de Agente nos dois documentos são compatíveis em espírito, conforme já analisado no Consolidation Report, Seção 4.

### Decisão

**`AI_MANIFESTO.md` é declarado oficialmente o documento fundador do Volume II.** Esta decisão apenas confirma, formalmente e ao nível de governança do Volume II, a designação que `DOCUMENTATION_INDEX.md`, §6, já atribuía a `AI_MANIFESTO.md`.

**`AI_AGENT_ECOSYSTEM.md` passa a ser um documento de especificação arquitetural subordinado ao Manifesto**, não mais um documento fundador concorrente. Seu conteúdo técnico — a definição precisa de Agent, Ecosystem, e dos seis termos distinguidos em seu Capítulo 5, além do modelo de colaboração sem dependência direta entre Agentes — permanece uma contribuição arquitetural válida; o que muda é sua posição na hierarquia do Volume II, nunca seu conteúdo, que não é alterado por esta decisão.

### Justificativa

A decisão segue diretamente a evidência já reunida em `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 4: `AI_MANIFESTO.md` já exerce o papel fundador na prática estrutural do Volume II — está Frozen, é a fonte que toda a série já publicada cita, e já é a designação oficial do Índice do sistema de documentação. Subordinar `AI_AGENT_ECOSYSTEM.md` ao Manifesto, em vez de descontinuá-lo ou promovê-lo, preserva o trabalho técnico já produzido nele sem exigir o processo de Amendment sobre um documento Frozen (Constitution §8.3) — uma barreira de aprovação deliberadamente mais alta, que esta decisão não tem necessidade de acionar, já que nenhum conteúdo de `AI_MANIFESTO.md` precisa mudar para que esta subordinação se torne verdadeira.

### Impacto

`AI_MANIFESTO.md` permanece Frozen e inalterado. `AI_AGENT_ECOSYSTEM.md` permanece Draft e inalterado em conteúdo, mas sua autodeclaração ("It is the founding document of Volume II") deixa de refletir sua posição real na hierarquia — uma correção editorial pendente, listada na Seção 5, não executada aqui. Todo documento futuro do Volume II — incluindo os seis ainda não escritos (`MEMORY_OS.md`, `REASONING_ENGINE.md`, `PLANNING_ENGINE.md`, `SKILL_RUNTIME.md`, `TOOL_RUNTIME.md`, `MULTI_AGENT_SYSTEM.md`) — deve respeitar `AI_MANIFESTO.md` como fundação primária, podendo consultar `AI_AGENT_ECOSYSTEM.md` como especificação subordinada e complementar, nunca como fundação alternativa.

---

## 3. Decision 005 — Naming Standard

### Contexto

`VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 5, identificou um drift de nomenclatura entre `CONTEXT_OS` — nome usado pela Matriz de Dependências de `AI_IMPLEMENTATION.md`, Capítulo 7, para o documento #05 — e `CONTEXT_FRAMEWORK.md`, o nome de arquivo real e único documento que efetivamente existe para esse conceito.

### Evidências

- `CONTEXT_FRAMEWORK.md`, em sua própria introdução, declara elevar o Contexto a um sistema que "aqui denominado Context Operating System, ou Context OS" — ou seja, "Context OS" é o nome do sistema técnico que o documento define internamente, não um documento ou arquivo distinto.
- Não existe, em nenhum lugar do repositório, um arquivo `CONTEXT_OS.md` — confirmando que não há dois documentos concorrentes, apenas um documento referenciado por dois rótulos diferentes em fontes diferentes.

### Decisão

**`CONTEXT_FRAMEWORK` torna-se a nomenclatura oficial** para toda referência externa a este documento — em roadmaps, matrizes de dependência, e qualquer documento futuro do Volume II. **`CONTEXT_OS` passa a ser tratado como termo legado**, reservado exclusivamente ao nome do sistema técnico discutido em prosa dentro do próprio `CONTEXT_FRAMEWORK.md`, até sua substituição gradual nas ocorrências externas já existentes.

### Impacto

Nenhum conteúdo de `CONTEXT_FRAMEWORK.md` é alterado por esta decisão. A única ocorrência externa identificada do termo legado (`AI_IMPLEMENTATION.md`, Capítulo 7, Matriz de Dependências) permanece como está até revisão futura, listada na Seção 5. O mesmo cuidado de nomenclatura se aplica preventivamente ao documento ainda não escrito `MEMORY_OS.md`: seu nome de arquivo já coincide com o nome do sistema que descreverá, portanto nenhum drift equivalente é esperado ali, desde que futuras referências externas usem consistentemente o nome de arquivo.

---

## 4. Decision 006 — Historical Dependency Exception

### Contexto

`VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 6, identificou que `AI_GOVERNANCE.md` já foi escrito e publicado em status Official antes da existência de `MULTI_AGENT_SYSTEM.md`, do qual depende segundo a própria Matriz de Dependências de `AI_IMPLEMENTATION.md`, Capítulo 7 (Ordem 9 depende de Ordem 8).

### Evidências

- A Matriz de Dependências declara textualmente: "`AI_GOVERNANCE.md` só pôde ser escrito depois de `MULTI_AGENT_SYSTEM.md` porque a Governança pressupõe a existência de toda ação de IA que ela governa."
- `MULTI_AGENT_SYSTEM.md` não existe como arquivo em nenhum lugar do repositório, confirmando que essa premissa não se verificou na prática — `AI_GOVERNANCE.md` foi escrito sem que seu pré-requisito declarado existisse.

### Decisão

**Esta inversão histórica é aceita como exceção formalmente registrada, não exige reescrita de `AI_GOVERNANCE.md`.** O conteúdo de `AI_GOVERNANCE.md` foi escrito no nível conceitual de Política, Auditoria e Conformidade — um nível que permanece válido independentemente da existência técnica de `MULTI_AGENT_SYSTEM.md` — e não depende, para sua própria coerência interna, de nenhum detalhe que apenas aquele documento ainda não escrito viria a fornecer.

### Impacto

`AI_GOVERNANCE.md` permanece Official e inalterado. Quando `MULTI_AGENT_SYSTEM.md` for eventualmente escrito (Ordem 8, conforme a Ordem Oficial de Implementação), ele deve ser produzido em conformidade com o que `AI_GOVERNANCE.md` já estabelece sobre Política, Auditoria e Conformidade aplicável a qualquer ação de IA multiagente — a dependência declarada pela Matriz passa a ser entendida como uma dependência de coerência a ser verificada retroativamente no momento em que `MULTI_AGENT_SYSTEM.md` for escrito, não como uma precondição temporal que impediria `AI_GOVERNANCE.md` de já existir.

---

## 5. Governance Actions

As quatro ações abaixo foram identificadas como pendentes na Versão 1.0 deste documento. Todas as quatro foram, desde então, executadas fora deste documento; esta seção é atualizada para refletir esse fato, conforme confirmado por revisão direta na tarefa "Phase 4 — AI Core Architectural Governance Remediation":

- ~~Atualizar `DOCUMENTATION_INDEX.md` para registrar formalmente a posição de `AI_AGENT_ECOSYSTEM.md` como documento subordinado ao Manifesto (Decision 004), e para registrar a existência de `VOLUME_II_AI_HANDBOOK.md`, `VOLUME_II_CONSOLIDATION_REPORT.md` e deste próprio documento.~~ **Executada.** `DOCUMENTATION_INDEX.md` já registra, em sua descrição de `docs/ai/` e de `docs/architecture/ai/`, a subordinação de `AI_AGENT_ECOSYSTEM.md` a `AI_MANIFESTO.md` (Decision 004) e a existência dos três documentos de governança do Volume II.
- ~~Atualizar referências cruzadas entre `AI_MANIFESTO.md` e `AI_AGENT_ECOSYSTEM.md`~~ **Executada.** `AI_AGENT_ECOSYSTEM.md` já cita, em seu cabeçalho e em "How to Read This Document", `AI_MANIFESTO.md` como fundação por força de Decision 004, e não mais se autodeclara documento fundador do Volume II.
- ~~Padronizar a nomenclatura `CONTEXT_FRAMEWORK` em toda referência externa ainda pendente~~ **Executada.** Nenhuma ocorrência de `CONTEXT_OS` como identificador de documento permanece em `AI_IMPLEMENTATION.md` ou em qualquer outro documento revisado nesta remediação.
- ~~Revisar documentos que ainda utilizam `CONTEXT_OS` como identificador de documento~~ **Executada** — mesma verificação acima; `Capítulo 7` de `AI_IMPLEMENTATION.md` já usa `CONTEXT_FRAMEWORK.md`.

Nenhuma dessas ações alterou o conteúdo técnico-arquitetural de `AI_MANIFESTO.md`, `AI_AGENT_ECOSYSTEM.md` ou `AI_GOVERNANCE.md` — todas foram correções de referência, registro ou nomenclatura, consistentes com as decisões tomadas nas Seções 2 a 4.

---

## 6. Decision 007 — AI_HUB.md and Volume II: Authority Relationship

### Contexto

A auditoria "Phase 4 — AI Core Readiness Assessment" identificou que `AI_HUB.md` (`docs/architecture/`, Volume I, Frozen) e a série Volume II (`docs/ai/`, liderada por `AI_MANIFESTO.md`) descrevem território tecnicamente sobreposto — Provider Layer, Context, Memory, Policy Engine — sob duas autoridades documentais formalmente distintas (Volume I e Volume II), um risco já nomeado em `docs/implementation/components/COMPONENT_01_PACKAGE_STRUCTURE_DESIGN.md`, mas nunca formalmente resolvido.

### Evidências

- `AI_HUB.md` é anterior a toda a série Volume II (mtime 2026-07-20, contra 2026-07-20 a 23 dos oito documentos de `docs/ai/`).
- Todos os oito documentos de Volume II citam `AI_HUB.md` como autoridade já estabelecida, nunca como algo que redefinem ou substituem — por exemplo, `docs/architecture/IDENTITY_HUB.md`, linha 175, distingue explicitamente seu próprio Policy Engine do "Policy Engine já descrito em `AI_HUB.md`, que aplica regras especificamente à governança de uso de modelos de linguagem", tratando `AI_HUB.md` como fonte já fixada.
- `AI_HUB.md`, Capítulo 7, já delega o detalhamento interno do Orchestrator a "um documento próprio" — uma delegação explícita de profundidade que antecipa exatamente o papel que `AI_ORCHESTRATOR.md` (Volume II) veio a cumprir.
- Nenhum documento revisado nesta remediação contradiz, no nível de conteúdo semântico, nenhuma decisão já registrada em `AI_HUB.md` — a sobreposição é de território (os mesmos conceitos são mencionados em ambos), não de decisão técnica divergente sobre esses conceitos.
- `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 4, já lista `AI_HUB.md` e a série Volume II lado a lado, ambos como fontes do agrupamento **AI Core**, sem tratá-los como concorrentes.

### Decisão

**`AI_HUB.md` (Frozen) permanece a autoridade arquitetural sobre o contrato externo e a topologia de alto nível do subsistema de IA como Platform Service** — sua posição no mapa de Hubs, seus princípios de missão, seus dez ADRs, e a forma como os demais Hubs o consomem (`SYSTEM_BLUEPRINT.md`; `IDENTITY_HUB.md`; `KNOWLEDGE_HUB.md`; `INTEGRATION_HUB.md`).

**A série Volume II (`AI_MANIFESTO.md` e os documentos que dele dependem) é a autoridade arquitetural sobre o funcionamento interno do Orchestrator, do Agent Framework, do Context, da Governança e da Observabilidade de IA** — o aprofundamento técnico que `AI_HUB.md` deliberadamente não desenvolve por conta própria, delegando-o (Capítulo 7) a documentação dedicada.

**Nenhum documento substitui o outro. Nenhum é apenas histórico.** Ambos permanecem vigentes, simultaneamente, em níveis de altitude diferentes: `AI_HUB.md` responde "qual é o contrato deste subsistema com o restante da plataforma"; Volume II responde "como esse subsistema funciona por dentro". Um Business Hub que precise saber como invocar o AI Hub consulta `AI_HUB.md`; um Desenvolvedor que precise implementar o Orchestrator consulta `AI_ORCHESTRATOR.md`.

Onde uma futura revisão de qualquer documento de Volume II viesse a contradizer uma decisão já registrada em `AI_HUB.md` (Frozen), `AI_HUB.md` prevalece, e a contradição deve ser resolvida por Amendment a `AI_HUB.md` ou por correção ao documento de Volume II — nunca por silêncio.

### Justificativa

Esta decisão não move nenhum documento entre estágios de status, não redefine nenhum conceito, e não exige Amendment sobre `AI_HUB.md` — apenas formaliza, ao nível de governança do Volume II, a relação de "contrato externo, Frozen" versus "profundidade interna, Official/Draft" que já existe na prática em todas as citações cruzadas encontradas. É o mesmo tipo de constatação formalizadora já usado em Decision 004 (que confirmou uma hierarquia já vigente na prática, sem alterar conteúdo).

### Impacto

`AI_HUB.md` permanece Frozen e inalterado. Nenhum documento de Volume II é reclassificado. O risco registrado em `COMPONENT_01_PACKAGE_STRUCTURE_DESIGN.md` sobre a possível confusão entre os dois é considerado mitigado por esta decisão, não por nenhuma alteração estrutural de pacote.

---

## 7. Decision 008 — Missing Volume II Documents: Deferred, Not Blocking

### Contexto

`VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 6, identificou seis documentos citados pela Matriz de Dependências de `AI_IMPLEMENTATION.md` (Capítulo 7) que não existem: `MEMORY_OS.md`, `REASONING_ENGINE.md`, `PLANNING_ENGINE.md`, `SKILL_RUNTIME.md`, `TOOL_RUNTIME.md`, `MULTI_AGENT_SYSTEM.md` (prosa, distinto do capítulo modular `11_MULTI_AGENT_SYSTEM.md`, já existente em Draft). A auditoria "Phase 4 — AI Core Readiness Assessment" tratou esta ausência como lacuna a decidir formalmente antes de qualquer Architecture Definition de AI Core.

### Evidências

- `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 12 (Risks and Dependencies), já trata a ausência de `MEMORY_OS.md` não como bloqueio de Phase 4, mas como risco a mitigar *dentro* da Fase: *"`MEMORY_OS.md` permanecer não escrito no momento em que a Phase 4 exigir seu aprofundamento técnico. Mitigação: priorizar sua redação antes do início das Sprints de Shared Memory dentro da Phase 4."* — ou seja, o próprio Roadmap já não exige este documento antes da Phase 4 começar, apenas antes de uma Sprint interna específica.
- Os cinco documentos restantes seguem, na Matriz de Dependências reproduzida por `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 3, o mesmo padrão estrutural de `MEMORY_OS.md` — cada um habilita uma etapa posterior específica dentro do próprio Volume II, nunca a existência do Volume II como um todo.
- Nenhum dos seis conceitos está de fato indocumentado hoje — cada um já possui tratamento arquitetural em documento já Official: Memória em `AI_HUB.md` (Cap. 11), `AI_ORCHESTRATOR.md` (Cap. 10) e `AGENT_FRAMEWORK.md` (Cap. 9); Planejamento em `AI_ORCHESTRATOR.md` (Cap. 8) e `AGENT_FRAMEWORK.md` (Cap. 10); Raciocínio em `AGENT_FRAMEWORK.md` (Cap. 11); Skill Runtime em `AI_ARCHITECTURE.md` (Cap. 8) e `AGENT_FRAMEWORK.md` (Cap. 13); Tool Runtime em `AI_ARCHITECTURE.md` (Cap. 9) e `AGENT_FRAMEWORK.md` (Cap. 14); Multi-Agent System em `AGENT_FRAMEWORK.md` (Cap. 14, Colaboração), `AI_ORCHESTRATOR.md` (Caps. 7 e 12) e `AI_AGENT_ECOSYSTEM.md` (§6–8).
- Decision 006 (Seção 4 acima) já estabeleceu o precedente de que um documento de nível superior (`AI_GOVERNANCE.md`) pode legitimamente existir e permanecer Official antes de um pré-requisito técnico mais profundo ser escrito, desde que seu próprio conteúdo não dependa, para sua coerência interna, de nenhum detalhe exclusivo do documento ainda não escrito.

### Decisão

**Os seis documentos são classificados como adiados para dentro da Phase 4, não como obrigatórios para a entrada na Phase 4 nem para a produção de `AI_CORE_ARCHITECTURE_DEFINITION.md`.** Cada um deve ser escrito imediatamente antes da Sprint interna de Phase 4 que exigir seu aprofundamento técnico específico — na mesma ordem já recomendada por `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 7 (`MEMORY_OS.md` e os demais, nesta sequência: Memória → Raciocínio/Planejamento → Skill Runtime → Tool Runtime → Multi-Agent System) — nunca como pré-condição para o gate de prontidão documental da Fase como um todo.

Esta decisão não declara nenhum dos seis conceitos "sem documentação" — cada um já possui base Official rastreável, listada nas Evidências acima, suficiente para que `AI_CORE_ARCHITECTURE_DEFINITION.md` decomponha componentes de implementação sem inventar arquitetura nova.

### Justificativa

Generaliza, para os cinco documentos restantes, o mesmo raciocínio que `GATE_G2_IMPLEMENTATION_ROADMAP.md` já aplica a `MEMORY_OS.md` e que Decision 006 já aplica a `MULTI_AGENT_SYSTEM.md`: um documento de aprofundamento é necessário no momento em que o trabalho técnico que ele aprofunda começa, não no momento em que a Fase à qual pertence é declarada pronta para iniciar. Exigir os seis documentos completos, no mesmo padrão de vinte ou mais capítulos já usado pelos oito documentos existentes de Volume II, antes mesmo de uma Architecture Definition decompor a Phase 4 em componentes, inverteria a ordem de trabalho já usada com sucesso em Infrastructure e Platform Services — em ambas, a Architecture Definition precedeu, não sucedeu, o detalhamento de cada componente individual.

### Impacto

Nenhum dos seis documentos é criado por esta decisão. `AI_IMPLEMENTATION.md`, Capítulo 7, permanece com as células correspondentes a estes seis documentos marcadas como não escritas, agora explicitamente entendidas como trabalho de Sprint interna de Phase 4, não como bloqueio ao gate desta Fase. Uma futura tarefa de `AI_CORE_ARCHITECTURE_DEFINITION.md` pode prosseguir com base na documentação Official já existente listada nas Evidências, sem aguardar a redação destes seis documentos.

---

## 8. Approval

| Campo | Valor |
|---|---|
| Status | Approved |
| Version | 1.1 |
| Data | 2026-07-24 |
| Responsável | Claude |
