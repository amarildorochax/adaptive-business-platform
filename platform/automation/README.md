# Automation Package

**Adaptive Business Platform**

Status: Draft
Origin: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 ("Automation")

*Este arquivo reserva oficialmente o pacote Automation. Ele não contém código — estabelece, de forma arquitetural, o propósito deste pacote antes da implementação de seus componentes internos (Trigger, Condition, Action, Retry, fila de execução), já conceituados em `AUTOMATION_ENGINE.md`.*

---

## Purpose

O pacote Automation coordena Workflows, orquestração e execução de processos determinísticos — o espaço reservado para `AUTOMATION_ENGINE.md`, já delimitado em `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3. Consome capacidades expostas por outros pacotes (Business Hubs, AI) sem jamais assumir Regra de negócio própria: Automation decide *quando* um processo já configurado deve ocorrer, nunca *o que* esse processo significa para o domínio que ele afeta.

---

## Responsibilities

- Orquestrar Workflows — sequenciar Trigger, Condition e Action já configurados por uma Empresa cliente.
- Executar automações aprovadas — processar toda Action já autorizada pela Execution Policy aplicável.
- Consumir Commands, Queries e Events públicos — nunca acessando diretamente a estrutura interna de nenhum Business Hub ou de nenhum componente de IA.
- Coordenar integrações entre componentes autorizados — Business Hubs e AI, sempre através dos contratos já catalogados.
- Controlar estados de execução dos Workflows — incluindo Retry, conforme `AUTOMATION_ENGINE.md`, ADR-007, e isolamento de falha entre execuções, conforme ADR-009.

---

## Non Responsibilities

Automation não:

- Contém Regras de negócio.
- Implementa Inteligência Artificial.
- É proprietário de Entidade de domínio.
- Substitui Business Hubs.
- Implementa interface de usuário.

---

## Dependency Rules

- Automation pode depender apenas de: Core, Shared, Platform Services, AI, Business Hubs.
- Automation nunca depende de: Infrastructure, Apps.
- Toda interação ocorre exclusivamente pelos contratos arquiteturais já aprovados — Command, Evento e Query para Business Hubs; a Action "Executar IA" para AI, conforme `AUTOMATION_ENGINE.md`, ADR-003. AI nunca inicia Workflow por iniciativa própria — é sempre Automation quem orquestra a execução e, quando necessário, consome a IA.

---

## Design Principles

- **Orquestração desacoplada** — Automation coordena Trigger, Condition e Action sem conhecer a implementação interna de nenhum componente que orquestra.
- **Reutilização de capacidades** — toda Action reutiliza a capacidade já exposta por Business Hubs ou por AI, nunca duplicando lógica de negócio ou de raciocínio.
- **Baixo acoplamento** — Automation depende apenas de contratos já publicados, nunca de detalhe de implementação de nenhum consumidor.
- **Alta coesão** — toda lógica de Trigger, Condition, Retry e fila de execução permanece centralizada em Automation, conforme `AUTOMATION_ENGINE.md`, ADR-006.
- **Execução orientada por Eventos e contratos** — todo Workflow é disparado por Trigger já configurado, nunca por invocação ad hoc.

---

## Validation Criteria

O pacote Automation será considerado válido quando:

✓ Depender apenas de Core, Shared, Platform Services, AI e Business Hubs.
✓ Não conter Regra de negócio.
✓ Não substituir nenhum Business Hub.
✓ Preservar a separação entre Automação e IA — Automation orquestra, AI raciocina; nenhum dos dois assume o papel do outro.
✓ Permanecer consistente com `AUTOMATION_ENGINE.md`.
