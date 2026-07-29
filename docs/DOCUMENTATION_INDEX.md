# Adaptive Business Platform
# Documentation Index

Status: Draft
Governed by: `DOCUMENTATION_CONSTITUTION.md` (Official · Version 1.1)

*This Index does not restate any rule of the Documentation Constitution. Wherever a rule is referenced below, the Constitution's own section is the binding source — this Index only applies those rules to the platform's actual documentation.*

---

## 1. Purpose

This Index is the official entry point to the documentation of the Adaptive Business Platform. It exists to answer three questions for any reader, in under a minute: *where is the document I need, can I trust it yet, and what should I read next.*

This Index holds no authority over the content of any Volume, Handbook, or Document. Authority over content belongs to the documentation hierarchy itself, as defined in the Constitution (§4). This Index's only authority is over discovery: it is the map, not the territory.

## 2. How to Use This Documentation

Before relying on any document, check its declared status (Constitution §8):

- **Frozen** or **Official** documents may be relied upon as current authority for their subject.
- **Draft** documents describe work still in motion — read them for direction, not as settled fact.
- **Deprecated** documents are historical only; do not build new work on them, and look for the document that succeeded them.

If two documents appear to disagree, do not resolve the conflict by preference or recency. Follow the Documentation Hierarchy (Constitution §4): the document belonging to the higher level governs. If the conflict persists at the same level, treat it as an open defect to be raised through Review (Constitution §13), not silently decided by the reader.

Where this Index and any other document disagree about a rule, the Constitution governs, without exception (Constitution Preamble).

## 3. Documentation System Overview

The Adaptive Business Platform maintains a single Documentation System (Constitution §4), the complete body of documentation beneath the Constitution. The Documentation System currently holds two Volumes with real content and two Volumes that have been named but not yet opened (§11).

Every term used across every Volume draws its meaning from one official Glossary (Constitution §12) — no Handbook or Document may redefine a term already established there.

## 4. Documentation Hierarchy

The Constitution (§4) defines the hierarchy in the abstract. Populated with the platform's actual content, it reads as follows:

```
Constitution                         DOCUMENTATION_CONSTITUTION.md
   │
   ▼
Documentation System                 the whole of docs/ governed by the Constitution
   │
   ▼
Volume I — Architecture Handbook
   │
   ▼
Handbook: Architecture Handbook      one coherent handbook, opened by PLATFORM_MANIFESTO.md
   │
   ▼
Document: CRM_HUB.md                 one document within that Handbook
   │
   ▼
Section: e.g. "Componentes Internos" a subdivision within that Document
```

For what each level is permitted and required to do, see Constitution §4. This diagram exists only to orient a reader against real names.

## 5. Documentation Categories

The Constitution (§5) defines four Categories. Every Document in the platform's documentation belongs to exactly one:

| Category | Answers | Representative Document |
|---|---|---|
| Business Documentation | what the platform is for and why it matters | `CRM_DOMAIN_BLUEPRINT.md` |
| Architecture Documentation | how the platform is structured | `CRM_HUB.md`, `AI_HUB.md` |
| AI Documentation | how the platform's intelligent capabilities are structured | `AGENT_FRAMEWORK.md` |
| Implementation Documentation | how the design is realized in practice | `IMPLEMENTATION_GUIDELINES.md` |

AI Documentation is not read as independent from Architecture Documentation; it is a specialized discipline within it, kept as its own Category only because of its depth (Constitution §5). When navigating by subject rather than by Volume, a reader looking for architecture should expect AI Documentation to be part of that search.

## 6. Active Volumes

