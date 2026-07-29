# Shared Types Open Decisions Classification

**Adaptive Business Platform · Documento Técnico Oficial**

Status: Draft
Category: Implementation Documentation
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*Este documento classifica, sem resolver, cada uma das Open Decisions já registradas em `SHARED_TYPES_ARTIFACT_SPECIFICATION.md`, Seção "Open Decisions". Nenhuma decisão é resolvida, nenhuma arquitetura é criada ou alterada, e nenhum documento existente é modificado — apenas classificação documental, conforme o processo definido em D-018.*

---

## Open Decision: Nome de arquivo (de cada um dos três artefatos)

### Current Status
Open

### Can be resolved using current documentation?
**NO.** Nenhuma das fontes consultadas (`PACKAGE_STRUCTURE_MANIFEST.md`, `COMPONENT_03_SHARED_TYPES_DESIGN.md`, `COMPONENT_03_IMPLEMENTATION_PLAN.md`) define uma convenção de nome de arquivo para artefatos internos de um agrupamento — o Manifesto define apenas a convenção de um README por pacote (Seção 3), já satisfeita por `platform/core/README.md`, mas nenhuma convenção para os três artefatos adicionais de Shared Types.

### Resolution Category
**Documentation.** Trata-se de uma convenção de nomenclatura documental, não de uma regra de dependência ou de acoplamento entre agrupamentos (o que exigiria categoria Architecture).

### Blocking Level
**Blocking.** Nenhum dos três artefatos pode ser criado sem um nome de arquivo definido.

### Resolution Prerequisites
- Uma convenção de nomenclatura para artefatos internos de um agrupamento — ainda não documentada em nenhuma fonte.

---

## Open Decision: Localização (caminho de cada um dos três artefatos)

### Current Status
Open

### Can be resolved using current documentation?
**NO.** `platform/PACKAGE_STRUCTURE_MANIFEST.md`, Seção 3, declara apenas que os três artefatos residem conceitualmente no agrupamento Core — nenhuma fonte especifica um caminho de diretório interno.

### Resolution Category
**Documentation.** Não altera a Dependency Matrix nem nenhuma regra de acoplamento — trata-se de organização interna de arquivo dentro de um agrupamento já aprovado.

### Blocking Level
**Blocking.** Nenhum dos três artefatos pode ser criado sem uma localização definida.

### Resolution Prerequisites
- Uma convenção de estrutura de diretório interno de pacote — ainda não documentada em nenhuma fonte.

---

## Open Decision: Tecnologia

### Current Status
Open

### Can be resolved using current documentation?
**NO.** `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope", declara explicitamente que "nenhuma [tecnologia] foi autorizada até o momento neste componente."

### Resolution Category
**Technology.**

### Blocking Level
**Blocking.** Nenhuma implementação concreta é possível sem tecnologia definida.

### Resolution Prerequisites
- Uma decisão arquitetural/de produto autorizando a stack tecnológica da plataforma — ainda não tomada em nenhuma fonte consultada (mesma pendência já registrada para o mecanismo de verificação do Component 02, `DEPENDENCY_VERIFICATION_SPECIFICATION.md`, Open Decisions).

---

## Open Decision: Linguagem

### Current Status
Open

### Can be resolved using current documentation?
**NO.** Mesma base documental do item anterior — `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope": "nenhuma [linguagem] foi escolhida."

### Resolution Category
**Technology.**

### Blocking Level
**Blocking.**

### Resolution Prerequisites
- A mesma decisão de stack tecnológica listada no item "Tecnologia" acima — linguagem e tecnologia dependem da mesma decisão ainda não tomada.

---

## Open Decision: Algoritmo

### Current Status
Open

### Can be resolved using current documentation?
**NO.** Nenhuma fonte define um algoritmo para os três artefatos.

### Resolution Category
**Technology.**

### Blocking Level
**Non Blocking.** Nenhuma das fontes obrigatórias (`COMPONENT_03_SHARED_TYPES_DESIGN.md`, `COMPONENT_03_IMPLEMENTATION_PLAN.md`) descreve necessidade de um algoritmo para os três artefatos — que são definições estruturais de tipo, não mecanismos de verificação ou processamento (diferente do mecanismo de verificação de ausência de ciclo do Component 02, cujo propósito é, por definição, algorítmico). A ausência documental de qualquer menção a comportamento algorítmico para Command, Evento ou Query sustenta a classificação como não bloqueante — mas a decisão permanece formalmente "Open" na Specification até que sua aplicabilidade seja confirmada ou descartada por documento oficial.

### Resolution Prerequisites
- Esclarecimento documental sobre se um algoritmo é de fato necessário para estes artefatos — ainda não abordado por nenhuma fonte.

---

## Open Decision: Estrutura de dado concreta (campos, formato)

### Current Status
Open

### Can be resolved using current documentation?
**NO.** `COMPONENT_03_SHARED_TYPES_DESIGN.md`, Seção "Out of Scope", exclui explicitamente "definição de campo, estrutura de dado concreta, ou forma final de qualquer um dos três tipos." Nenhuma fonte consultada declara os campos concretos de Command, Evento ou Query.

### Resolution Category
**Architecture.** Definir os campos concretos de um contrato (Command/Evento/Query) é uma extensão formal da arquitetura de contrato já conceituada em `BUSINESS_HUB_ARCHITECTURE.md` — distinta de uma escolha de tecnologia ou linguagem, já que a estrutura conceitual independe de como é fisicamente implementada.

### Blocking Level
**Blocking.** Nenhum dos três artefatos pode ser considerado definido sem sua estrutura concreta.

### Resolution Prerequisites
- Uma decisão arquitetural definindo os campos mínimos de Command, Evento e Query — ainda não tomada.
- Poderia ser informada pela verificação contra os três catálogos oficiais (ver item seguinte), mas essa verificação ainda não foi realizada.

---

## Open Decision: Verificação formal contra amostra real dos três catálogos oficiais (`COMMAND_CATALOG.md`, `EVENT_CATALOG.md`, `QUERY_CATALOG.md`)

### Current Status
Open

### Can be resolved using current documentation?
**YES.** Os três catálogos já existem como documentos oficiais no repositório (`docs/architecture/COMMAND_CATALOG.md`, `EVENT_CATALOG.md`, `QUERY_CATALOG.md`), referenciados como fonte de fidelidade em `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3. A verificação consiste em comparar a forma genérica já conceituada contra amostras já catalogadas — um exercício documental, não uma decisão de arquitetura, tecnologia, ou dependência externa.

### Resolution Category
**Documentation.**

### Blocking Level
**Blocking.** `SPRINT_01_IMPLEMENTATION_BACKLOG.md`, Seção 5, item 3, exige esta verificação como Critério de Revisão do componente.

### Resolution Prerequisites
- Nenhum pré-requisito adicional — os três catálogos já estão disponíveis e completos.

---

## Summary Table

| Open Decision | Resolution Category | Blocking Level | Can be resolved now? |
|---|---|---|---|
| Nome de arquivo | Documentation | Blocking | NO |
| Localização | Documentation | Blocking | NO |
| Tecnologia | Technology | Blocking | NO |
| Linguagem | Technology | Blocking | NO |
| Algoritmo | Technology | Non Blocking | NO |
| Estrutura de dado concreta | Architecture | Blocking | NO |
| Verificação contra os catálogos oficiais | Documentation | Blocking | **YES** |

---

## Approval

| Campo | Valor |
|---|---|
| Status | OPEN DECISIONS CLASSIFIED |
| Version | 1.0 |
| Author | Claude |
