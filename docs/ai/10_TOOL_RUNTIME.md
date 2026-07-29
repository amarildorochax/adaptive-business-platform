# 10 — Tool Runtime

**Adaptive Business Platform · AI Handbook · Documento Técnico Oficial**

Status: Draft
Category: AI Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este capítulo não implementa ferramentas, não define SDK, não define conector, não define API, e não especifica tecnologia. Ele descreve responsabilidades, limites arquiteturais e relações conceituais, organizando material já estabelecido em `AI_ARCHITECTURE.md` e em `AGENT_FRAMEWORK.md`. Onde necessário, referencia `AI_MANIFESTO.md`, `AI_GOVERNANCE.md`, `04_AI_ORCHESTRATOR.md`, `08_REASONING_ENGINE.md` e `09_SKILL_RUNTIME.md`.*

---

## 1. Purpose

Este capítulo existe para dar à mediação de acesso a serviços, sistemas e recursos externos um lugar próprio na estrutura modular do Volume II. A plataforma já descreve essa função como **Tool Abstraction**, conceituada estruturalmente em `AI_ARCHITECTURE.md`, Capítulo 9, e detalhada, do ponto de vista do Agente que a consome indiretamente, em `AGENT_FRAMEWORK.md`, Capítulo 14. Como `07_PLANNING_ENGINE.md`, `08_REASONING_ENGINE.md` e `09_SKILL_RUNTIME.md`, este era um dos seis documentos pendentes identificados em `VOLUME_II_CONSOLIDATION_REPORT.md`, Seção 6. Este capítulo preenche essa posição organizando o que já está descrito, sem introduzir conector, SDK, API ou tecnologia nova.

---

## 2. Responsibilities

O Tool Runtime existe para:

- **Mediar acesso a recursos externos** — toda API é acessada através do Integration Hub (`INTEGRATION_HUB.md`, ADR-001); todo arquivo ou documento, através do Knowledge Hub (`KNOWLEDGE_HUB.md`, ADR-002); todo dado de negócio, através de Query já catalogada em `QUERY_CATALOG.md`; e todo sistema externo, exclusivamente através do Integration Hub, preservando o princípio Single Integration Layer.
- **Aplicar políticas de execução** — verificar, a cada solicitação de uma Skill, que o `Tool Access` já declarado no Agent Contract do Agente invocador é respeitado integralmente.
- **Isolar integrações** — absorver qualquer mudança futura na tecnologia específica de acesso a um recurso externo, sem exigir alteração na Skill que a consome nem na camada de raciocínio acima dela.
- **Retornar resultado padronizado** — devolver à Skill invocadora um resultado através de um contrato estável, nunca uma implementação técnica específica sujeita a mudança sem aviso.

O Tool Runtime nunca:

- **Raciocina** — ele executa acesso técnico já decidido pela Skill; nenhuma inferência ou julgamento é aplicado por ele.
- **Planeja** — ele nunca decompõe objetivo ou subtarefa.
- **Decide Regra de negócio** — nenhuma Regra, Entidade ou Command é processado por ele.
- **Acessa recurso sem autorização** — nenhum acesso a recurso externo ocorre sem verificação prévia de `Tool Access` e de Permission herdada da solicitação original.

---

## 3. Tool Model

O ciclo de utilização de uma Ferramenta, já descrito em `AI_ARCHITECTURE.md`, Capítulo 9, e em `AGENT_FRAMEWORK.md`, Capítulo 14, permanece integralmente o mesmo aqui referenciado, nunca redefinido:

```
              ACESSO A FERRAMENTA MEDIADO (visão consolidada)
   ┌───────────────────────────────────────────────────────────┐
   │  Agente ──► Skill ──► Tool Abstraction ──► recurso externo          │
   │                                                                │
   │  Em nenhum ponto desta cadeia o Agente acessa diretamente           │
   │  o recurso externo — toda mediação passa integralmente pela              │
   │  Tool Abstraction                                                                  │
   └───────────────────────────────────────────────────────────┘
```

Mapeado às cinco fases conceituais solicitadas: **Seleção** é o momento em que a Skill identifica a necessidade de um recurso externo específico; **Autorização** é a verificação do `Tool Access` do Agente invocador e da Permission herdada da solicitação original, antes de qualquer acesso efetivo; **Invocação** é a mediação técnica através do Integration Hub, do Knowledge Hub, ou de Query já catalogada, conforme a natureza do recurso; **Resposta** é o retorno padronizado do resultado à Skill; **Encerramento** é a conclusão da mediação, sem que nenhuma conexão ou estado técnico persista além da invocação.

