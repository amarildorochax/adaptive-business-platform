# IAM Core Migration Report

**Adaptive Business Platform · Documento de Implementação**

Status: Approved · Sprint: IMP-011 — Identity & Access Management (IAM) Core

---

## Nota de Posicionamento Documental

Como em toda Sprint desta série, o contexto e o texto da própria Sprint divergem do estado real do repositório em pontos que precisam ser registrados antes de qualquer decisão técnica.

**O documento oficial é `IDENTITY_HUB.md`, não um "Blueprint de IAM" separado.** Nenhum arquivo `IAM_HUB.md`/`IAM_DOMAIN_BLUEPRINT.md` existe — a arquitetura de Identidade, Autenticação e Autorização da plataforma é definida integralmente por `IDENTITY_HUB.md`, que por sua vez delega o Modelo de Tenant/Usuário/Convite/Perfil a `SAAS_ARCHITECTURE.md`, Capítulos 5 e 11, explicitamente sem redefini-lo. Esta Sprint trata "IAM Core" como sinônimo do que aquele documento chama "Identity Hub", mesma disciplina de reconciliação de nome já aplicada a "Automation Hub"→Automation Engine (IMP-009).

**O pacote é `platform/packages/platform-services`, não um pacote `iam`/`identity` dedicado.** Confirmado por auditoria: `Identity.ts`, `Role.ts`, `Session.ts`, `AuthenticationResult.ts`, `AuthorizationDecision.ts`, `SecurityContext.ts` e `AccessAuditRecord.ts` já existiam neste pacote desde a IMP-001, ao lado de contratos de Knowledge/Connector/Webhook — o mesmo padrão "Platform Service transversal" já observado para o AI Hub (IMP-010) em `platform/packages/ai`. Nenhum pacote novo foi criado; esta Sprint estende o já existente.

**Os contratos já existentes são deliberadamente opacos, e essa opacidade foi preservada, nunca invertida.** `Identity.ts` já declarava `export type Identity = string` — não uma Entidade rica, mas um identificador opaco, o mesmo padrão de referência cross-Hub já usado em toda Sprint anterior (`Trigger.sourceDescription`, `AnalyticsEventIngestion.sourceHub`). Da mesma forma, `Role.ts` já declarava `export type Role = string`, nunca um catálogo fechado. Esta Sprint nunca alterou nenhum dos dois tipos — em vez disso, criou `PlatformRoleName.ts` como um catálogo **adicional**, referenciado pelo RBAC Engine, preservando `Role` exatamente como já aprovado.

**`IDENTITY_HUB.md` nunca cataloga Commands, e trata "Eventos de identidade" apenas como publicados no Event Map genérico já descrito em `SYSTEM_BLUEPRINT.md`, nunca um catálogo próprio deste Hub.** Confirmado por leitura integral (22 capítulos) — mesma ausência já registrada para o Automation Engine (IMP-009) e para o AI Hub (IMP-010), sem sequer um `AuditRecord`-equivalente pronto (diferente do Automation Engine) — mas com `AccessAuditRecord` já existente desde a IMP-001, cumprindo, para este Hub, exatamente esse papel.

**Legado real, mas nunca implementado, foi encontrado em `src/app/integrations/types/`.** `Identity.ts` (`id`/`displayName`/`email?`), `AccessToken.ts`/`RefreshToken.ts` (`value`/`expiresAt`), `Session.ts` e `UserContext.ts` — todos explicitamente "preparação arquitetural... nenhuma autenticação real ocorre... nenhuma Sprint atual popula este contrato com dado real". Mesmo tratamento já dado a `AgentPermission.ts` (`src/core/catalog/`): um contrato reservado, nunca um Manager ou Service real por trás dele — precedente de forma de campo, nunca de lógica a portar.

---

## Resumo Executivo

