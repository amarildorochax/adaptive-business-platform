# Amendment Proposal — PLATFORM_MANIFESTO.md — Smart Business Identity

**Adaptive Business Platform · Amendment (per `DOCUMENTATION_CONSTITUTION.md`, Seção 10)**

Status: **Approved and Applied**
Category: Governance — Change Management
Target Document: `docs/architecture/PLATFORM_MANIFESTO.md` (Frozen → Version 2.0)
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1), Seção 10 (Change Management), Seção 8.3 (Frozen), Seção 14 (Approval Process)

*Esta Amendment foi formalmente aprovada e aplicada. A aprovação foi concedida explicitamente pelo usuário — parte independente de quem redigiu esta proposta (Claude) — satisfazendo a exigência de `DOCUMENTATION_CONSTITUTION.md`, Seção 14: "No document may be advanced in status by the same party who authored or owns it, without an independent Approval from the appropriate level above." A alteração descrita na Seção 1 abaixo foi aplicada integralmente a `PLATFORM_MANIFESTO.md`, e nenhuma outra modificação foi realizada.*

**Registro de Aprovação**: aprovado explicitamente pelo usuário (Owner/autoridade do projeto), em 2026-07-23, nesta mesma sessão de trabalho, em resposta direta à pergunta formal sobre autoridade de aprovação levantada antes de qualquer aplicação.

---

## 1. O que está mudando

Propõe-se estender a seção "Branding inteligente" de `PLATFORM_MANIFESTO.md` (onde o conceito **Smart Business Identity** é definido, linha 173), para reconhecer explicitamente que a identidade de uma empresa dentro da plataforma não se limita à sua dimensão **visual** (logo, paleta, tipografia — já integralmente coberta pelo texto atual), mas também compreende uma dimensão **institucional** (nome da empresa, dados cadastrais, contatos), reconhecida como parte da mesma visão original de "Smart Business Identity", conforme já confirmado em `docs/governance/PRODUCT_VISION_ALIGNMENT_DECISION.md`.

**Texto atual (linha 173, inalterado até aprovação)**:
> *"Isso é o que chamamos de Smart Business Identity: a ideia de que a identidade de uma empresa não é um detalhe estético aplicado depois que o produto já existe, mas um dado de entrada que molda a aparência de tudo o que a empresa vê e tudo o que ela produz através da plataforma."*

**Extensão proposta (parágrafo adicional, a inserir após a linha 173, mediante aprovação)**:
> *"Smart Business Identity, embora historicamente descrito nesta seção em sua dimensão visual, também compreende a dimensão institucional de uma empresa — quem ela é, como é chamada, e como pode ser contatada — como parte da mesma identidade de entrada que molda a experiência da plataforma. Esta extensão reconhece a dimensão institucional como parte da visão original; ela não define, por si só, nenhuma estrutura de dado, nenhum campo, nenhum módulo responsável, e nenhuma implementação técnica — essas decisões permanecem sujeitas a um processo arquitetural dedicado e futuro."*

Este documento propõe **apenas o texto acima**. Nenhuma estrutura de dado, nenhum campo, nenhum módulo, e nenhuma tecnologia são definidos por esta proposta.

---

## 2. Por que a justificativa original de congelamento ainda vale, ou precisa ser estendida

A justificativa original de congelamento de `PLATFORM_MANIFESTO.md` — servir como fundação estável sobre a qual os demais documentos são construídos sem risco de instabilidade — **continua válida** e não é contestada por esta proposta. O que esta proposta identifica é que o texto atual da Seção "Branding inteligente", embora estável, **descreve apenas parcialmente** a visão que o próprio termo "Smart Business Identity" pretendia capturar, conforme já apurado por três auditorias formais e uma decisão de governança nesta mesma linha de trabalho:

- `docs/audits/PLATFORM_VISION_CONFORMITY_AUDIT.md` — identificou ausência documental de nome da empresa, dados institucionais e contatos.
- `docs/audits/PLATFORM_VISION_GAP_CONFIRMATION.md` — confirmou ausência de evidência implícita para essas mesmas capacidades.
- `docs/governance/SCOPE_ORIGINAL_VISION_DECISION.md` — inicialmente concluiu que essas capacidades não pertenciam ao escopo documental já consolidado.
- `docs/governance/PRODUCT_VISION_ALIGNMENT_DECISION.md` — revisou essa conclusão sob a ótica da visão de produto (não apenas da documentação arquitetural) e concluiu que essas capacidades **pertencem à visão original**, fundamentando-se no próprio conceito de Smart Business Identity já registrado nesta Seção do Manifesto.

Portanto, a extensão proposta não reverte nem enfraquece a justificativa de congelamento — ela a **completa**, alinhando o texto Frozen à visão de produto já formalmente reconhecida em `PRODUCT_VISION_ALIGNMENT_DECISION.md`.

---

## 3. Impacto sobre todo documento que depende de `PLATFORM_MANIFESTO.md`

Um levantamento foi realizado sobre todos os documentos de `docs/architecture/` que referenciam Branding Hub, identidade visual, ou identidade de marca (29 documentos, listados no relatório de alinhamento correspondente). Para cada um, verificou-se se a extensão proposta cria alguma inconsistência com o que esse documento já afirma.

**Conclusão do levantamento**: **nenhum** dos 29 documentos analisados faz, hoje, qualquer afirmação sobre o escopo total de "identidade da empresa" que seria contradita pela extensão proposta — cada um consome o conceito de Branding/identidade de forma restrita ao seu próprio contexto (ex.: "a resposta da IA é estilizada via Branding Hub"), sem jamais declarar que a identidade da empresa se limita à dimensão visual. Portanto, esta Amendment, se aprovada, **não exige nenhuma mudança consequente** em nenhum outro documento já publicado.

A única exceção observada, não classificada como inconsistência mas como oportunidade futura de precisão, é `BRANDING_HUB.md` (Official), cuja introdução já delimita corretamente seu próprio escopo como "identidade visual, comunicacional e experiencial" — um escopo que permanece integralmente válido e não precisa de nenhuma correção, já que o Branding Hub nunca reivindicou cobrir a dimensão institucional.

---

## 4. O que esta Amendment explicitamente NÃO decide

- Não decide qual módulo, componente, ou Hub será responsável pela dimensão institucional da identidade da empresa.
- Não define nenhum campo, estrutura de dado, ou contrato.
- Não cria nenhuma arquitetura, ADR, ou requisito técnico.
- Não altera o escopo da versão 1.0 além do já registrado em `PRODUCT_VISION_ALIGNMENT_DECISION.md`.
- Uma decisão arquitetural dedicada e futura — seguindo o mesmo padrão já aplicado ao Component 03 (Princípios → Critérios de Aceitação → Estrutura Concreta) — permanece necessária antes de qualquer implementação.

---

## 5. Aprovação Concedida

Conforme `DOCUMENTATION_CONSTITUTION.md`, Seção 10: *"An Amendment requires the highest applicable level of approval (Section 14) and always increases the major version."* Esta Amendment **foi aprovada** pelo usuário, na função de Owner/autoridade do projeto, de forma explícita e independente de quem redigiu a proposta, conforme exigido pela Seção 14. A versão de `PLATFORM_MANIFESTO.md` foi incrementada de 1.0 para 2.0, registrada em sua nova Seção "Amendment History".

---

## Approval

| Campo | Valor |
|---|---|
| Status | APPROVED AND APPLIED |
| Major version increase | Sim — `PLATFORM_MANIFESTO.md` 1.0 → 2.0 |
| Approved by | Usuário (Owner/autoridade do projeto), independente do autor da proposta |
| Author (proposta) | Claude |