| Volume | Objective | Lifecycle Stage | Version | Main Document |
|---|---|---|---|---|
| **Volume I — Architecture Handbook** | Establish the platform's structural, contractual, and domain foundation: its Hubs, their boundaries, and the rules governing how they relate. | Draft *(most Documents have individually reached Official or Frozen — see §7; the Volume as a whole cannot advance until its remaining Draft Documents are resolved, per Constitution §6)* | Not independently versioned — versioning applies at Document level (Constitution §9; see §7) | `architecture/PLATFORM_MANIFESTO.md` (Frozen) |
| **Volume II — Intelligent Agent Architecture** | Define how the platform's intelligent and autonomous capabilities are structured: their responsibilities, boundaries, and governing rules. | Draft | Not independently versioned — versioning applies at Document level (Constitution §9; see §7) | `ai/AI_MANIFESTO.md` (Frozen) |

Volumes III and IV are named but not yet opened; see §11.

## 7. Documentation Status Dashboard

### 7.1 Volume-level status (Handbook Lifecycle, Constitution §7)

| Volume | Stage |
|---|---|
| Volume I — Architecture Handbook | Draft |
| Volume II — Intelligent Agent Architecture | Draft |
| Volume III — Platform Implementation | Proposed |
| Volume IV — AI Agency | Proposed |

### 7.2 Document-level status (Document Status, Constitution §8)

**Frozen**
`PLATFORM_MANIFESTO.md` · `AI_HUB.md` · `BUSINESS_HUB_ARCHITECTURE.md` · `DOMAIN_OWNERSHIP_MATRIX.md` · `CRM_DOMAIN_BLUEPRINT.md` · `CRM_HUB.md` · `AI_MANIFESTO.md`

**Official**
`ANALYTICS_DOMAIN_BLUEPRINT.md` · `ANALYTICS_HUB.md` · `AUTOMATION_ENGINE.md` · `BRANDING_HUB.md` · `BUSINESS_PROFILE_ENGINE.md` · `COMMAND_CATALOG.md` · `COMMUNICATION_DOMAIN_BLUEPRINT.md` · `COMMUNICATION_HUB.md` · `EVENT_CATALOG.md` · `EVENT_INTERACTION_MATRIX.md` · `FINANCE_DOMAIN_BLUEPRINT.md` · `FINANCE_HUB.md` · `GROWTH_DOMAIN_BLUEPRINT.md` · `IDENTITY_HUB.md` · `INTEGRATION_HUB.md` · `KNOWLEDGE_HUB.md` · `NON_FUNCTIONAL_REQUIREMENTS.md` · `QUERY_CATALOG.md` · `SAAS_ARCHITECTURE.md` · `AI_ARCHITECTURE.md` · `AGENT_FRAMEWORK.md` · `AI_ORCHESTRATOR.md` · `CONTEXT_FRAMEWORK.md` · `AI_GOVERNANCE.md` · `AI_OBSERVABILITY.md`

**Draft**
`SYSTEM_BLUEPRINT.md` · `GROWTH_HUB.md` (architecture) · `ADR_INDEX.md` · `IMPLEMENTATION_GUIDELINES.md` · `AI_IMPLEMENTATION.md` · `01_AI_VISION.md` · `02_AI_PRINCIPLES.md` · `03_AI_ARCHITECTURE.md` · `04_AI_ORCHESTRATOR.md` · `05_AGENT_REGISTRY.md` · `06_SHARED_MEMORY.md` · `07_PLANNING_ENGINE.md` · `08_REASONING_ENGINE.md` · `09_SKILL_RUNTIME.md` · `10_TOOL_RUNTIME.md` · `11_MULTI_AGENT_SYSTEM.md` · `AI_AGENT_ECOSYSTEM.md` · `VOLUME_II_AI_HANDBOOK.md` · `VOLUME_II_CONSOLIDATION_REPORT.md` · `VOLUME_II_FOUNDATIONAL_DECISIONS.md`