Esta Sprint estendeu `platform/packages/platform-services` com o IAM Core já definido em `IDENTITY_HUB.md` — a espinha dorsal de curto prazo explicitamente priorizada pelo próprio Roadmap (Capítulo 19): "o Identity Manager, o Authentication Manager com suporte a Senha e Passkey, o RBAC Engine operando de ponta a ponta sobre os oito Papéis já definidos em `SAAS_ARCHITECTURE.md`, e o Session Manager com criação, renovação e revogação funcionais". Quatro Entidades novas (`Credential`, `Profile`, `RolePermission`, `AccessToken`) foram adicionadas ao lado das oito já existentes desde a IMP-001 (`Identity`, `Role`, `Permission`, `Session`, `AuthenticationResult`, `AuthorizationDecision`, `SecurityContext`, `AccessAuditRecord`), nenhuma delas alterada. `pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos), com 21 testes novos (185 no total).

---

## Inventário e Classificação

| Conceito | Origem | Classificação | Evidência |
|---|---|---|---|
| `Identity`/`Role`/`Permission`/`Session`/`AuthenticationResult`/`AuthorizationDecision`/`SecurityContext`/`AccessAuditRecord` | `platform/packages/platform-services/*` | Já existente, Frozen em espírito | Confirmado por leitura integral de cada arquivo — todos citam `IDENTITY_CONCRETE_STRUCTURE.md` como fonte; nenhum alterado por esta Sprint |
| `src/core/{identity,iam,auth,authentication,authorization,access,permission,role,policy,user,session,token,credential}*` | — | **Inexistente** | Nenhum dos treze diretórios/prefixos sugeridos pela auditoria existe em `src/core/` |
| `Identity`/`AccessToken`/`RefreshToken`/`Session`/`UserContext` | `src/app/integrations/types/` | Nunca implementado, mesmo no legado | "preparação arquitetural... nenhuma autenticação real ocorre... nenhuma Sprint atual popula este contrato com dado real" (doc-comment do próprio legado); precedente de forma de campo (`value`/`expiresAt`), nunca de lógica |
| `AgentPermission` | `src/core/catalog/AgentPermission.ts` | Falso cognato/placeholder — não portado | "identidade ainda não modelada nesta plataforma... nenhum componente cria, lê, ou aplica" — reserva para IA, não para IAM geral |
| `WidgetPermission` | `src/app/features/dashboard/controllers/permissions/` | Fora de escopo, não inspecionado em profundidade | Concern estreito de UI de Dashboard, não modelo de Permissão geral da plataforma |
| Os oito Papéis (Owner, Administrador, Gerente, Financeiro, Marketing, Operador, Atendimento, Convidado) | `SAAS_ARCHITECTURE.md`, Capítulo 11 | Já aprovado, catalogado nesta Sprint | Confirmado por leitura direta daquele capítulo — hierarquia Owner → Administrador → (Gerente, Financeiro, Marketing) → (Operador, Atendimento) → Convidado, reproduzida em `PlatformRoleName.ts`, um tipo aditivo, nunca uma alteração de `Role.ts` |
| Commands do Identity Hub | — | **Inexistente, confirmado no próprio Blueprint** | Nenhum capítulo equivalente a "Comandos" existe em `IDENTITY_HUB.md` (22 capítulos) |
| Events do Identity Hub | — | **Delegado ao Event Map genérico, nunca um catálogo próprio** | Capítulo 16: "Eventos de identidade... são publicados no Event Bus já descrito em `SYSTEM_BLUEPRINT.md`" |
| ABAC Engine, Policy Engine, Trust Engine, Device Manager, MFA, OAuth/OIDC/SAML/SSO Manager, API Key/Service Account Manager, Identity Federation, Identity Cache | `IDENTITY_HUB.md`, Capítulo 7 | Adiado — "médio/longo prazo" no próprio Roadmap | Capítulo 19: "médio prazo... a integração federada completa através de OAuth, OIDC e SAML, o Trust Engine... o ABAC Engine e o Policy Engine... o MFA Manager plenamente integrado" |
| CRM/Communication/Content/Growth/Commerce/Finance/Analytics/Automation/AI Hub | `@abp/crm-hub` e demais | Nunca acessado, nem por referência de tipo | `Profile.tenantId`/`Session.tenantId` são sempre `string` opacos — nenhum tipo de nenhum outro Hub é importado por nenhum arquivo desta Sprint |

---

## Componentes Criados

**Entidades**: `Credential.ts` (`CredentialKind`: `Password`/`Passkey` — apenas os dois mecanismos de curto prazo), `Profile.ts` (a "instância concreta de um Usuário dentro de um Workspace específico, associada a um Papel nomeado", nomeado com o vocabulário literal do Blueprint, nunca "TenantMembership" per o texto de exemplo desta própria Sprint), `RolePermission.ts` (o vínculo Papel→Permissão que materializa "Papel é o agrupamento reutilizável de Permissões"), `AccessToken.ts` (adaptado, no formato de campo, do placeholder legado nunca implementado). `PlatformRoleName.ts` — tipo aditivo, catálogo dos oito Papéis já nomeados, nunca uma alteração de `Role.ts`.

**Repositórios** (contratos apenas): `CredentialRepository` (sem `update` — uma troca de credencial é sempre uma nova `Credential`), `ProfileRepository` (`update` apenas para "Troca de função"), `RolePermissionRepository`, `SessionRepository` (`update` para renovação/revogação, nunca para alterar `identity`/`tenantId`), `AccessTokenRepository` (sem `update`), `AccessAuditRecordRepository` (sem `update`/`remove` — registro imutável, ADR-007).

**Serviços**: `CredentialService` (`matches()` nunca decodifica nem valida segredo real — apenas confere referência opaca), `ProfileService` (RBAC — associação Identity↔Tenant↔Role), `RolePermissionService` (resolve Permissão a partir de Papel), `AuthenticationService` (Senha/Passkey, nunca decide Permissão — Authentication Before Authorization, ADR-006), `SessionService` (criação exige `AuthenticationResult` já confirmado; renovação; revogação; `isActive()`), `AuthorizationService` (RBAC apenas — nega por padrão quando não há Perfil, Least Privilege), `AccessAuditService`, `SecurityContextService` (exige Session ativa, Zero Trust).

**Orquestrador**: `IAMManager.ts` — expõe `registerCredential`, `authenticate`, `login` (autentica e cria Session em uma única operação), `assignRole`, `grantPermission`, `authorize` (sempre produz um `AccessAuditRecord`, concedido ou negado, sem exceção — ADR-007), `renewSession`, `revokeSession`, `buildSecurityContext`.

## Componentes Reutilizados

As oito Entidades já existentes desde a IMP-001 foram reutilizadas integralmente, sem nenhuma alteração de forma — nenhuma foi estendida, nenhuma foi redefinida. Isso é distinto de toda Sprint anterior desta série, nenhuma das quais encontrou um conjunto de contratos já tão adequado ao escopo de uma única Sprint quanto este. O padrão de tipo opaco (`Identity`/`Role` como `string`) já demonstrado por este pacote confirma, de forma independente, a mesma disciplina de referência opaca já aplicada por toda Sprint anterior a cada referência cross-Hub.

`IAMOperationResult<T> = {result}` — sem `command`, sem `events` — replica exatamente a forma mais simples já estabelecida pelo AI Hub (IMP-010), pela mesma razão: nenhum catálogo formal de Command ou Event existe para este Hub em nenhum documento consultado.

## Componentes Ausentes

ABAC Engine e Policy Engine (Permissão contextual e regra declarativa — Capítulo 10), Trust Engine e Device Manager (confiança contínua — Capítulo 11), MFA Manager, OAuth Manager, OIDC Manager, SAML Manager, SSO Manager (autenticação federada — Capítulo 9), API Key Manager e Service Account Manager (identidade não humana — Capítulo 7), Identity Federation, Identity Cache, Identity Recovery, Consent Manager, Security Event Manager, Identity Analytics, Identity History, Identity Versioning, Team Manager, Organization Manager, Invitation Manager — todos já descritos em `IDENTITY_HUB.md`, Capítulo 7, nenhum implementado nesta Sprint. Todos correspondem a capacidades explicitamente "médio/longo prazo" per o Roadmap (Capítulo 19), ou dependem de um Modelo de Tenant/Convite (`SAAS_ARCHITECTURE.md`) fora do escopo desta Sprint de IAM propriamente dito.

---

## Lacunas Arquiteturais

**Nenhum Command foi ou pôde ser portado — `IDENTITY_HUB.md` nunca os catalogou, para nenhuma operação.** Mesma ausência já confirmada para o Automation Engine (IMP-009) e para o AI Hub (IMP-010).

**Nenhum mecanismo de autenticação real existe, nem pode existir por regra explícita desta Sprint.** `CredentialService.matches()` compara uma `secretReference` opaca contra outra — nunca hash de senha real, nunca verificação criptográfica de Passkey. Isso é fiel à regra "nunca implementar autenticação real" desta Sprint, mas significa que `Credential`/`AuthenticationService`, tal como implementados, são o contrato e o fluxo, nunca a segurança criptográfica real que uma implementação de produção exigiria — a mesma disciplina de "MockAIProvider, zero chamada real" já aplicada ao AI Hub, aplicada aqui à autenticação.

**`SecurityContext.roles` é sempre, no máximo, um único elemento nesta Sprint.** O campo já aprovado é `readonly Role[]` (plural, array) — preservado sem alteração —, mas "cada Perfil associado a exatamente um Workspace" (Capítulo 8) significa que, para o par Identity/Tenant resolvido por uma Session, nunca há mais de um Papel simultâneo nesta Sprint. Um array de múltiplos Papéis simultâneos exigiria um modelo de Perfil mais rico (Papéis compostos, ou Equipes com Papel próprio, Capítulo 12) — fora do escopo do RBAC de curto prazo.

**Nenhuma Session carrega referência a Dispositivo.** `Session.ts`, já aprovado desde a IMP-001, nunca declarou um campo `deviceId` — confirmando, de forma independente, que Device Manager/Trust Engine (médio prazo) não eram esperados nesta fase; esta Sprint não adicionou esse campo, preservando a Entidade já aprovada sem alteração.

---

## Abstrações de Autenticação Preservadas

Senha e Passkey — os dois mecanismos de curto prazo — são modelados como `CredentialKind`, cada um administrado de forma equivalente por `CredentialService`, nunca por lógica genérica incapaz de distinguir suas particularidades (`IDENTITY_HUB.md`, Capítulo 8: "cada uma administrada pelo componente específico... nunca por uma lógica genérica única"). Magic Link, OAuth, OIDC, SAML e MFA permanecem explicitamente fora do escopo desta Sprint, catalogados no Blueprint (Capítulo 9) mas nunca antecipados aqui — nenhum tipo, nenhuma classe, nenhum stub foi criado para nenhum dos cinco. `AccessToken.value` é sempre um identificador opaco gerado localmente (`crypto.randomUUID()`) — nunca um JWT real, nunca uma implementação de protocolo de token. Nenhuma integração real com provedor externo de identidade (Google, Microsoft, LDAP corporativo) existe ou foi antecipada.

---

## Resultados da Validação

`pnpm typecheck`, `pnpm build`, `pnpm lint` e `pnpm test` completam sem erro em todo o workspace (18 projetos). 185 testes no total (164 antes desta Sprint, 21 novos): `CredentialService.test.ts` (nunca confunde Credential de tipos ou de Identity diferentes), `ProfileService.test.ts` (um Perfil por Workspace, Troca de função sem duplicação), `SessionService.test.ts` (ciclo de vida completo, incluindo a correção de um teste inicialmente incorreto sobre janela de renovação), `AuthorizationService.test.ts` (RBAC, Least Privilege — nega por padrão) e `IAMManager.test.ts` (seis cenários, cobrindo Authentication Before Authorization, Auditable Everything sem exceção, Tenant Isolation, e revogação imediata de Session).

Uma correção real foi necessária durante a validação: `CredentialService.matches()` originalmente ordenava candidatos por `createdAt`, cuja resolução de milissegundo não garantia desempate correto entre duas Credential registradas em sequência rápida (o cenário exato de um teste desta própria Sprint); corrigido para usar a ordem de inserção já garantida pelo Repository, nunca uma reordenação por timestamp — a causa raiz real, não um ajuste para fazer o teste passar artificialmente.

---

## Conclusão

Esta foi a Sprint com o conjunto de contratos pré-existentes mais precisamente alinhado ao escopo de curto prazo já definido pelo próprio Blueprint de toda a série — as oito Entidades já aprovadas desde a IMP-001 (`Identity`, `Role`, `Permission`, `Session`, `AuthenticationResult`, `AuthorizationDecision`, `SecurityContext`, `AccessAuditRecord`) cobriam, quase inteiramente, exatamente o que `IDENTITY_HUB.md`, Capítulo 19, já havia priorizado como "curto prazo" antes mesmo de qualquer código ser escrito. A disciplina desta Sprint foi, portanto, menos sobre inventar e mais sobre reconhecer: preservar a opacidade já deliberada de `Identity`/`Role` como `string`, nunca inflá-los em Entidades ricas; nomear `Profile`, não "TenantMembership", porque o Blueprint já havia escolhido esse termo; e nunca implementar autenticação real, mesmo tendo encontrado, no legado, um precedente de forma de campo que tornaria tentador simular mais do que a regra desta Sprint permite. O IAM Core agora sabe autenticar por Senha ou Passkey, resolver Permissão por Papel, administrar o ciclo de vida de uma Sessão, e auditar toda decisão de acesso sem exceção — exatamente o alicerce de confiança que todo Hub anterior desta série já presumia existir, e que, a partir desta Sprint, finalmente existe.
