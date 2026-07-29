# Scope — Original Vision Decision

**Adaptive Business Platform · Decisão de Governança**

Status: Draft
Category: Governance Decision
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Esta decisão determina, exclusivamente com base em `PLATFORM_VISION_CONFORMITY_AUDIT.md`, `PLATFORM_VISION_GAP_CONFIRMATION.md`, `BUSINESS_HUB_ARCHITECTURE.md`, `SAAS_ARCHITECTURE.md`, `BUSINESS_PROFILE_ENGINE.md` e `BRANDING_HUB.md`, se as cinco lacunas já identificadas pertencem ao escopo original da Adaptive Business Platform. Nenhuma arquitetura é alterada, nenhum componente é criado, nenhuma funcionalidade é implementada, e nenhum documento existente é modificado.*

---

## 1. Nome da empresa

**NÃO PERTENCE AO ESCOPO ORIGINAL.**

**Justificativa**: `SAAS_ARCHITECTURE.md`, Seção "Tenant Model", define explicitamente os termos que compõem o modelo — Tenant, Conta, Organização, Workspace, Propriedade, Hierarquia — sem incluir "Nome" entre eles; "Conta" é definida apenas como "o registro comercial e de faturamento associado ao Tenant — quem paga, qual plano está contratado, qual é o ciclo de cobrança", sem menção a identificação nominal. `BUSINESS_PROFILE_ENGINE.md`, Capítulo 8 (Modelo de Perfil), enumera Segmento, Subsegmento, Porte, Maturidade, Capacidades, Objetivos, Canais, Preferências e Identidade (esta última como referência ao Branding Hub) — nenhum desses elementos é "Nome". `BRANDING_HUB.md` restringe seu próprio escopo a "identidade visual, comunicacional e experiencial" — nunca nome comercial. `BUSINESS_HUB_ARCHITECTURE.md` não trata de identidade de empresa. `PLATFORM_VISION_GAP_CONFIRMATION.md` já confirmou ausência de evidência implícita para este item.

---

## 2. Dados institucionais

**NÃO PERTENCE AO ESCOPO ORIGINAL.**

**Justificativa**: nenhuma das seis fontes obrigatórias menciona razão social, CNPJ, ou endereço institucional da própria Empresa em nenhum momento. `PLATFORM_VISION_GAP_CONFIRMATION.md` já confirmou ausência total de evidência, mesmo implícita.

---

## 3. Contatos

**NÃO PERTENCE AO ESCOPO ORIGINAL.**

**Justificativa**: nenhuma das seis fontes obrigatórias menciona telefone, e-mail ou endereço institucional da própria Empresa como dado de perfil, de configuração, ou de qualquer outro modelo já documentado. `PLATFORM_VISION_GAP_CONFIRMATION.md` já confirmou ausência total de evidência, mesmo implícita.

---

## 4. Configurações globais

**NÃO PERTENCE AO ESCOPO ORIGINAL.**

**Justificativa**: `SAAS_ARCHITECTURE.md` documenta configuração exclusivamente por Empresa/Tenant — Feature Flags por plano, Business Profile por empresa, Branding por empresa — sem, em nenhuma passagem, descrever um conceito de configuração de escopo global e distinto do escopo por Tenant. `PLATFORM_VISION_GAP_CONFIRMATION.md` já confirmou que o mecanismo genérico "Configuration" é agnóstico de escopo, não uma confirmação de escopo global como conceito de produto.

---

## 5. Troca de nome da empresa

**NÃO PERTENCE AO ESCOPO ORIGINAL.**

**Justificativa**: `BRANDING_HUB.md` documenta exaustivamente os elementos sob gestão do Branding Hub — Logo Manager, Color Engine, Typography Engine, Iconography Manager, Illustration Manager, Design Tokens, Brand Theme, Theme Manager, Brand Validator, Accessibility Validator — em nenhum momento mencionando o nome comercial da empresa como elemento gerido. Consistente com a ausência já registrada no item 1.

---

## Nota sobre a Pergunta Condicional

Nenhuma das cinco capacidades foi classificada como pertencente ao escopo original. Por isso, a pergunta condicional — "Caso a capacidade pertença ao escopo original: sua ausência representa A) Escopo incompleto ou B) Nova funcionalidade" — **não se aplica a nenhum dos cinco itens**, conforme a própria condição do enunciado.

---

## Conclusão

**B) As cinco capacidades NÃO pertencem ao escopo original. Sua implementação representaria aumento de escopo.**

**Estas capacidades deverão permanecer fora da versão 1.0.**

---

## Validação

✓ Nenhuma arquitetura alterada.
✓ Nenhum requisito criado.
✓ Nenhuma funcionalidade adicionada.
✓ Apenas decisão de governança, fundamentada exclusivamente nas seis fontes obrigatórias.

---

## Approval

| Campo | Valor |
|---|---|
| Status | ORIGINAL SCOPE DECISION COMPLETED |
| Version | 1.0 |
| Author | Claude |