The numbered series `01_AI_VISION.md` through `11_MULTI_AGENT_SYSTEM.md` is a modular structure within Volume II, distinct from the prose documents of the same subject (e.g. `03_AI_ARCHITECTURE.md` is not `AI_ARCHITECTURE.md`) — each numbered chapter organizes and references the corresponding prose document rather than replacing it; see `VOLUME_II_AI_HANDBOOK.md` for the map between the two. `AI_AGENT_ECOSYSTEM.md` is an architectural specification subordinate to `AI_MANIFESTO.md`, per `VOLUME_II_FOUNDATIONAL_DECISIONS.md`, Decision 004 — it is not, and does not claim to be, a second founding document of Volume II.

**Deprecated**
None within Volume I or Volume II at this time. Material outside both Volumes that carries no documentation authority is addressed separately in §10, not listed here — Deprecated status presumes the document once held authority (Constitution §8.4), which does not apply to material that predates the Documentation System.

## 8. Recommended Reading Paths

**New Contributors**
1. `DOCUMENTATION_CONSTITUTION.md` — the rules everything else obeys.
2. This Index.
3. `architecture/PLATFORM_MANIFESTO.md` — why Volume I exists.
4. `architecture/BUSINESS_HUB_ARCHITECTURE.md` — the pattern every Business Hub follows.
5. `architecture/CRM_DOMAIN_BLUEPRINT.md` → `architecture/CRM_HUB.md` — one Hub, read end to end, as a working example of that pattern.
6. `ai/AI_MANIFESTO.md` — why Volume II exists.

**Business**
`architecture/PLATFORM_MANIFESTO.md` → the five Domain Blueprints (`CRM_DOMAIN_BLUEPRINT.md`, `COMMUNICATION_DOMAIN_BLUEPRINT.md`, `FINANCE_DOMAIN_BLUEPRINT.md`, `GROWTH_DOMAIN_BLUEPRINT.md`, `ANALYTICS_DOMAIN_BLUEPRINT.md`) → `SAAS_ARCHITECTURE.md` for the commercial model.

**Architecture**
`architecture/PLATFORM_MANIFESTO.md` → `architecture/SYSTEM_BLUEPRINT.md` *(Draft — read as current direction, not settled map)* → `architecture/BUSINESS_HUB_ARCHITECTURE.md` → the Platform Service Hubs (`AI_HUB.md`, `IDENTITY_HUB.md`, `KNOWLEDGE_HUB.md`, `INTEGRATION_HUB.md`) → the five Domain Hub pairs → `DOMAIN_OWNERSHIP_MATRIX.md` → `COMMAND_CATALOG.md` / `EVENT_CATALOG.md` / `QUERY_CATALOG.md` / `EVENT_INTERACTION_MATRIX.md`.

**AI**
`ai/AI_MANIFESTO.md` → `ai/AI_ARCHITECTURE.md` → `ai/AI_ORCHESTRATOR.md` → `ai/AGENT_FRAMEWORK.md` → `ai/CONTEXT_FRAMEWORK.md` → `ai/AI_GOVERNANCE.md` → `ai/AI_OBSERVABILITY.md` → `ai/AI_IMPLEMENTATION.md` *(Draft — read for sequencing intent, not a completed plan)*.

A second, modular path organizes the same subject in numbered chapters, each subordinate to `AI_MANIFESTO.md` and cross-referencing the prose documents above: `ai/VOLUME_II_AI_HANDBOOK.md` (index) → `ai/01_AI_VISION.md` → `ai/02_AI_PRINCIPLES.md` → `ai/03_AI_ARCHITECTURE.md` → `ai/04_AI_ORCHESTRATOR.md` → `ai/05_AGENT_REGISTRY.md` → `ai/06_SHARED_MEMORY.md` → `ai/07_PLANNING_ENGINE.md` → `ai/08_REASONING_ENGINE.md` → `ai/09_SKILL_RUNTIME.md` → `ai/10_TOOL_RUNTIME.md` → `ai/11_MULTI_AGENT_SYSTEM.md` *(all Draft)*. `architecture/ai/AI_AGENT_ECOSYSTEM.md` *(Draft, subordinate specification)* is referenced by this series but physically located outside `docs/ai/`; see §10.

