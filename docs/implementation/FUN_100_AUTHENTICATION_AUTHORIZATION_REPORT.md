# FUN-100 — Authentication & Authorization Foundation — Relatório

**Status:** Concluída. **Natureza:** sexta Sprint funcional — nenhuma arquitetura, ADR, Manager, Repository Interface, Service, Command, Event ou Entity foi alterada. Toda autenticação reutiliza exclusivamente o módulo IAM já implementado na IMP-011 (`@abp/platform-services`).

---

## 1. Auditoria do IAM

**Correção de localização, confirmada antes de qualquer código:** não existe um pacote `packages/iam` dedicado. O IAM Core vive dentro de `platform/packages/platform-services` (`@abp/platform-services`), ao lado do Knowledge Hub e do Integration Hub — mesmo padrão "Platform Service transversal" já usado pelo AI Hub (IMP-010). O documento de arquitetura correspondente é `docs/architecture/IDENTITY_HUB.md`; o relatório de implementação original é `docs/implementation/IAM_CORE_MIGRATION_REPORT.md` (IMP-011).

**`IAMManager`** — orquestrador único, 9 métodos públicos, todos devolvendo `IAMOperationResult<T> = { result: T }` (nunca `command`/`events` — `IDENTITY_HUB.md` nunca cataloga Commands nem um Event Map próprio, mesma ausência do AI Hub e do Automation Engine): `registerCredential`, `authenticate`, `login`, `assignRole`, `grantPermission`, `authorize`, `renewSession`, `revokeSession`, `buildSecurityContext`.

**Entidades — nenhum `User` rico, nenhum `Tenant` rico:** `Identity` e `Role` são `type = string` opacos, atribuídos por quem chama; `tenantId` é sempre uma string solta, mesmo padrão já usado no resto da plataforma. `Credential` (`credentialId`/`identity`/`kind: 'Password'|'Passkey'`/`secretReference`/`createdAt`), `Profile` (a associação Identity×Tenant×Role — "um Perfil por Workspace"), `RolePermission` (o vínculo Papel→Permissão), `Session` (`sessionId`/`identity`/`tenantId`/`createdAt`/`expiresAt`/`revokedAt?`), `AccessToken` (`value`/`sessionId`/`expiresAt` — opaco, `crypto.randomUUID()`, nunca JWT), `AccessAuditRecord` (registro imutável de decisão de acesso). Seis Repository Interfaces correspondentes, todos já testados pelos 6+ arquivos de teste unitário da IMP-011.

**Achado central, decisivo para o desenho desta Sprint — nenhuma autenticação real existe hoje, por regra explícita já documentada na IMP-011:** `CredentialService.matches()` é uma comparação de igualdade simples entre dois `secretReference` opacos:
```ts
async matches(identity, kind, secretReference) {
  const candidates = (await this.repository.listByIdentity(identity)).filter(c => c.kind === kind);
  const current = candidates[candidates.length - 1];
  return current?.secretReference === secretReference;
}
```
`Credential.ts` documenta isso como deliberado: *"secretReference é sempre um valor opaco... este documento nunca implementa autenticação real, apenas o modelo e o contrato."* Nenhum hash, nenhum salt, nenhuma verificação criptográfica de Passkey, em lugar nenhum de `@abp/platform-services`. `AccessToken.value` é `crypto.randomUUID()` — nunca um JWT, nunca assinado. Não existe `RefreshToken` como conceito — renovação (`SessionService.renew`) estende `Session.expiresAt` diretamente, e só funciona sobre uma Session **ainda ativa** (`requireActive()` lança tanto para expirada quanto para revogada — nunca resgata uma Session já morta).

**Wiring — confirmado, em ambas as direções, que nada estava conectado antes desta Sprint:** `apps/api` não tinha nenhuma rota, plugin ou dependência relacionada a IAM. `apps/web`'s `buildManagers.ts` nunca construiu `IAMManager`; `routes.tsx` mantinha `/iam` apenas como `ComingSoonPage`. `docs/implementation/FUN_002_MULTI_ROUTE_APPLICATION_REPORT.md`, Seção 7, já registrava explicitamente que nenhuma rota protegida foi implementada e nenhum guard existia — não havia nada "preparado e adormecido" para reativar; esta Sprint constrói a camada de roteamento protegido do zero.

