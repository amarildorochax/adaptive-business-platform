# Package Structure Manifest

**Adaptive Business Platform**

Status: Draft
Origin: `docs/implementation/components/COMPONENT_01_PACKAGE_STRUCTURE_DESIGN.md`

*Este é o primeiro arquivo real da implementação da Adaptive Business Platform. Ele é a única fonte de verdade sobre quais agrupamentos arquiteturais de topo existem dentro de `platform/` e sobre qual dependência é permitida entre eles. Nenhum agrupamento novo é criado aqui além dos oito já aprovados; nenhuma tecnologia, linguagem, framework, ou estrutura física de diretórios é definida por este manifesto.*

---

## 1. Purpose

Este manifesto declara, de forma única e vinculante, os agrupamentos arquiteturais de topo que compõem `platform/` e a matriz de dependência permitida entre eles. Todo arquivo de reserva de agrupamento subsequente (`Core`, `Shared`, `Platform Services`, `AI`, `Business Hubs`, `Automation`, `Infrastructure`, `Apps`) e a declaração de mapeamento de Hub para pacote referenciam este manifesto como sua origem — nenhum deles redefine o que está aqui declarado.

---

## 2. Architectural Groupings

Os oito agrupamentos arquiteturais de topo, e apenas estes oito:

1. **Core**
2. **Shared**
3. **Platform Services**
4. **AI**
5. **Business Hubs**
6. **Automation**
7. **Infrastructure**
8. **Apps**

Nenhum agrupamento além destes oito é criado, e nenhum destes oito é removido, por nenhum documento ou arquivo subsequente sem que este manifesto seja formalmente revisado primeiro.

---

## 3. Grouping Responsibilities

| Agrupamento | Responsabilidade |
|---|---|
| **Core** | Espaço da forma genérica de Command, Evento e Query (Shared Types) e dos contratos abstratos de Ownership e de mediação (Base Contracts). Nenhum vocabulário de domínio específico reside aqui. |
| **Shared** | Espaço da taxonomia de Errors, da capacidade de Logging, do mecanismo de Configuration, e das Utilities. Agnóstico de domínio de negócio e de arquitetura de IA. |
| **Platform Services** | Espaço comum de Identity, Knowledge e Integration. Serve tanto Business Hubs quanto AI, sem ser propriedade de nenhum dos dois. |
| **AI** | Espaço de toda a arquitetura já consolidada do Volume II — Orchestrator, Agent Framework, Context, Memória, Planejamento, Raciocínio, Skill Runtime, Tool Runtime, Multi-Agent System, Governança e Observabilidade. Distinto de Platform Services por escala, apesar de `AI_HUB.md` ser classificado como Platform Service Hub em Volume I. |
| **Business Hubs** | Espaço isolado para cada um dos cinco pares Blueprint/Hub já catalogados: CRM, Communication, Finance, Growth e Analytics. |
| **Automation** | Espaço do Automation Engine. |
| **Infrastructure** | Espaço do substrato técnico exigido por `NON_FUNCTIONAL_REQUIREMENTS.md`. Distinto do componente Configuration (que é o mecanismo de leitura de valor, não o ambiente técnico em si). |
| **Apps** | Espaço de toda aplicação consumidora final da plataforma, primariamente o Dashboard (Experience Layer e Presentation Layer). |

---

## 4. Dependency Matrix

| Agrupamento | Pode depender de | Nunca depende de |
|---|---|---|
| **Core** | (nenhum) | qualquer outro agrupamento |
| **Shared** | (nenhum) | qualquer outro agrupamento |
| **Platform Services** | Core, Shared | AI, Business Hubs, Automation, Apps, Infrastructure |
| **AI** | Core, Shared, Platform Services | Business Hubs, Automation, Apps, Infrastructure |
| **Business Hubs** | Core, Shared, Platform Services | outro Business Hub, AI, Automation, Apps, Infrastructure |
| **Automation** | Core, Shared, Platform Services, Business Hubs, AI | Apps, Infrastructure |
| **Infrastructure** | (nenhum) | qualquer outro agrupamento — e nenhum outro agrupamento depende dele no nível de pacote |
| **Apps** | Core, Shared, Platform Services, AI, Business Hubs, Automation | Infrastructure |

A permissão de Automation depender de AI deriva diretamente de `AI_MANIFESTO.md`: a IA nunca executa automação diretamente, mas é invocada por uma Action dentro de um Workflow já disparado por um Trigger — logo, é o Automation Engine que pode invocar a AI, nunca o contrário.

---

## 5. Mandatory Isolation Rules

- Nenhum Business Hub depende de outro Business Hub, direta ou indiretamente.
- AI nunca depende de Business Hubs — toda interação acontece exclusivamente através de Command Bus e Event Bus já catalogados, nunca por dependência de pacote.
- Core e Shared nunca dependem de nenhum outro agrupamento — são a única base sobre a qual todo o restante é construído.
- Infrastructure não é dependência de pacote de nenhum outro agrupamento — sua relação com os demais é de substrato de implantação, nunca de importação de código.
- Nenhum agrupamento além de Platform Services contém Identity, Knowledge, ou Integration.

---

## 6. Coupling Restrictions

- Nenhuma dependência circular é permitida entre nenhum par de agrupamentos.
- Nenhum agrupamento pode depender de um agrupamento que, direta ou indiretamente, já dependa dele.
- Toda dependência entre agrupamentos deve ser explícita e rastreável a esta matriz — nenhuma dependência implícita ou não declarada é permitida.
- Apps, por ser o consumidor final, nunca é dependência de nenhum outro agrupamento.

---

## 7. Organizing Principles

- **Fundação antes de conteúdo** — Core e Shared existem antes, e independentemente, de qualquer agrupamento que os consuma.
- **Serviço antes de domínio** — Platform Services existe antes de AI e de Business Hubs, ambos seus consumidores.
- **Domínio antes de automação e apresentação** — Business Hubs existe antes de Automation e de Apps, que dependem de seu conteúdo já publicado.
- **Isolamento entre pares** — nenhum Business Hub conhece a existência interna de outro; nenhuma camada de IA conhece a implementação interna de nenhum Business Hub.
- **Neutralidade tecnológica** — nenhum princípio aqui listado pressupõe linguagem, framework, ou convenção de build específica.

---

## 8. Manifest Validation Criteria

- Os oito agrupamentos da Seção 2 estão presentes, e nenhum agrupamento adicional foi introduzido.
- Toda dependência declarada na Seção 4 corresponde exatamente à já aprovada em `COMPONENT_01_PACKAGE_STRUCTURE_DESIGN.md`, Seção 5.
- Nenhuma referência circular existe na Dependency Matrix.
- Nenhum acoplamento proibido pela Seção 5 ou pela Seção 6 está presente.
- O conteúdo deste manifesto é consistente com o Architectural Inventory de `GATE_G2_IMPLEMENTATION_ROADMAP.md`, Seção 4.
