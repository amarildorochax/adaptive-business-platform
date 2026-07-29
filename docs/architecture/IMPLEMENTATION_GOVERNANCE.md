# Implementation Governance

**Adaptive Business Platform · Documento de Arquitetura (Draft)**

---

## Nota de Posicionamento Documental

Este documento pertence, por definição de `DOCUMENTATION_CONSTITUTION.md`, §5, à Categoria Implementation Documentation — "responde como o design da plataforma é realizado na prática... nunca reafirma arquitetura, aplica-a." Ele é solicitado, no entanto, sob o caminho `docs/architecture/`, o diretório do Volume I. Isso não é uma inconsistência nova introduzida por esta Sprint — é o mesmo padrão já observado em `IMPLEMENTATION_GUIDELINES.md`, hoje Draft e já residente no mesmo diretório, precisamente porque o Volume III — Platform Implementation, per `DOCUMENTATION_INDEX.md`, §11, permanece "Proposed" e ainda não foi formalmente aberto. Este documento segue o mesmo precedente, sem tentar abrir o Volume III unilateralmente — essa decisão pertence à governança documental, não a esta Sprint.

Este documento não substitui nem redefine nenhum processo já estabelecido por `DOCUMENTATION_CONSTITUTION.md` — Review (§13), Approval (§14), Versionamento (§9), Change Management (§10), Ownership (§15). Ele os **opera**: aplica-os, pela primeira vez nesta série, ao código e à implementação, não apenas ao documento. Onde a Constituição já responde uma pergunta em nível de documentação, este documento cita a resposta e a estende ao equivalente de implementação — nunca contradiz.

Três descobertas das Sprints BP-009 a BP-011 são tratadas aqui como os primeiros casos de teste reais dos mecanismos que este documento define, não como itens encerrados: a reconciliação de nomenclatura do CRM (`ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 23) é o primeiro Amendment que os Gates do Capítulo 36 deveriam ter capturado antes que o código divergisse; a tendência de todo desenvolvimento novo continuar acontecendo em `src/` em vez de `platform/` (`TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 31) é o primeiro caso real de Débito Técnico não controlado que o Capítulo 28 precisa endereçar; e o trabalho não commitado identificado na mesma Sprint é o primeiro caso real de risco operacional que o Gate de Implementação (Capítulo 37) deveria ter impedido de se acumular.

---

## 1. Introdução

Este é o modelo oficial de governança da implementação da Adaptive Business Platform — a resposta a como toda funcionalidade futura entra na plataforma, quem a aprova, quando um ADR é obrigatório, e como a implementação permanece aderente à arquitetura já consolidada por BP-001 a BP-011, sem depender da disciplina individual de cada equipe.

---

## 2. Objetivos da Governança

Impedir que a implementação divirja silenciosamente da arquitetura documentada, como já ocorreu com a nomenclatura do CRM antes de qualquer mecanismo de controle existir. Definir, de forma explícita e não ambígua, quem aprova cada tipo de mudança. Tornar obrigatório, e não opcional, o registro de decisão através de ADR ou RFC quando o tipo de mudança o exigir. Estabelecer Gates verificáveis entre arquitetura, implementação, homologação e produção, para que nenhuma fase avance sem satisfazer critério objetivo.

---

## 3. Princípios Gerais

**Governança opera sobre código, não apenas sobre documento.** Toda regra já estabelecida em `DOCUMENTATION_CONSTITUTION.md` para documentos tem um equivalente aqui para componente de código.

**Nenhuma mudança de status por autodeclaração.** Um componente não se torna "pronto para produção" porque sua própria equipe declara — precisa de Review e Approval externos, mesmo princípio de `DOCUMENTATION_CONSTITUTION.md`, §14, aplicado a implementação.

**Ownership antes de existência.** Nenhum componente novo é aceito sem um Owner nomeado, espelhando `DOCUMENTATION_CONSTITUTION.md`, §15.

**Domain Ownership é inegociável.** Nenhuma regra deste documento jamais autoriza uma exceção a `DOMAIN_OWNERSHIP_MATRIX.md`.

**Rastreabilidade obrigatória.** Toda decisão de arquitetura ou de implementação relevante é registrada — ADR, RFC, ou Change Request — nunca decidida verbalmente e perdida.

