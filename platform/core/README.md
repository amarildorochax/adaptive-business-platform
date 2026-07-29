# Core

**Adaptive Business Platform**

Status: Draft
Origin: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 ("Core"); `COMPONENT_03_SHARED_TYPES_DESIGN.md`; `COMPONENT_03_IMPLEMENTATION_PLAN.md`

*Este arquivo reserva oficialmente o pacote Core. Ele não contém código — estabelece, de forma arquitetural, o propósito deste pacote e de seus componentes internos.*

**Nota de atualização (2026-07-23)**: este arquivo foi originalmente criado e aprovado no Component 01 — Package Structure (`CORE_PACKAGE_FINAL_VALIDATION_REPORT.md`, Decision D-003/D-004), como reserva geral do agrupamento Core. Ele agora é expandido, no mesmo local, para formalizar o componente Shared Types do Component 02 — Sprint 1, conforme decidido explicitamente para evitar duplicar reserva de pacote em dois arquivos distintos. Nenhum conteúdo já aprovado no Component 01 foi removido — apenas reorganizado sob a estrutura exigida por `COMPONENT_03_SHARED_TYPES_DESIGN.md`, e complementado com as novas seções "Shared Types", "Base Contracts" e "Important Terminology".

---

## Purpose

Core representa a fundação da Adaptive Business Platform — o único agrupamento do qual todo o restante da plataforma pode depender sem restrição, e que, por sua vez, não depende de nenhum outro. É o espaço da forma genérica de Command, Evento e Query (Shared Types), e dos contratos abstratos de Ownership e de mediação (Base Contracts), conforme já declarado em `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3.

---

## Responsibilities

- Contratos fundamentais — a forma genérica de Command, Evento e Query já catalogada em Volume I.
- Tipos base — as estruturas de dado compartilhadas que todo agrupamento subsequente consome.
- Abstrações comuns — os contratos abstratos de Ownership e de mediação entre Hubs.
- Interfaces compartilhadas — o ponto de extensão que todo Business Hub e todo Platform Service Hub satisfaz.
- Mecanismos básicos reutilizáveis — capacidades estruturais sem conteúdo de domínio, reaproveitáveis por qualquer agrupamento.

---

## Shared Types

"Shared Types" é o componente da Sprint 1 que representa, dentro do agrupamento Core, a **forma genérica** de:

- **Command**
- **Event**
- **Query**

Estas três categorias já estão conceituadas em `BUSINESS_HUB_ARCHITECTURE.md` — Command expressa intenção de mudança ainda não ocorrida; Evento expressa um fato já consumado; Query expressa leitura sem efeito colateral, atravessando fronteira de Hub apenas quando estritamente necessária (`BUSINESS_HUB_ARCHITECTURE.md`, Seções 5 e 7). O propósito e os princípios deste componente estão organizados em `COMPONENT_03_SHARED_TYPES_DESIGN.md`.

Este README **não define implementação**, **não cria tipos** além dos três já conceituados, **não escolhe linguagem**, e **não apresenta exemplos concretos** — apenas reserva e documenta, em nível arquitetural, o espaço já aprovado para este componente.

---

## Base Contracts

O agrupamento Core também abriga os contratos abstratos de Ownership e de mediação entre Hubs, previstos como o componente **Base Contracts** — item 5 de `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5. Este README apenas menciona sua existência prevista dentro deste mesmo agrupamento; não detalha sua implementação, que permanece fora do escopo deste componente (Shared Types) e será tratada quando o componente Base Contracts for iniciado.

---

## Non Responsibilities / Out of Scope

Core não contém, sob nenhuma circunstância:

- Regras de negócio.
- Inteligência Artificial.
- Automações.
- Business Hubs.
- Infraestrutura.
- Aplicações.

Especificamente para o componente Shared Types, também estão fora de escopo (`COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope"):

- Definição de campo, estrutura de dado concreta, ou forma final de Command, Evento ou Query.
- Escolha de linguagem, framework, ou qualquer tecnologia.
- Redefinição de qualquer Command, Evento ou Query específico já descrito em cada Business Hub.
- Criação de categoria além de Command, Evento e Query.
- Detalhamento de implementação de Base Contracts (ver seção acima).

---

## Dependency Rules

- Core não depende de nenhum outro agrupamento.
- Todos os demais agrupamentos podem depender de Core.
- Core nunca depende de: AI, Business Hubs, Automation, Apps, Infrastructure, Platform Services.

---

## Design Principles

Princípios do agrupamento Core, já aprovados no Component 01:

- **Estabilidade** — uma mudança em Core é a mudança de maior impacto possível na plataforma; por isso, sua evolução é deliberadamente lenta e cuidadosa.
- **Reutilização** — todo conteúdo de Core existe para ser consumido por múltiplos agrupamentos, nunca para uso exclusivo de um único consumidor.
- **Baixo acoplamento** — Core nunca é desenhado em função da necessidade específica de um único Business Hub ou de um único componente de IA.
- **Ausência de lógica de negócio** — nenhuma Regra, nenhuma Entidade, nenhum vocabulário de domínio específico reside aqui.
- **Independência tecnológica** — nenhum princípio de Core pressupõe linguagem, framework, ou convenção de build específica.

Princípios específicos de Shared Types já estão organizados em `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Design Principles" — este README não os duplica, apenas referencia: Intenção antes de Fato, Publish Facts Not Commands, Query como leitura explícita e excepcional entre Hubs, e Contratos formalizando o formato de Evento e Query.

---

## Important Terminology

**Shared Types** é o nome deste componente documental.

O agrupamento arquitetural onde ele reside é **Core**.

O agrupamento arquitetural **Shared** representa outro espaço da arquitetura — a taxonomia de Errors, a capacidade de Logging, o mecanismo de Configuration e as Utilities (`platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3) — e **não deve ser confundido** com este componente.

Esta seção existe exclusivamente para evitar ambiguidade documental entre os dois nomes semelhantes; ela não cria nenhuma regra arquitetural nova, apenas reafirma uma distinção já existente no Manifesto (Seções 2 e 3).

---

## Validation Criteria

O pacote Core será considerado válido quando:

✓ Permanecer independente — sem depender de nenhum outro agrupamento.
✓ Não possuir regras de negócio — nenhuma Regra ou Entidade de domínio específico.
✓ Não possuir dependências externas — nenhuma referência a Business Hub, AI, Automation, Apps, Infrastructure, ou Platform Services.
✓ Puder ser reutilizado por toda a plataforma — todo agrupamento subsequente consegue depender dele sem restrição.
✓ O componente Shared Types não conter nenhuma implementação, tipo novo, linguagem escolhida, ou exemplo concreto.
✓ A distinção entre "Shared Types" (componente) e "Shared" (agrupamento) permanecer explícita.

---

## Traceability

| Seção | Fonte |
|---|---|
| Purpose | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 |
| Responsibilities | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 |
| Shared Types | `COMPONENT_03_SHARED_TYPES_DESIGN.md`; `COMPONENT_03_IMPLEMENTATION_PLAN.md`; `BUSINESS_HUB_ARCHITECTURE.md`, Seções 5 e 7 |
| Base Contracts | `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 5 |
| Non Responsibilities / Out of Scope | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3; `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope" |
| Dependency Rules | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 4 |
| Design Principles | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 7; `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Design Principles" |
| Important Terminology | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 2 e 3 |
| Validation Criteria | `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 8; `COMPONENT_03_IMPLEMENTATION_PLAN.md`, Seção "Acceptance Criteria" |

Nenhuma informação ausente foi identificada nas quatro fontes obrigatórias para este README.