---

## 2. Inventário

| Capacidade | Status | Observação |
|---|---|---|
| Login | **Parcialmente implementado** | `IAMManager.login()` existe e orquestra autenticação + criação de Session — mas nunca foi exposto por HTTP nem consumido pelo Frontend antes desta Sprint. |
| Logout | **Parcialmente implementado** | `IAMManager.revokeSession()` existe (é o "logout"); nunca exposto por HTTP antes desta Sprint. |
| Refresh Token | **Inexistente como conceito separado** | Não há `RefreshToken`. Renovação (`renewSession`) estende a mesma Session — mecanismo real, mas nunca um fluxo de troca de token. |
| Access Token | **Parcialmente implementado** | `AccessToken` existe como Entity (`value`/`sessionId`/`expiresAt`), mas é um UUID opaco sem verificação independente — nunca um JWT real. |
| Session | **Já implementado** | Ciclo de vida completo (criação/renovação/revogação/expiração), real e testado (`SessionService`). |
| Password Hash | **Inexistente** | `CredentialService` nunca hasheia nada — compara `secretReference` opaco por igualdade. Implementado nesta Sprint na fronteira HTTP (Seção 4). |
| Password Reset | **Inexistente** | Nenhum fluxo de recuperação de senha em nenhuma camada — fora do escopo desta Sprint (não pedido nos Critérios de Aceite). |
| Roles | **Já implementado** | `Profile.role` + `PlatformRoleName` (os oito Papéis nomeados) — real, com `assignRole`/`ProfileService`. |
| Permissions | **Já implementado** | `RolePermission`/`RolePermissionService.resolvePermissions` — real, resolvido em tempo de requisição, nunca lista estática. |
| Policy | **Inexistente** | RBAC puro apenas — ABAC/Policy Engine são "médio prazo" per `IDENTITY_HUB.md`, Capítulo 19, nunca implementados na IMP-011 nem nesta Sprint. |
| User | **Inexistente como Entity rica** | `Identity` é uma string opaca — sem e-mail, nome ou perfil próprio no domínio IAM. |
| Tenant | **Inexistente como Entity rica** | `tenantId` é uma string solta em toda a plataforma, mesmo padrão desde a FUN-001. |
| MFA | **Inexistente** | Nenhum traço em nenhuma camada — "médio prazo" per o Roadmap do próprio Hub. |
| API Keys | **Inexistente** | Nenhum traço em nenhuma camada — mesmo motivo do MFA. |

---

## 3. Implementação — O Que Foi Adicionado

Reutilizando exclusivamente `IAMManager`/Services/Repository Interfaces já aprovados — nenhuma segunda linha de autenticação criada em paralelo:

1. **Persistência real do IAM** (`@abp/persistence`) — os seis Repository Interfaces do IAM Core ganharam implementação SQLite real (`repositories/iam/Sqlite*Repository.ts`), seguindo exatamente o padrão já estabelecido pela FUN-003 (nova migration `0001_iam.sql`, `createManagerRegistry` estendido com `iam: IAMManager`). Antes desta Sprint, IAM só existia como Fake em memória — o diagrama da própria Sprint ("API → IAM → SQLite") não era verdade até este ponto.
2. **Hashing de senha real** (`apps/api/src/security/passwordHashing.ts`) — na fronteira HTTP, nunca dentro do IAM (Seção 4).
3. **Seis endpoints HTTP** em `apps/api` (Seção 5) — `IAMManager` é o único ponto chamado; nenhuma rota acessa um Repository ou um Service diretamente.
4. **Camada `core/auth/`** em `apps/web` — `AuthProvider`/`useAuth`/armazenamento de sessão/renovação proativa (Seção 7).
5. **Interceptor HTTP** em `ApiClient` — anexação de token e resposta a 401 (Seção 8).
6. **Rotas protegidas** — `RequireAuth` + `/login` (Seção 9).

---

## 4. Segurança — Hashing de Senha Real (Decisão Técnica Justificada)