**Débito reconhecido é gerenciável; débito silencioso é risco.** Este documento formaliza um processo de Débito Técnico (Capítulo 28) precisamente para que a acumulação observada em `TECHNICAL_MIGRATION_STRATEGY.md` nunca mais aconteça sem registro.

---

## 4. Escopo

Aplica-se a toda implementação de código dos doze Hubs já sequenciados em `IMPLEMENTATION_ROADMAP_MASTER.md`, a toda mudança em `platform/` e em `src/` enquanto ambos coexistirem per `TECHNICAL_MIGRATION_STRATEGY.md`, e a toda decisão de nomenclatura, ownership, ou dependência que atravesse a fronteira de um Bounded Context. Não se aplica a — e não redefine — o conteúdo de nenhum Blueprint, nenhum documento Official ou Frozen; este documento governa o *processo* ao redor deles, nunca seu conteúdo.

---

## 5. Papéis e Responsabilidades

**Arquiteto de Domínio** — Owner de um Hub específico, per `DOCUMENTATION_CONSTITUTION.md`, §15, aplicado ao Blueprint e ao código daquele domínio. **Tech Lead de Implementação** — responsável pela realização técnica dentro dos limites já definidos pelo Arquiteto de Domínio. **Revisor Arquitetural** — nunca a mesma pessoa que implementa, per princípio já estabelecido em `DOCUMENTATION_CONSTITUTION.md`, §13. **Owner da Documentation System** — autoridade final de Approval para mudança que atravessa mais de um Hub, per §14. **Governança da Implementação** (este documento) — mantém os Gates, audita conformidade, nunca aprova sozinha uma mudança de domínio específico. **Equipe de Qualidade** — responsável pelos critérios do Capítulo 31. **Equipe de Migração** — responsável pela execução de `TECHNICAL_MIGRATION_STRATEGY.md`. **Operação** — responsável por monitoramento pós-liberação (Capítulo 7, etapa final).

**Matriz RACI:**

| Atividade | Arquiteto de Domínio | Tech Lead | Revisor Arquitetural | Owner Documentation System | Qualidade | Migração | Operação |
|---|---|---|---|---|---|---|---|
| Definir Blueprint | R/A | C | C | I | I | I | — |
| Escrever ADR | R | C | A | I | — | — | — |
| Escrever RFC | C | R | A | C | — | — | — |
| Aprovar mudança em domínio único | C | C | R | A | I | I | I |
| Aprovar mudança cross-Hub | C | C | C | A/R | I | C | I |
| Revisão técnica de código | I | R | C | — | A | — | — |
| Revisão arquitetural | I | C | R/A | I | I | — | — |
| Definir critério de teste | I | C | C | — | R/A | — | — |
| Executar migração de domínio | C | R | C | A | C | R | I |
| Auditoria de nomenclatura/ownership | I | I | R | A | C | C | — |
| Monitoramento pós-liberação | I | C | I | I | C | I | R/A |
| Gestão de Débito Técnico | R | R | A | C | C | I | I |

R = Responsável, A = Aprovador, C = Consultado, I = Informado.

---

## 6. Modelo de Governança

Governança em três camadas, espelhando a hierarquia já estabelecida em `DOCUMENTATION_CONSTITUTION.md`, §4: (1) Governança de Documento — já integralmente coberta pela Constituição, não redefinida aqui; (2) Governança de Implementação — este documento, operando sobre código e Gate; (3) Governança de Domínio — o Arquiteto de cada Hub, com autonomia de decisão interna desde que respeite (1) e (2), mesmo princípio de "Autonomous Teams" já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`.

---

## 7. Fluxo Oficial de Implementação

```
Ideia
   │  critério de transição: problema de negócio ou lacuna arquitetural identificável
   ▼
Descoberta
   │  critério: verificação de ownership já existente contra DOMAIN_OWNERSHIP_MATRIX.md
   │  (mesmo passo já exigido por aquele documento, Capítulo 11, para todo novo conceito)
   ▼
RFC (quando cross-Hub ou de alto impacto) ──── ver Capítulo 14
   │  critério: RFC revisado e sem objeção não resolvida
   ▼
Blueprint (quando novo domínio) ou extensão de Blueprint já existente
   │  critério: Blueprint segue o checklist de 10 pontos já exigido por
   │  BUSINESS_HUB_ARCHITECTURE.md, Capítulo 17
   ▼
