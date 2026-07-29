# Hub-to-Package Mapping Declaration

**Adaptive Business Platform**

Status: Draft
Origin: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 ("Business Hubs"); `docs/architecture/DOMAIN_OWNERSHIP_MATRIX.md`

*Este documento consolida oficialmente o mapeamento entre cada Business Hub já catalogado e seu pacote correspondente dentro de `platform/business-hubs/`. Ele não cria regra nova, não altera nenhum Blueprint, e não redefine nenhuma fronteira de Ownership — apenas declara, em um único lugar, o relacionamento já aprovado entre Blueprint e Hub.*

---

## Purpose

Este documento define oficialmente o relacionamento entre cada Business Hub e seu pacote correspondente, garantindo rastreabilidade completa entre a documentação de domínio já aprovada (`DOMAIN_OWNERSHIP_MATRIX.md` e cada Domain Blueprint) e a estrutura de pacotes já reservada em `platform/business-hubs/README.md`. Ele preserva o isolamento entre domínios: nenhuma entrada deste mapeamento introduz relação entre um Business Hub e outro.

---

## Mapping Table

| Blueprint | Package | Ownership | Domain Boundary |
|---|---|---|---|
| `CRM_DOMAIN_BLUEPRINT.md` | CRM Hub | Relacionamento comercial pertence exclusivamente ao CRM Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, Seção 4) | Customer, Lead, Organization, Contact, Opportunity, Pipeline, Interaction, e demais conceitos de relacionamento comercial já catalogados |
| `COMMUNICATION_DOMAIN_BLUEPRINT.md` | Communication Hub | Comunicação pertence exclusivamente ao Communication Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, Seção 4) | Conversation, Message, Delivery, Channel, Inbox, Thread, e demais conceitos de comunicação já catalogados |
| `FINANCE_DOMAIN_BLUEPRINT.md` | Finance Hub | Estado financeiro pertence exclusivamente ao Finance Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, Seção 4) | Invoice, Payment, Ledger Entry, Subscription, Account Receivable/Payable, e demais conceitos financeiros já catalogados |
| `GROWTH_DOMAIN_BLUEPRINT.md` | Growth Hub | Crescimento pertence exclusivamente ao Growth Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, Seção 4) | Campaign, Audience, Funnel, Journey, Experiment, Conversion Goal, e demais conceitos de crescimento já catalogados |
| `ANALYTICS_DOMAIN_BLUEPRINT.md` | Analytics Hub | Superfície consolidada de leitura pertence exclusivamente ao Analytics Hub (`DOMAIN_OWNERSHIP_MATRIX.md`, Seção 4) | Dashboard, Widget, Report, Metric, KPI, Trend, Forecast — nunca o dado operacional bruto de origem, que permanece com CRM, Communication, Finance e Growth (princípio "Analytics Never Owns Operational Data") |

Nota de status: `CRM_DOMAIN_BLUEPRINT.md`, `CRM_HUB.md` são Frozen; `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_HUB.md`, `FINANCE_DOMAIN_BLUEPRINT.md`, `FINANCE_HUB.md`, `GROWTH_DOMAIN_BLUEPRINT.md`, `ANALYTICS_DOMAIN_BLUEPRINT.md`, `ANALYTICS_HUB.md` são Official; `GROWTH_HUB.md` permanece em Draft, conforme `DOCUMENTATION_INDEX.md`, Seção 7.2. Este mapeamento reflete o Blueprint em qualquer status — a diferença de maturidade documental não altera o mapeamento Blueprint → Package aqui declarado.

---

## Architectural Rules

- Cada Blueprint possui exatamente um Business Hub correspondente.
- Cada Business Hub pertence a um único domínio.
- Nenhum Business Hub pertence a mais de um Blueprint.
- Nenhum Blueprint compartilha domínio com outro Blueprint.
- Toda comunicação entre os cinco Business Hubs, e entre qualquer um deles e outro agrupamento, ocorre exclusivamente pelos mecanismos arquiteturais já aprovados — Commands, Queries e Events — nunca por dependência direta de pacote.

---

## Dependency Statement

Este documento não cria dependência entre Business Hubs. Todos os cinco Business Hubs mapeados permanecem independentes entre si, exatamente como já declarado em `platform/business-hubs/README.md` — este mapeamento é puramente declarativo e de rastreabilidade, nunca uma introdução de acoplamento.

---

## Validation Criteria

Este documento será considerado válido quando:

✓ Todos os cinco Blueprints estiverem mapeados.
✓ Todos os cinco Hubs estiverem mapeados.
✓ Não existir relacionamento muitos-para-muitos entre Blueprint e Hub.
✓ Não existir compartilhamento de domínio entre dois Business Hubs.
✓ O documento permanecer consistente com `DOMAIN_OWNERSHIP_MATRIX.md`.