`CredentialService.matches()` não pode ser alterado ("nunca alterar Services") e já documenta `secretReference` como opaco. `apps/api/src/security/passwordHashing.ts` produz esse `secretReference` de forma real: `scrypt` (KDF lenta, resistente a força bruta por hardware — Node `node:crypto`, zero dependência nova, mesma disciplina "zero addon nativo" já estabelecida desde a FUN-003) sobre um salt determinístico derivado por Identity: `salt = HMAC-SHA256(identity, pepper)`, `secretReference = scrypt(password, salt).toString('hex')`.

**Por que determinístico, e não um salt aleatório por registro (o padrão bcrypt)**: `CredentialService.matches()` exige que o mesmo par (identity, senha) produza sempre o mesmo `secretReference`, para que a comparação por igualdade simples continue funcionando — um salt verdadeiramente aleatório exigiria que o chamador lesse primeiro o salt já armazenado, e nenhum método do `IAMManager` expõe isso (a única leitura pública é `authenticate`/`login`, que já recebem o `secretReference` final resolvido). Salt determinístico **por Identity** (não um salt global único reaproveitado por todos os Usuários, que permitiria uma rainbow table cruzando contas) é o melhor resultado possível dentro dessa restrição real. `pepper` é um segredo do servidor (`ABP_AUTH_PEPPER`, nunca persistido) que impede um atacante com acesso apenas ao banco de recalcular hashes.

**Limitação nomeada, não escondida:** isto não é bcrypt/argon2 com salt verdadeiramente aleatório — essa evolução exigiria um novo método em `CredentialService` (ex.: `matchesWithVerifier`), fora do escopo desta Sprint por alterar um Service já aprovado. `CredentialService.matches()`'s comparação por igualdade (`===`) também não é constant-time — outra consequência direta de não poder alterar o Service, nomeada como limitação (Seção 12).

---

## 5. Backend — Seis Endpoints HTTP

| Método | Rota | Protegida | Manager |
|---|---|---|---|
| POST | `/auth/register` | Não | `registerCredential` |
| POST | `/auth/login` | Não | `login` |
| POST | `/auth/logout` | Sim | `revokeSession` |
| POST | `/auth/refresh` | Sim | `renewSession` |
| GET | `/auth/me` | Sim | `buildSecurityContext` |
| POST | `/auth/authorize` | Sim | `authorize` |

`/auth/register` não constava na lista literal de quatro endpoints da Sprint, mas é estruturalmente necessária: sem ela, nenhuma Credential existiria para autenticar contra — `IAMManager.registerCredential` já existe exatamente para isso, reutilizado sem modificação. `/auth/authorize` foi adicionada para satisfazer a Seção AUTORIZAÇÃO ("integrar o Frontend à API" quando Roles/Permissions já existem, Seção 10) — nenhuma rota de concessão de Papel/Permissão (`assignRole`/`grantPermission`) foi exposta por HTTP: não pedida pelos Critérios de Aceite, e expô-la seria construir uma superfície de administração de IAM inteira, fora do escopo de "IAM Core Foundation".

Toda rota segue `HTTP → DTO → IAMManager → DTO → HTTP`, sem regra de negócio própria — confirmado por leitura de cada um dos 6 handlers (`routes/auth.ts`).

**Bug real encontrado e corrigido durante a auditoria, antes mesmo de escrever a primeira rota:** o `mapDomainError` já existente (FUN-004) classificaria incorretamente as mensagens reais do IAM — `"...não corresponde."` (falha de autenticação) cairia em 500; `"Session X não encontrada."` cairia em 404 (semanticamente errado para uma credencial de sessão inválida); `"Session X não está ativa..."` também cairia em 500. Corrigido com um mapeador dedicado (`errors/mapIamError.ts`), usado exclusivamente pelas rotas `/auth/*` — o `mapDomainError` compartilhado por Business Profile/Branding/CRM permanece intocado, sem risco de reclassificar uma mensagem "não encontrado" legítima de outro domínio. Todas as três mensagens viram `401 UnauthorizedError`, com mensagem sempre genérica e fixa — nunca a mensagem original (que embute a Identity literal) atravessa a fronteira HTTP, per a regra explícita "nunca facilitar enumeração de usuários".

**CORS** (`plugins/cors.ts`, `@fastify/cors`) — necessário desde esta Sprint: `apps/web`/`apps/api` são origens diferentes em desenvolvimento, e `Authorization` é um cabeçalho customizado que exige CORS explícito para o navegador expor a resposta ao JavaScript da página. Origem única e exata (`ABP_WEB_ORIGIN`), nunca `*`.