ADR (quando decisão estrutural não-óbvia) ──── ver Capítulo 13
   │  critério: ADR registrado, com contexto e alternativa descartada
   ▼
Aprovação ──── ver Capítulos 9-11
   │  critério: Approval concedido por quem tem autoridade, nunca autodeclarado
   ▼
Planejamento
   │  critério: fase correspondente de IMPLEMENTATION_ROADMAP_MASTER.md identificada
   ▼
Implementação
   │  critério: código aderente à nomenclatura já decidida (Capítulo 24) e ao
   │  ownership já consolidado
   ▼
Revisão Técnica
   │  critério: revisor diferente do autor, checklist do Capítulo 44 satisfeito
   ▼
Revisão Arquitetural ──── Gate de Implementação, Capítulo 37
   │  critério: aderência ao Blueprint verificada, nenhum ADR violado
   ▼
Testes
   │  critério: cobertura mínima definida pela Equipe de Qualidade (Capítulo 31)
   ▼
Homologação ──── Gate de Homologação, Capítulo 38
   │  critério: validado em subconjunto de Tenant, per SAAS_ARCHITECTURE.md Cap. 10
   ▼
Liberação ──── Gate de Produção, Capítulo 39
   │  critério: rollout gradual, Feature Flag ativa, rollback testado
   ▼
Monitoramento
   │  critério: Observabilidade (SYSTEM_BLUEPRINT.md) confirmando comportamento esperado
   ▼
Evolução
      retroalimenta Ideia para o próximo ciclo
```

Nenhuma etapa é pulada para nenhuma mudança que atravesse fronteira de Bounded Context — a única variação permitida é de profundidade (uma mudança pequena e local pode ter um RFC e um ADR muito mais curtos), nunca de ausência da etapa em si.

---

## 8. Ciclo de Vida de Mudanças

Toda mudança nasce Proposta, avança para Em Implementação, depois para Em Revisão, depois para Aprovada, depois para Liberada, e eventualmente para Depreciada — o mesmo ciclo de cinco estágios já usado por `AI_GOVERNANCE.md` para Policy, aplicado aqui de forma transversal a qualquer mudança de implementação.

**Matriz de Governança de Mudanças** — que tipo de mudança exige qual instrumento:

| Tipo de mudança | ADR | RFC | Blueprint novo/estendido | Revisão Arquitetural | Aprovação Formal |
|---|---|---|---|---|---|
| Novo Hub | Obrigatório | Obrigatório | Obrigatório | Obrigatória | Owner da Documentation System |
| Alteração de Hub existente (nova capacidade) | Obrigatório se estrutural | Recomendado | Extensão obrigatória | Obrigatória | Owner do Hub |
| Novo Bounded Context | Obrigatório | Obrigatório | Obrigatório | Obrigatória | Owner da Documentation System |
| Novo Aggregate dentro de Hub existente | Recomendado | Não exigido | Seção nova no Blueprint | Obrigatória | Owner do Hub |
| Novo Event | Não exigido isoladamente | Não exigido | Catálogo de evento atualizado | Obrigatória | Owner do Hub |
| Nova API/Contrato público | Obrigatório | Obrigatório | Não exigido | Obrigatória | Owner do Hub + Revisor |
| Novo Serviço interno | Recomendado | Não exigido | Não exigido | Obrigatória | Owner do Hub |
| Mudança de nomenclatura já divergente (ex.: Capítulo 24) | Obrigatório (Amendment, se Frozen) | Não exigido | Não exigido | Obrigatória | Owner da Documentation System |
| Mudança de ownership | Obrigatório | Obrigatório | Atualização de `DOMAIN_OWNERSHIP_MATRIX.md` proposta | Obrigatória | Owner da Documentation System |
| Mudança em documento Official | — (Change Request, §10) | Quando estrutural | — | Obrigatória | Owner do Handbook |
| Mudança em documento Frozen | Amendment obrigatório (§10) | Obrigatório | — | Obrigatória, nível elevado | Owner do Volume, aprovação um nível acima do ordinário (§14) |

---

## 9. Processo de Aprovação

Espelha `DOCUMENTATION_CONSTITUTION.md`, §14: Aprovação é distinta de Revisão — Revisão pergunta "isto está correto"; Aprovação pergunta "isto está autorizado." Nenhuma mudança avança de status pela mesma pessoa que a propôs ou implementou.

---

## 10. Critérios para Aprovação

Aderência integral ao Blueprint do domínio; nenhuma violação de ownership contra `DOMAIN_OWNERSHIP_MATRIX.md`; ADR registrado quando a Matriz do Capítulo 8 o exige; Revisão Técnica e Arquitetural ambas concluídas com resultado "aceito" ou "aceito com ressalva já corrigida."

---

## 11. Critérios para Rejeição

Violação de ownership; ausência de ADR obrigatório; nomenclatura divergente de uma decisão já formalizada (Capítulo 24); Revisão Arquitetural com resultado "rejeitado"; ausência de plano de rollback para mudança de produção.

---

## 12. Critérios para Revisão

Idênticos, por design, aos já estabelecidos em `DOCUMENTATION_CONSTITUTION.md`, §13 — consistência interna, adequação de fronteira de domínio, consistência hierárquica contra Blueprint e Constituição, integridade de referência, consistência terminológica contra o Glossário — aplicados aqui a código e não apenas a texto.

---

## 13. Gestão de ADRs

Um ADR é obrigatório sempre que uma decisão de implementação (a) não é obviamente derivável do Blueprint já existente, (b) descarta uma alternativa razoável que alguém poderia perguntar "por que não isso", ou (c) está listada como "Obrigatório" na Matriz do Capítulo 8. Todo ADR segue o formato já padronizado por toda a série (contexto, decisão, alternativa descartada, consequência), com prefixo de Hub, exatamente como já praticado por `ADR-CH-`, `ADR-CV-`, `ADR-CR-`, `ADR-MK-`, `ADR-CM-`, `ADR-BS-`, `ADR-AH-`.

---

## 14. Gestão de RFCs

Um RFC é exigido para toda mudança que atravessa fronteira de Bounded Context, toda nova API pública, e todo novo Hub — per a Matriz do Capítulo 8. Um RFC descreve problema, alternativas consideradas, e impacto em cada Hub consumidor já identificado em `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 6 ("Ownership por Hub"). Um RFC sem objeção não resolvida após o período de revisão avança para ADR e Aprovação; um RFC com objeção não resolvida retorna para Descoberta.