**Implementation**
`architecture/IMPLEMENTATION_GUIDELINES.md` *(Draft)* → `architecture/NON_FUNCTIONAL_REQUIREMENTS.md`. This path is thin by design: Volume III, which will hold this Category in depth, has not yet been opened (§11).

## 9. Documentation Governance

This Index does not define governance; it points to where governance is defined. The Constitution is the sole source for the following:

- **Constitution** — the supreme authority over all documentation; every Volume, Handbook, and Document answers to it (Constitution Preamble, §4).
- **Review** — the quality check a document undergoes before any status change or Change Request beyond Draft (Constitution §13).
- **Approval** — the authority decision, distinct from Review, that formally grants a status change (Constitution §14).
- **Versioning** — how a document's major and minor numbers reflect the weight of a change (Constitution §9).
- **Ownership** — every Volume, Handbook, and Document has exactly one accountable Owner (Constitution §15).

## 10. Repository Navigation

Within `docs/`, the Documentation System occupies two folders:

- **`docs/architecture/`** — Volume I, the Architecture Handbook.
- **`docs/ai/`** — Volume II, Intelligent Agent Architecture, including its founding document (`AI_MANIFESTO.md`), the prose series (`AI_ARCHITECTURE.md` through `AI_IMPLEMENTATION.md`), the modular numbered series (`01_AI_VISION.md` through `11_MULTI_AGENT_SYSTEM.md`), and the Volume's governance record (`VOLUME_II_AI_HANDBOOK.md`, `VOLUME_II_CONSOLIDATION_REPORT.md`, `VOLUME_II_FOUNDATIONAL_DECISIONS.md`).
- **`docs/architecture/ai/`** — a single Volume II document, `AI_AGENT_ECOSYSTEM.md`, physically located outside `docs/ai/` for historical reasons. It remains part of Volume II, subordinate to `AI_MANIFESTO.md` (Decision 004), despite its location; this mismatch between physical folder and Volume ownership is a known, registered inconsistency (`GATE_G1_VOLUME_II_CONSOLIDATED.md`), not an error in this Index.
- **`docs/DOCUMENTATION_CONSTITUTION.md`** — the Constitution.
- **`docs/DOCUMENTATION_INDEX.md`** — this document.

`docs/` also contains a body of product and requirements documentation (the root-level files describing platform vision, system architecture, domain model, dashboard, and ecosystem flows, together with `docs/requirements/growth/`) that predates the Documentation System and is not yet organized into a Volume. It remains internally coherent under its own conventions but is outside the scope of the Constitution until it is formally brought under a Volume.

The remaining contents of `docs/` (`docs/decisoes/`, `docs/sprint/`, and a small number of empty or stray files at the root) hold no documentation authority and are not part of the Documentation System.

## 11. Future Volumes

| Volume | Objective | Current State |
|---|---|---|
| **Volume III — Platform Implementation** | Translate the architecture established in Volume I into construction-ready standards and requirements. | Proposed. A single early document, `architecture/IMPLEMENTATION_GUIDELINES.md` (Draft), exists today but is not yet organized as its own Volume. |
| **Volume IV — Reserved (To Be Defined)** | Not yet defined beyond its name. | Proposed. No content exists. |

A Volume moves from Proposed to Draft the moment its first Handbook begins accumulating real content (Constitution §7). Neither Volume III nor Volume IV has crossed that line yet.

## 12. Maintenance

This Index must be updated in the same change that opens a new Volume, advances a Handbook to a new lifecycle stage, or changes any Document's status within Volume I or Volume II. An Index that no longer reflects the true state of §6, §7, or §11 is treated as a documentation defect, not a cosmetic gap.

This Index is itself a Document within the Documentation System and is therefore subject to the Constitution's own rules: it begins at Draft status, as every new document must (Constitution §8.1), and advances toward Official only through Review (§13) and Approval (§14). Assigning it a named Owner (Constitution §15) is the first governance action recommended following its creation.