---

## 6. Estratégia de Tokens — `sessionId` como a Credencial Bearer

**Decisão técnica deliberada, o achado mais consequente desta auditoria**: nenhum método do `IAMManager` resolve um `AccessToken.value` de volta a uma Session — `renewSession`/`revokeSession`/`buildSecurityContext` recebem exclusivamente um `sessionId`, e `AccessTokenRepository` só expõe `findBySession` (session → token), nunca o inverso. A Sprint proíbe acessar Repository diretamente ("utilizar exclusivamente Managers"). Sem uma forma de ir de "token Bearer apresentado pelo cliente" a "sessionId", nenhuma rota protegida poderia funcionar usando `AccessToken.value` como credencial.

**Solução:** o próprio `Session.sessionId` (já um `crypto.randomUUID()` opaco e não adivinhável) é devolvido ao cliente como `accessToken` em `/auth/login`, e é exatamente o que o cliente apresenta em `Authorization: Bearer <sessionId>`. Criptograficamente equivalente a usar `AccessToken.value` (ambos UUIDs opacos, resolvidos apenas via consulta ao banco) — apenas colapsa uma indireção que o IAM modela mas nunca expõe de volta via HTTP. `AccessToken.value`/`expiresAt` continuam sendo gerados internamente por `SessionService.create` (efeito colateral de chamar `login()`), mas não é o valor usado como credencial HTTP nesta Sprint.

---

## 7. Estratégia de Sessão — Frontend

**Armazenamento: `sessionStorage`, nunca `localStorage`, nunca puramente em memória.** Sem um mecanismo de cookie HttpOnly (que exigiria `@fastify/cookie` + proteção CSRF, escopo maior que esta Sprint, e conflitaria com o pedido explícito de um interceptor que "anexa token" — só faz sentido para um token lido por JavaScript), a escolha real é entre `sessionStorage` e `localStorage`. `localStorage` amplia a janela de exposição a um XSS persistente (sobrevive ao fechar o navegador); armazenamento em memória pura eliminaria "Carregamento inicial da sessão" (exigência explícita da Sprint) a cada F5. `sessionStorage` é o meio-termo: limpo ao fechar a aba, mas sobrevive a um recarregamento de página. Risco residual de XSS lendo o token é o mesmo de qualquer armazenamento acessível a JavaScript — nomeado como limitação (Seção 12), com cookie HttpOnly nomeado como evolução futura (Seção 13).

**Renovação — obrigatoriamente proativa, nunca só reativa.** `SessionService.renew`/`requireActive()` lança tanto para Session expirada quanto revogada — **nunca resgata uma Session já morta**. Isso significa que um 401 reativo (responder à expiração depois que ela já aconteceu) quase nunca pode ser corrigido chamando `/auth/refresh` — a própria chamada de renovação falharia pelo mesmo motivo. `AuthProvider` agenda renovação **antes** da expiração (`REFRESH_MARGIN_MS = 5 minutos`, recalculado a cada login/renovação bem-sucedida) — o caminho primário de defesa. O interceptor reativo em `ApiClient` (Seção 8) continua existindo como rede de segurança para relógio dessincronizado ou timer de aba em segundo plano suspenso pelo navegador, nunca como o mecanismo principal.

**"Carregamento inicial da sessão"**: `AuthProvider` monta em estado `"loading"`; se `sessionStorage` tem uma sessão salva, valida contra `GET /auth/me` antes de decidir `"authenticated"` ou `"unauthenticated"` — `RequireAuth` nunca mostra `/login` prematuramente para um usuário com sessão ainda sendo validada.

---

## 8. Interceptors (`ApiClient`)

Único arquivo de `apps/web` que chama `fetch` (mantido desde a FUN-005) — agora também: anexa `Authorization: Bearer <token>` quando um Access Token está definido (`setAccessToken`); em 401 numa requisição que **já carregava** um token, chama um `unauthorizedHandler` registrado por `AuthProvider` (nunca para uma requisição sem token — ex.: senha errada em `/auth/login` é um 401 de credencial, não de sessão expirada, e nunca deve disparar renovação); em sucesso, repete a requisição original exatamente uma vez com o novo token; em falha, propaga o 401 original.

