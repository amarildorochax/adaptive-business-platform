# Dependency Management

**Adaptive Business Platform**

Status: Draft
Origin: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seções 4, 5 e 6; `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 2

*Este arquivo documenta oficialmente o componente Dependency Management. Ele não contém código, não implementa mecanismo de verificação, e não cria regra arquitetural nova — apenas documenta e organiza as regras de dependência entre pacotes já aprovadas em `PACKAGE_STRUCTURE_MANIFEST.md`.*

**Nota sobre a Base Obrigatória**: `COMPONENT_02_DEPENDENCY_MANAGEMENT_DESIGN.md` e `COMPONENT_02_IMPLEMENTATION_PLAN.md` foram criados retroativamente em `docs/implementation/components/`, restaurando a mesma cadeia documental já utilizada no Component 01. Uma Revisão de Conformidade dedicada confirmou que este README permanece integralmente consistente com ambos, sem necessidade de alteração de responsabilidade, princípio ou critério de validação.

---

## Purpose

Este componente define como os pacotes da Adaptive Business Platform se relacionam através de dependência controlada, preservando isolamento, baixo acoplamento e estabilidade arquitetural. Ele não define uma nova regra — organiza e documenta, em um único lugar dedicado a este propósito, a Dependency Matrix, as Mandatory Isolation Rules e as Coupling Restrictions já declaradas em `PACKAGE_STRUCTURE_MANIFEST.md`, Seções 4 a 6, aplicando o princípio de Loose Coupling já central a `BUSINESS_HUB_ARCHITECTURE.md`.

---

## Responsibilities

- Definir políticas de dependência — reafirmando a Dependency Matrix já declarada em `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 4, como a única fonte de verdade sobre qual pacote pode depender de qual.
- Documentar dependências permitidas — a coluna "Pode depender de" de cada agrupamento já registrado no Manifesto.
- Documentar dependências proibidas — a coluna "Nunca depende de" de cada agrupamento, incluindo as Mandatory Isolation Rules (Seção 5) que reforçam os casos mais críticos (Business Hubs entre si, AI e Business Hubs, Infrastructure e qualquer outro).
- Orientar consumo por contratos públicos — toda dependência permitida entre pacotes acontece através de contrato já publicado (Command, Evento, Query, ou interface pública equivalente), nunca por acesso a detalhe de implementação interna.
- Preservar independência entre componentes — aplicando as Coupling Restrictions já declaradas em `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 6: ausência de dependência circular, e nenhum agrupamento dependendo de outro que já dependa dele.

---

## Non Responsibilities

Este componente não:

- Implementa lógica de negócio.
- Cria novos pacotes — os oito agrupamentos já estão fixados em `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 2; este componente nunca adiciona ou remove nenhum.
- Modifica arquitetura.
- Implementa código.
- Substitui o Manifesto Arquitetural — organiza e aplica o que o Manifesto já declara, nunca o redefine.

---

## Design Principles

- **Baixo acoplamento** — todo pacote depende apenas de contrato já publicado, nunca de detalhe de implementação interna de outro.
- **Alta coesão** — a regra de dependência de cada pacote permanece próxima e coerente com sua própria responsabilidade já declarada em seu respectivo README.
- **Inversão de dependência** — pacotes de fundação (Core, Shared) nunca dependem de pacotes de conteúdo (Business Hubs, AI, Automation, Apps); é sempre o pacote de conteúdo que depende da fundação, nunca o contrário.
- **Contratos públicos** — toda dependência permitida se realiza através de Command, Evento, Query, ou interface já autorizada, nunca por acesso direto a estado interno.
- **Isolamento entre componentes** — nenhum pacote conhece a implementação interna de outro, mesmo quando autorizado a depender dele.
- **Estabilidade arquitetural** — a Dependency Matrix já aprovada em `PACKAGE_STRUCTURE_MANIFEST.md` é alterada apenas através do mesmo processo de revisão que já rege qualquer mudança ao próprio Manifesto, nunca por conveniência pontual de implementação.

---

## Validation Criteria

Este documento será considerado válido quando:

✓ Estiver consistente com `PACKAGE_STRUCTURE_MANIFEST.md`, sem nenhuma divergência.
✓ Não criar nenhuma regra arquitetural nova além das já declaradas no Manifesto.
✓ Não modificar nenhuma dependência já existente entre pacotes.
✓ Servir como documentação oficial e consultável do componente Dependency Management.
