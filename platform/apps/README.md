# Apps Package

**Adaptive Business Platform**

Status: Draft
Origin: `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3 ("Apps")

*Este arquivo reserva oficialmente o pacote Apps. Ele não contém código — estabelece, de forma arquitetural, o propósito deste pacote antes da implementação completa de suas aplicações internas.*

**Nota sobre a Base Obrigatória**: a tarefa que originou este arquivo referenciou `APPS_ARCHITECTURE.md` como fonte condicional ("caso exista"). Este documento **não existe** em nenhum lugar do repositório. Este arquivo utiliza exclusivamente os documentos já disponíveis (`PACKAGE_STRUCTURE_MANIFEST.md`, `COMPONENT_01_PACKAGE_STRUCTURE_DESIGN.md`, `COMPONENT_01_IMPLEMENTATION_PLAN.md`, `GATE_G2_IMPLEMENTATION_ROADMAP.md`), sem inventar conteúdo para preencher essa ausência — consistente com `COMPONENT_01_PACKAGE_STRUCTURE_DESIGN.md`, Seção 5, que já registra: "Nenhum Blueprint dedicado a 'Apps' existe hoje no Documentation System."

**Verificação de divergência realizada antes da escrita**: comparei a Dependency Matrix de `PACKAGE_STRUCTURE_MANIFEST.md` com as menções a Apps/Dashboard em `GATE_G2_IMPLEMENTATION_ROADMAP.md` e em `COMPONENT_01_IMPLEMENTATION_PLAN.md`. Estes dois últimos citam apenas AI e Business Hubs como dependência de Apps, em tom narrativo — mas nenhum deles nega ou proíbe as demais dependências já permitidas pelo Manifesto (diferente do que ocorreu com o Arquivo 09, onde `GATE_G2` fazia uma afirmação diretamente contraditória). Não há divergência real a sinalizar: a lista do Manifesto é a mais completa e não é contradita por nenhuma das menções mais breves. Este arquivo segue integralmente a Dependency Matrix do Manifesto, a fonte já estabelecida como precedente para dependência de pacote.

---

## Purpose

O pacote Apps reúne as aplicações e pontos de entrada da Adaptive Business Platform — web, desktop, mobile, APIs, ou qualquer outro cliente — consumindo capacidades expostas pelos demais pacotes exclusivamente através de contratos públicos já estabelecidos. É o espaço de toda aplicação consumidora final, primariamente o Dashboard (Experience Layer e Presentation Layer já descritas em `03_AI_ARCHITECTURE.md`), conforme já delimitado em `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3.

---

## Responsibilities

- Hospedar aplicações da plataforma — o espaço reservado para cada aplicação cliente, incluindo a aplicação web já iniciada em `platform/apps/web/`.
- Consumir Commands, Queries e Events públicos — nunca acessando diretamente a estrutura interna de nenhum Business Hub, Platform Service, ou componente de IA.
- Coordenar interação com usuários e sistemas externos — a superfície final de toda solicitação e de toda resposta.
- Implementar apresentação e experiência do usuário — a Experience Layer e a Presentation Layer já descritas em `03_AI_ARCHITECTURE.md`.
- Integrar-se aos serviços da plataforma exclusivamente por interfaces públicas — nunca por acesso direto a componente interno de nenhum outro pacote.

---

## Non Responsibilities

Apps não:

- Contém Regras de negócio.
- Implementa Inteligência Artificial.
- Orquestra Workflows.
- Substitui Business Hubs.
- Implementa infraestrutura técnica compartilhada.

---

## Dependency Rules

Conforme `PACKAGE_STRUCTURE_MANIFEST.md`, Seção 4 (Dependency Matrix), linha "Apps":

- Apps pode depender de: Core, Shared, Platform Services, AI, Business Hubs, Automation.
- Apps nunca depende de: Infrastructure.
- Apps, por ser o consumidor final da plataforma, nunca é, ele mesmo, dependência de nenhum outro agrupamento (`PACKAGE_STRUCTURE_MANIFEST.md`, Seção 6).

Nenhuma divergência foi encontrada entre esta regra e os demais documentos revisados; nenhuma interrupção foi necessária.

---

## Design Principles

- **Separação entre apresentação e domínio** — Apps nunca implementa Regra de negócio; consome-a já processada através de Command, Evento ou Query.
- **Baixo acoplamento** — Apps depende apenas de contratos já publicados, nunca de detalhe de implementação interna de nenhum outro pacote.
- **Uso exclusivo de contratos públicos** — toda integração de Apps com o restante da plataforma acontece através de interface já autorizada.
- **Independência da interface em relação ao domínio** — uma mudança em Apps nunca exige alteração em nenhum Business Hub, Platform Service, ou componente de IA, e vice-versa.

---

## Validation Criteria

O pacote Apps será considerado válido quando:

✓ Depender apenas dos pacotes autorizados pelo Manifesto (Core, Shared, Platform Services, AI, Business Hubs, Automation).
✓ Não conter Regra de negócio.
✓ Consumir apenas interfaces públicas já autorizadas.
✓ Permanecer consistente com `PACKAGE_STRUCTURE_MANIFEST.md`.