**Bug real encontrado e corrigido durante a validação dos próprios testes desta Sprint (recursão infinita):** o `unauthorizedHandler` (`AuthProvider.runRefresh`) chama `authClient.refresh()`, que passa pelo mesmo `ApiClient.request()`. Se essa chamada de `/auth/refresh` **também** devolvesse 401 — o caso comum para uma Session já de fato expirada/revogada, per a Seção 7 — o interceptor disparava a si mesmo novamente, indefinidamente. Um worker do Vitest esgotou o heap do processo (~4 GB) antes de este bug ser corrigido — não foi um teste que falhou normalmente, foi um crash do processo de teste, only reproduzível rodando a suíte completa (um único teste isolado não acumula memória suficiente para estourar). Corrigido com uma trava de reentrância (`isHandlingUnauthorized`): qualquer 401 que ocorra **durante** o próprio ciclo de renovação é tratado como falha normal, nunca dispara uma nova tentativa — coberto por teste de regressão.

---

## 9. Rotas Protegidas

`app/router/RequireAuth.tsx` envolve toda a árvore de `AppLayout`; `/login` é uma rota irmã, fora do guard. Três estados de `useAuth()`: `"loading"` → spinner de página inteira (nunca redireciona prematuramente); `"unauthenticated"` → `<Navigate to="/login" />`; `"authenticated"` → renderiza normalmente. Nenhum segundo mecanismo de proteção — este é o único guard de toda a aplicação.

`pages/login/LoginPage.tsx` — única rota fora de `AppLayout` (sem Sidebar/Topbar). Inclui também Registro, alternado no mesmo formulário — sem essa alternativa nenhum Usuário conseguiria criar a primeira conta pela UI, já que `/auth/register` existe apenas como rota HTTP.

`/iam`, antes um placeholder "Em breve" (`ComingSoonPage`) para um `IAMManager` nunca conectado, foi removido de `PLANNED_DOMAINS`/`NAV_ENTRIES` — mantê-lo seria afirmar algo falso agora que a autenticação está de fato ativa. Uma futura página de administração de Roles/Permissions (distinta do login) continua uma candidata legítima e separada (Seção 13).

`Topbar` passa a exibir a Identity/Tenant/Papéis da sessão real (via `SecurityContext.roles`, `/auth/me`) e um botão "Sair" — a única mudança visível em uma página já existente, textual/estrutural, nunca alterando layout ou lógica de negócio de nenhuma outra página.

---

## 10. Autorização — Integração Real, Sem Inventar Permissão

`core/query/useAuthorize.ts` (TanStack Query) chama `POST /auth/authorize`, habilitado apenas quando autenticado. Reflete exatamente o que já foi concedido via `assignRole`/`grantPermission` no Backend — nenhuma Permissão pré-semeada em nenhuma tabela (nenhum dado de RBAC é inventado por esta Sprint); por padrão, `permitted: false` para toda ação, exatamente o comportamento de Least Privilege que o próprio `AuthorizationService` já garante e já testa (`IAMManager.test.ts`). Validado end-to-end (Seção 11) tanto no caminho negado quanto — via teste de integração que chama `IAMManager.assignRole`/`grantPermission` diretamente, como o próprio `routes/auth.test.ts` faz — no caminho concedido.

---

## 11. Validação

```
pnpm typecheck   → 22/22 pacotes + apps, sucesso
pnpm build       → sucesso (apps/web: 392 módulos)
pnpm lint        → sucesso, zero warning
pnpm test        → 473/473 testes, 130/130 arquivos (423/122 antes desta Sprint + 50 novos: 12 em @abp/persistence, 20 em apps/api, 18 em apps/web)
```

**Validação manual — backend e frontend reais, juntos**, com `apps/api` real (`ABP_DATABASE_PATH=:memory:`, CORS configurado contra uma origem real) e chamadas HTTP genuínas (Node `fetch`, mirroring exato de `ApiClient`):