```
              TOOL ABSTRACTION (isolamento tecnológico)
   ┌───────────────────────────────────────────────────────────┐
   │  Skill                                                         │
   │    │                                                            │
   │    ▼                                                            │
   │  Tool Abstraction (contrato estável)                                │
   │    │                                                            │
   │  ┌─┴──────────┬─────────────┬─────────────┐                          │
   │  ▼            ▼             ▼             ▼                          │
   │ Integration  Knowledge     Query já       recurso                        │
   │ Hub          Hub           catalogada     externo futuro                     │
   └───────────────────────────────────────────────────────────┘
```

---

## 4. Interactions

Em nível estritamente conceitual — sem protocolo, sem contrato técnico, sem API:

| Interação | Natureza conceitual |
|---|---|
| **Skill Runtime** | O Tool Runtime é sempre consumido por uma Skill já em execução, nunca diretamente por um Agente ou pelo Reasoning Engine (`09_SKILL_RUNTIME.md`, Seção 4). |
| **AI Orchestrator** | A Execution Policy já anotada pelo Execution Policy Engine para a Skill que consome o recurso externo se aplica igualmente ao acesso mediado pelo Tool Runtime (`04_AI_ORCHESTRATOR.md`). |
| **Agentes** | Nenhum Agente acessa recurso externo diretamente — o `Tool Access` declarado em seu Agent Contract delimita o que sua Skill pode alcançar através do Tool Runtime, nunca uma ampliação decidida pelo próprio Agente. |
| **Serviços Externos** | Alcançados exclusivamente através do Integration Hub, do Knowledge Hub, ou de Query já catalogada — nunca por acesso direto de qualquer componente da camada de IA. |

---

## 5. Access Boundaries

- **Isolamento tecnológico**: qualquer mudança de tecnologia de acesso a um recurso externo é absorvida inteiramente pelo Tool Runtime, sem propagar alteração a nenhuma Skill, Agente, ou camada de raciocínio.
- **Autorização por invocação**: todo acesso é verificado contra o `Tool Access` do Agent Contract e a Permission herdada da solicitação original — nunca ampliada pela própria Skill ou pelo próprio Agente.
- **Auditoria e rastreabilidade**: todo acesso a recurso externo produz sinal de Observabilidade suficiente para reconstrução posterior, nunca uma mediação silenciosa.
- **Fronteira única de saída**: nenhum recurso externo é alcançado por caminho alternativo ao Integration Hub, ao Knowledge Hub, ou à Query já catalogada — preservando o princípio Single Integration Layer.

---

## 6. Relationship with Volume I

O Tool Runtime nunca acessa diretamente a estrutura de armazenamento transacional de nenhum Business Hub — todo dado de negócio é obtido exclusivamente através de Query já catalogada em `QUERY_CATALOG.md`. Todo sistema externo é alcançado exclusivamente através do Integration Hub, e todo documento, através do Knowledge Hub — ambos já consolidados como Platform Service Hubs pelo Volume I. Nenhuma mudança de estado de negócio resulta de uma invocação de Ferramenta sem convergir, como qualquer outra ação, para o Command Bus já governado pelo Volume I.

---

## 7. Relationship with AI_MANIFESTO

O isolamento tecnológico central a este componente é a aplicação mais direta de `Provider independence` (`02_AI_PRINCIPLES.md`, Seção 4) — nenhuma capacidade da plataforma depende irreversivelmente de uma tecnologia específica de acesso externo. A verificação obrigatória de autorização antes de qualquer acesso aplica `Safety before execution` (Seção 5). A delimitação estrita de escopo de acesso, nunca ampliada pelo próprio Agente, aplica `Data minimization by design` (Seção 4).

---

## 8. Scope

Este capítulo cobre exclusivamente: o papel do Tool Runtime na mediação de acesso a recursos externos, seu ciclo conceitual, suas interações, e os limites de isolamento e autorização já estabelecidos.

Este capítulo não cobre, e não tem autoridade para: definir conector, SDK, API, ou protocolo técnico de integração; especificar tecnologia de acesso a qualquer recurso externo; ou detalhar o Integration Hub ou o Knowledge Hub, já integralmente definidos pelo Volume I.

---

## 9. Future Evolution

Este componente é integrado a `11_MULTI_AGENT_SYSTEM.md`, já escrito, que detalha como invocações de Ferramenta por Agentes distintos, direcionadas ao mesmo recurso externo dentro da mesma solicitação, são coordenadas sem conflito. A mesma abstração que hoje absorve Integration Hub, Knowledge Hub e Query já catalogada é, por desenho, o ponto de extensão para qualquer novo tipo de recurso externo que a plataforma venha a integrar no futuro, sem exigir alteração em nenhum componente já existente da camada de IA.

---

## 10. Approval

| Campo | Valor |
|---|---|
| Status | Draft |
| Version | 0.1 |
| Author | Claude |