---

## 15. Gestão de Blueprints

Todo Blueprint nasce Draft, per `DOCUMENTATION_CONSTITUTION.md`, §8.1 — nenhuma exceção, mesmo para os nove já produzidos por esta série. Avança para Official somente através do Change Request já recomendado por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 25. Nenhum Blueprint é editado diretamente por uma equipe de implementação sem esse processo — divergência entre código e Blueprint é resolvida atualizando um dos dois formalmente, nunca deixando-os silenciosamente incoerentes, exatamente o problema já identificado na nomenclatura do CRM.

---

## 16. Gestão de Documentos Official

Toda mudança segue Change Request, per `DOCUMENTATION_CONSTITUTION.md`, §10 — descrita, revisada contra o resto da documentação, aprovada antes de publicação. Nenhuma equipe de implementação altera um documento Official unilateralmente com base em uma decisão de código tomada isoladamente.

---

## 17. Gestão de Documentos Frozen

Toda mudança segue Amendment, o processo de maior atrito disponível abaixo da própria Constituição, per §10 — deve declarar o que muda, por que a justificativa original de congelamento não se sustenta mais ou precisa de extensão, e o impacto em todo documento dependente. A reconciliação de nomenclatura do CRM (Capítulo 24) é, hoje, o Amendment de maior prioridade pendente em toda a plataforma, precisamente porque `CRM_DOMAIN_BLUEPRINT.md`/`CRM_HUB.md` são Frozen e código já diverge deles.

---

## 18. Gestão de Ownership

Nenhuma mudança de ownership acontece sem o processo de sete passos já exigido por `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11, incluindo a verificação prévia de que um novo conceito não é reformulação de algo já existente — o mesmo processo que `BUSINESS_STRUCTURE_HUB_ARCHITECTURE.md` já demonstrou, na prática, produzir um escopo muito mais estreito do que inicialmente solicitado.

---

## 19. Gestão de Bounded Contexts

Nenhum novo Bounded Context é aberto sem RFC e ADR, per Capítulo 8. A fronteira de um Bounded Context, uma vez documentada em um Blueprint, só muda através do mesmo Change Request ou Amendment aplicável ao status daquele Blueprint.

---

## 20. Gestão de Dependências

Toda dependência entre Hub segue exclusivamente o padrão Events over Direct Calls já estabelecido em `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 5 — nenhuma exceção é aprovada sem ADR explícito registrando por que a comunicação direta foi considerada e por que o padrão de evento não se aplicaria, e mesmo assim, per `DOMAIN_OWNERSHIP_MATRIX.md`, nenhuma exceção de escrita direta é jamais aceita.