- `register` → `login` (senha errada, 401 genérico) → `login` (correta, 200) → `GET /auth/me` com e sem token (200/401) → `POST /auth/authorize` (`permitted: false`, sem concessão) → `POST /auth/refresh` (bodyless — confirma que a correção de `Content-Type` da FUN-005 também se aplica aqui) → `logout` (204) → `GET /auth/me` após logout (401, Sessão revogada) → `POST /auth/refresh` após logout (401 — confirma que uma Session já morta nunca é resgatada, Seção 7).
- `Access-Control-Allow-Origin` confirmado presente numa resposta real cross-origin.
- **Fluxo completo através da UI real, sem nenhum mock de `fetch`**: árvore React genuína (`LoginPage` → `AuthProvider` → `RequireAuth` → conteúdo protegido), apontando via `VITE_ABP_API_BASE_URL` para o `apps/api` real acima — registro pela UI, login pela UI, redirecionamento para a área protegida, Identity exibida na Topbar. Confirma Frontend → HTTP → API → IAMManager → SQLite → Resposta → Sessão autenticada → rota protegida, ponta a ponta. Teste temporário (`__e2e_auth_smoke__.test.tsx`), apagado após a validação — não faz parte da suíte permanente.

---

## 12. Limitações

- **Hashing determinístico por Identity, não bcrypt/argon2 com salt verdadeiramente aleatório** — consequência direta de `CredentialService.matches()` não poder ser alterado (Seção 4).
- **Comparação de Credential (`===`) não é constant-time** — mesma razão; um Service já aprovado não pode ganhar uma comparação criptográfica constant-time sem ser modificado.
- **`sessionId` como credencial Bearer, não o `AccessToken.value` modelado pelo IAM** — decisão forçada pela ausência de um método de resolução token→Session no `IAMManager` (Seção 6); funcionalmente seguro, mas colapsa uma indireção que o domínio modela.
- **Sem HttpOnly cookie** — o token é acessível a JavaScript por definição (Seção 7); qualquer XSS na aplicação pode ler `sessionStorage`. Mitigação real (nunca `localStorage`, nunca renovação retroativa de uma Session morta) documentada, não um risco ignorado.
- **Sem Password Reset, MFA, API Keys, OAuth/OIDC/SAML/SSO, ABAC/Policy Engine** — todos "médio/longo prazo" per o próprio Roadmap do Identity Hub (`IDENTITY_HUB.md`, Capítulo 19), nunca implementados na IMP-011 nem pedidos pelos Critérios de Aceite desta Sprint.
- **Nenhuma rota de administração de Roles/Permissions** — `assignRole`/`grantPermission` permanecem acessíveis apenas via `IAMManager` diretamente (Node/testes), nunca via HTTP — decisão de escopo (Seção 5), não uma lacuna acidental.
- **`Identity`/`Tenant` continuam strings opacas** — nenhum cadastro de Usuário/Organização rico existe em lugar nenhum da plataforma; `/auth/register` cria apenas uma Credential, nunca um perfil de usuário mais amplo.
- **Um único Tenant por login, escolhido manualmente no formulário** — sem descoberta de Tenants de uma Identity (`ProfileService.listByIdentity` existe no Service, mas não é exposto por HTTP nesta Sprint).

## 13. Próximos Passos

- Uma Sprint de administração de IAM — expor `assignRole`/`grantPermission`/`listByIdentity` por HTTP, com uma UI real de gestão de Papéis/Permissões (distinta da página `/login` desta Sprint).
- HttpOnly cookie + CSRF (`@fastify/cors` com `credentials`, `@fastify/cookie`) para eliminar completamente a exposição do token a JavaScript — a evolução mais valiosa de segurança, deliberadamente fora do escopo desta Sprint (Seção 7).
- Um método `verifyCredential` com callback em `CredentialService` (exige alterar um Service já aprovado — Sprint arquitetural), permitindo bcrypt/argon2 com salt verdadeiramente aleatório.
- Descoberta de Tenant (listar os Tenants de uma Identity após login, em vez de exigir que o usuário já saiba o `tenantId`).
- MFA, Password Reset, API Keys, OAuth/OIDC quando o próprio Roadmap do Identity Hub os priorizar.
- Aplicar `requireAuth` às rotas de domínio já existentes (Business Profile/Branding/CRM) — nenhuma delas exige sessão hoje; esta Sprint só protegeu rotas e páginas de UI, nunca os endpoints de domínio já aprovados (fora do escopo explícito: "nenhuma regra de negócio poderá ser alterada").
