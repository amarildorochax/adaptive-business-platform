# Adaptive Engineering Checklist

**Uso obrigatório antes da aprovação de qualquer Sprint de implementação.**

Status: Draft · Version: 0.1 · Category: Implementation Documentation

Forma operacional de `ADAPTIVE_DEVELOPMENT_STANDARD.md`. Este documento não explica o "porquê" — o Standard explica. Este documento é para ser lido, literalmente, item por item, antes de qualquer Sprint ser considerada concluída.

---

## Como usar

1. Antes de iniciar a Sprint — releia a seção "Antes de Começar".
2. Durante a Sprint — mantenha a seção "Durante a Implementação" visível.
3. Antes de declarar a Sprint concluída — responda **as 10 Perguntas Oficiais**, uma a uma, por escrito, no relatório da Sprint.
4. Nenhuma Sprint é aprovada com uma pergunta sem resposta ou com resposta evasiva.

---

## Antes de Começar

- [ ] O documento de arquitetura correspondente existe, em status Draft ou superior, em `docs/architecture/`?
- [ ] A etapa anterior do ciclo de 6 fases (Standard, Cap. 2) já foi concluída e validada?
- [ ] A Sprint declara explicitamente quais camadas estão congeladas ("Nenhuma alteração poderá ser feita em: ...")?
- [ ] A Auditoria Passo 1 (Standard, Cap. 3) foi executada — código, documentação e blueprint comparados, não apenas a arquitetura lida?

## Durante a Implementação

- [ ] Nenhum Manager é contornado por HTTP, Frontend ou Workspace?
- [ ] Toda referência a outro Hub é um identificador opaco `string`, nunca um tipo importado?
- [ ] Todo Command sem Evento catalogado retorna `events: []`, documentado — nenhum Evento foi inventado?
- [ ] Toda divergência encontrada foi documentada no momento do achado, nunca corrigida silenciosamente?
- [ ] Nenhuma camada esconde ou compensa uma limitação real de outra camada?
- [ ] Testes usam a técnica real da camada (Standard, Cap. 13) — mock reservado apenas para a fronteira `fetch`?

---

## As 10 Perguntas Oficiais

Responder por escrito, no relatório da Sprint, antes de considerá-la concluída:

1. **Arquitetura respeitada?** — A implementação corresponde exatamente ao documento de arquitetura vigente; nenhuma decisão de arquitetura foi tomada dentro de uma Sprint de implementação.
2. **Auditoria realizada?** — Passo 1 executado e registrado, com achados reais (mesmo que "nenhuma divergência encontrada" — declarado explicitamente, nunca omitido).
3. **Blueprint seguido?** — Supplier Hub e/ou Purchase Hub consultados como referência estrutural (Standard, Cap. 16); todo desvio do blueprint está justificado por escrito.
4. **Código duplicado?** — Nenhuma regra de negócio, Mapper, ou padrão de Hook foi reimplementado quando já existia equivalente reutilizável.
5. **Componentes reutilizados?** — Nenhum componente de UI genérico do Design System foi recriado; todo componente novo foi criado apenas porque nenhum genérico cobria o caso (Standard, Cap. 14).
6. **Limitações documentadas?** — Toda lacuna real (dado não conectado, regra não implementada, cache desatualizado) está visível via `NotConnectedNotice`/relatório, nunca escondida ou simulada.
7. **Testes completos?** — Cobertura por camada usando a técnica real correspondente (Standard, Cap. 13); nenhuma lógica de domínio ou de Workspace foi mockada.
8. **OpenAPI validada?** — Toda rota nova aparece em `/documentation/json`, testada por asserção, nunca documentada manualmente.
9. **Workspace sem acesso direto ao HTTP?** — Toda tela consome exclusivamente Hooks de `core/{domain}/`; zero import de `fetch`/`ApiClient`/Manager em `pages/{domain}/`.
10. **Documentação atualizada?** — Relatório de Sprint escrito em `docs/implementation/`, memória persistente atualizada, qualquer Amendment necessária proposta contra o documento Official/Frozen correto.

---

## Critério de Reprovação

Uma Sprint **não deve ser aprovada** se:

- Qualquer uma das 10 Perguntas Oficiais não tiver resposta por escrito.
- Uma divergência foi encontrada mas não documentada.
- Uma limitação real foi escondida, simulada, ou compensada por dado fabricado.
- Uma camada congelada pela própria Sprint foi alterada mesmo assim.
- A suíte de validação (`pnpm typecheck` / `build` / `lint` / `test`) não foi executada e confirmada antes da entrega.

---

*Referência normativa completa: `docs/standards/ADAPTIVE_DEVELOPMENT_STANDARD.md`.*