---

## 21. Gestão de Interfaces

Toda interface pública de um Hub — Command, Query, contrato de evento — é versionada desde o primeiro commit, per Capítulo 24, e revisada por alguém fora da equipe que a propôs antes de ser considerada estável.

---

## 22. Gestão de APIs

Nenhuma API nova é criada sem RFC, per Capítulo 8. Toda API segue Backward Compatibility, já princípio de `BUSINESS_HUB_ARCHITECTURE.md` — uma mudança que quebra um consumidor já existente exige nova versão explícita, nunca uma alteração silenciosa do contrato vigente.

---

## 23. Gestão de Eventos

Todo Evento novo é verificado contra o Catálogo Consolidado já produzido por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 28, antes de ser introduzido, para prevenir a duplicação de nome ou de capacidade já ativamente evitada por toda a série. Todo Evento é publicado exclusivamente pelo Owner do conceito que ele representa, per `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 9.

---

## 24. Gestão de Versionamento

Espelha `DOCUMENTATION_CONSTITUTION.md`, §9, aplicado a código: incremento menor para mudança que não quebra garantia já assumida por outro Hub; incremento maior para qualquer mudança que possa invalidar uma suposição já feita em outro lugar da plataforma, independentemente do tamanho da edição.

---

## 25. Gestão de Compatibilidade

Nenhuma migração de domínio (per `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 14) quebra uma capacidade já em uso sem substituto operacional equivalente já disponível e validado — mesmo princípio já registrado naquele documento, Capítulo 15, elevado aqui a regra de governança formal, não apenas recomendação de estratégia.

---

## 26. Gestão de Migração

Toda migração de domínio segue integralmente `TECHNICAL_MIGRATION_STRATEGY.md` — este documento não redefine aquela estratégia, apenas formaliza que nenhuma fase de migração inicia sem os Critérios de Migração já definidos naquele documento, Capítulo 35, satisfeitos.

---

## 27. Gestão de Refatoração

Toda refatoração relevante — em particular a resolução das Divergências 4 e 6 já identificadas em `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 12 — é tratada como mudança de implementação sujeita a Revisão Técnica e Arquitetural, nunca como um ajuste informal feito à margem do fluxo do Capítulo 7.

---

## 28. Gestão de Débito Técnico

Todo Débito Técnico é registrado explicitamente — nunca silencioso — em um registro consultável, com: o que foi adiado, por que, e o critério que, quando satisfeito, obriga sua resolução. O caso já identificado por `TECHNICAL_MIGRATION_STRATEGY.md` — todo desenvolvimento novo continuando em `src/` em vez de `platform/`, apesar de `REPOSITORY_DECISIONS.md`, Decisão 003, já declarar o contrário — é registrado aqui como o primeiro item formal deste registro, com critério de resolução: nenhuma nova unidade de trabalho de implementação inicia fora de `platform/` a partir da aprovação deste documento.

---

## 29. Gestão de Exceções

Toda exceção a uma regra deste documento — por exemplo, uma dependência direta entre Hub aceita temporariamente por razão operacional — é registrada com prazo de validade e critério de reavaliação, nunca aceita permanentemente sem revisão periódica, mesmo princípio já aplicado a Policy Exception em `AI_GOVERNANCE.md`.

---

## 30. Gestão de Riscos

Toda fase de implementação herda a Matriz de Riscos já produzida por `IMPLEMENTATION_ROADMAP_MASTER.md`, Capítulo 25, e por `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 31 — este documento não as duplica, apenas exige que nenhum Gate (Capítulos 36-39) seja atravessado com um risco Alto listado em qualquer uma delas ainda sem mitigação decidida.

---

## 31. Gestão de Qualidade

A Equipe de Qualidade define o critério mínimo de teste automatizado por Hub, ciente de que `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 24, já confirmou zero framework de teste em produção hoje — o primeiro critério de qualidade desta plataforma é, portanto, estabelecer essa linha de base, não apenas mantê-la.

---

## 32. Processo de Auditoria Arquitetural

Verifica, por Hub, aderência ao Blueprint correspondente e ausência de violação de ADR — mesmo checklist de 10 pontos já exigido por `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 17, reaplicado periodicamente, não apenas na criação do Hub. Periodicidade: a cada fase concluída de `IMPLEMENTATION_ROADMAP_MASTER.md`. Responsável: Revisor Arquitetural, nunca o Arquiteto de Domínio do próprio Hub auditado.

---

## 33. Processo de Auditoria de Código

Verifica nomenclatura contra a tabela de renomeação decidida (`TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 18), ausência de acesso direto a dado de outro Hub, e cobertura de teste mínima. Periodicidade: a cada Pull Request relevante, mais uma auditoria consolidada por fase. Responsável: Tech Lead com Revisão do Revisor Arquitetural.

---

## 34. Processo de Auditoria Documental

Verifica que `DOCUMENTATION_INDEX.md` reflete o estado real do repositório — já identificado como defeito ativo por `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 17 — e que nenhum Blueprint permanece Draft por mais tempo do que o necessário sem justificativa registrada. Periodicidade: a cada fase concluída. Responsável: Owner da Documentation System.

---

## 35. Critérios de Compliance

Todo componente em produção satisfaz: ownership registrado em `DOMAIN_OWNERSHIP_MATRIX.md` (ou pendente de Change Request já em andamento); nomenclatura conforme decisão formal, nunca um dos vocabulários já descontinuados listados em `TECHNICAL_MIGRATION_STRATEGY.md`; cobertura de teste mínima já definida pela Equipe de Qualidade; e nenhuma exceção do Capítulo 29 vencida sem reavaliação.

---

## 36. Gates de Arquitetura

Critério de saída: Blueprint existente e, no mínimo, Draft; ADR/RFC obrigatórios da Matriz do Capítulo 8 já registrados; Revisão Arquitetural com resultado "aceito." Nenhuma implementação começa sem este Gate satisfeito — mesmo Critério de Entrada já exigido, por domínio, em `IMPLEMENTATION_ROADMAP_MASTER.md`, Capítulo 11.

---

## 37. Gates de Implementação

Critério de saída: Revisão Técnica concluída; nomenclatura conforme Capítulo 24; nenhum acesso direto a dado fora do Command/Query formal do Hub proprietário; cobertura de teste mínima atingida. Este é o Gate que, se já existisse, teria impedido o acúmulo de trabalho não commitado identificado por `TECHNICAL_MIGRATION_STRATEGY.md` — a partir deste documento, nenhuma fase de implementação é considerada no Gate sem confirmação de que o trabalho está seguramente versionado.

---

## 38. Gates de Homologação

Critério de saída: validado em subconjunto reduzido de Tenant, per `SAAS_ARCHITECTURE.md`, Capítulo 10; Observabilidade mínima (Logging/Tracing/Metrics) confirmando comportamento esperado; nenhuma regressão detectada em capacidade já existente.

---

## 39. Gates de Produção

Critério de saída: rollout gradual iniciado, nunca 100% dos Tenants de imediato; Feature Flag configurada e testada, incluindo caminho de rollback; Monitoramento (Capítulo 7, última etapa antes de Evolução) ativo desde o primeiro Tenant exposto.

---

## 40. Métricas de Governança

Número de mudanças que atravessaram um Gate sem o instrumento obrigatório da Matriz do Capítulo 8 — meta: zero. Tempo médio entre proposta de RFC e resolução. Número de itens de Débito Técnico em aberto além do prazo de reavaliação (Capítulo 29).

---

## 41. Indicadores de Qualidade

Cobertura de teste automatizado por Hub. Número de regressão detectada em Homologação versus detectada em Produção — meta: a esmagadora maioria detectada antes de Produção.

---

## 42. Indicadores de Aderência

Percentual de componente em produção com nomenclatura conforme decisão formal (meta: 100%, hoje não satisfeito per `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 18). Percentual de novo desenvolvimento iniciado em `platform/` versus em `src/` — o indicador que precisa inverter a tendência já identificada como risco crítico.

---

## 43. Indicadores de Evolução

Número de Blueprint promovido de Draft para Official por ciclo, per o Roadmap de Promoção já proposto em `ARCHITECTURE_RECONCILIATION_AND_GOVERNANCE.md`, Capítulo 25. Número de fase de `IMPLEMENTATION_ROADMAP_MASTER.md` concluída com todos os Gates satisfeitos, sem exceção aberta pendente.

---

## 44. Checklists Obrigatórios

**Início de Sprint.** Blueprint do domínio lido pela equipe; dependências da Matriz de `IMPLEMENTATION_ROADMAP_MASTER.md`, Capítulo 10, satisfeitas; nenhum risco Alto sem mitigação decidida.

**Revisão arquitetural.** Checklist de 10 pontos de `BUSINESS_HUB_ARCHITECTURE.md`, Capítulo 17, aplicado; nenhum ADR do Hub violado; ownership confirmado contra `DOMAIN_OWNERSHIP_MATRIX.md`.

**Revisão técnica.** Revisor diferente do autor; nomenclatura conforme Capítulo 24; teste automatizado presente e passando.

**Revisão documental.** Status do documento (Draft/Official/Frozen) correto; referência cruzada íntegra, per `DOCUMENTATION_CONSTITUTION.md`, §11; `DOCUMENTATION_INDEX.md` atualizado se o status mudou.

**Criação de Hub.** RFC e ADR registrados; verificação prévia de que o conceito central não é reformulação de algo já existente (`DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 11); Blueprint completo per checklist de `BUSINESS_HUB_ARCHITECTURE.md`.

**Alteração de Hub existente.** Change Request se Official, Amendment se Frozen; impacto em Hub consumidor avaliado contra `DOMAIN_OWNERSHIP_MATRIX.md`, Capítulo 6.

**Publicação de documento Official.** Review concluída, per `DOCUMENTATION_CONSTITUTION.md`, §13; Approval concedida pelo Owner do Handbook, per §14.

**Congelamento de documento.** Estabilidade demonstrada ao longo do tempo, nunca imediata (§8.3); Approval em nível elevado, per §14.

**Liberação para produção.** Gate de Produção (Capítulo 39) satisfeito integralmente; rollback testado, não apenas planejado.

**Encerramento de Sprint.** Todo Critério de saída e de aceite da fase correspondente (`IMPLEMENTATION_ROADMAP_MASTER.md`) verificado por teste automatizado; nenhum risco novo descoberto durante a Sprint permanece sem registro para o próximo ciclo.

---

## 45. Recomendações

Executar, com prioridade máxima, a auditoria de nomenclatura de CRM (Capítulo 33) e a decisão de Amendment já pendente (Capítulo 17) antes de qualquer nova Sprint de implementação naquele domínio. Aplicar o Gate de Implementação (Capítulo 37) retroativamente ao trabalho já existente em `src/app/` e em `platform/`, garantindo que todo o trabalho hoje não commitado, identificado por `TECHNICAL_MIGRATION_STRATEGY.md`, seja versionado antes de qualquer novo ciclo. Instituir a auditoria documental (Capítulo 34) como o primeiro passo prático deste documento, já que `DOCUMENTATION_INDEX.md` está comprovadamente desatualizado hoje.

---

## 46. Próximos Passos

Aprovar este documento como referência de governança de implementação. Aplicar a Matriz de Governança de Mudanças (Capítulo 8) à primeira fase de `IMPLEMENTATION_ROADMAP_MASTER.md` já em andamento. Estabelecer a Equipe de Qualidade e sua primeira definição de cobertura mínima de teste, respondendo à lacuna já confirmada por `TECHNICAL_MIGRATION_STRATEGY.md`, Capítulo 24.

---

## 47. Conclusão

Onze Sprints construíram a arquitetura, sequenciaram sua implementação, e auditaram a distância entre o que existe e o que foi documentado. Nenhuma dessas conquistas se sustenta sem um mecanismo que impeça a próxima mudança de repetir o mesmo padrão já observado três vezes nesta série — nomenclatura divergente descoberta tarde demais, esforço de engenharia fluindo para a árvore errada, trabalho valioso não commitado. Este documento é esse mecanismo: não mais arquitetura, mas o conjunto de portas, papéis e auditorias que garante que a arquitetura já construída continue sendo a arquitetura realmente implementada, Sprint após Sprint, daqui em diante.
