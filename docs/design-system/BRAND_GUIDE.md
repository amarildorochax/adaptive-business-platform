# Adaptive Business Platform — Brand Guide

> Criado na Sprint 29 (Adaptive Platform Branding). Documenta a
> identidade visual **interna** da plataforma — o Design System que
> sustenta toda a UI da Adaptive Business Platform.
>
> **Não confundir com** [`docs/architecture/BRANDING_HUB.md`](../architecture/BRANDING_HUB.md)
> — aquele documento descreve o Branding Hub, o mecanismo de
> personalização de marca *por cliente/tenant* (Core, domínio de
> negócio). Este documento descreve a marca *da própria plataforma*
> (Design System, camada de UI). São conceitos independentes: o
> Branding Hub eventualmente consumirá tokens deste Design System como
> base técnica, mas isso é trabalho de uma Sprint futura de integração,
> não desta.

## 1. Princípios da Marca

1. **Clareza antes de estilo.** Cada cor, espaçamento e animação existe para comunicar algo (estado, hierarquia, ação) — nunca decoração pura.
2. **Consistência sobre novidade.** Um único conjunto de tokens governa toda a plataforma; nenhuma tela cria sua própria paleta ou escala.
3. **Acessível por padrão.** Todo par de cor sólida + texto é verificado contra WCAG AA antes de virar token — não depois.
4. **Movimento com propósito.** Toda animação usa os tokens de `motion` (duração/curva); nada é "exagerado", e tudo respeita `prefers-reduced-motion`.

## 2. Identidade — Logo

`Logo` (`@/design-system/foundations`) é tipográfico: um símbolo (quadrado com corte diagonal) + wordmark "Adaptive", compostos inteiramente em CSS — não depende de nenhum arquivo de imagem, seguindo a mesma decisão de "adiar assets reais" já tomada para ícones nas Sprints 26/27.

**Versões**: `light` (símbolo + wordmark em cor de texto padrão), `dark` (wordmark branco, para fundos escuros/primary), `mono` (usa `currentColor`, para contextos de uma única cor), `reduced` (apenas o símbolo, sem wordmark — para espaços pequenos, ex. cabeçalho do Dashboard).

**Área de proteção**: `LOGO_CLEAR_SPACE` = `spacing[16]` (16px) livres em qualquer direção ao redor do logo.
**Tamanho mínimo**: `LOGO_MIN_SIZE_PX` = 16px de altura do símbolo; abaixo disso, usar sempre a versão `reduced`.

## 3. Paleta Oficial

### 3.1 Escalas primitivas (`tokens/colors.ts`, inalteradas desde a Sprint 26)

7 escalas de 5 tons (100/300/500/700/900): `blue` (primary), `violet` (secondary), `green` (success), `amber` (warning), `red` (danger), `cyan` (info), `gray` (neutral/surface/texto, 11 tons).

### 3.2 Correção de acessibilidade (Sprint 29)

Medido com `contrastRatio()` (`foundations/accessibility`): **todo tom 500 falha AA (4.5:1) com texto branco** — ex. branco sobre `blue-500` = 3.68:1, branco sobre `green-500` = 2.28:1. Pior ainda no tema dark, onde `primary` é `blue-300` (claro): branco sobre `blue-300` = **1.80:1**.

**Correção**: todo fundo "sólido" (Button, Toast, Avatar com iniciais) usa o tom **700** de cada escala com texto branco — verificado em **todas** as 7 variantes, com folga (5.02:1 a 7.10:1). Essa correspondência é fixa nos dois temas (`foundations/branding/solidVariant.ts`), exposta como `--ads-color-solid-<variant>` + `--ads-color-on-solid`.

Badges e Alerts usam o par "soft" (fundo tom 100 + texto tom 700 da mesma escala) — contraste equivalente ao já verificado para texto/superfície (17:1+), mais legível para etiquetas pequenas que o par sólido.

### 3.3 Contraste texto/fundo (herdado da Sprint 26, reconfirmado)

| Par | Light | Dark |
|---|---|---|
| texto primário / fundo | 17.85:1 | 19.28:1 |
| texto secundário / fundo | 7.58:1 | 13.59:1 |
| texto primário / superfície | 17.06:1 | 17.06:1 |

Todos os pares acima **passam AAA** (>= 7:1) em ambos os temas.

## 4. Tipografia Oficial

`fontFamily.sans` (Inter/Segoe UI/system-ui) para toda a UI; `fontFamily.mono` reservado para dados/código. Escala de 5 estilos nomeados (`textStyles`): **Display** (hero/landing, raro), **Heading** (títulos de seção, `<h1>`-`<h6>` via `Heading` primitive), **Body** (texto padrão), **Caption** (metadados, legendas), **Label** (rótulos de campo, uppercase-weight). Regra de uso: nunca aplicar `fontSize`/`fontWeight` cru fora de um `textStyle` — sempre via `Text`/`Heading` (`@/app/primitives`) ou `textStyles` diretamente.

## 5. Iconografia

`IconName` (`foundations/icons`) organizado em 4 categorias (`iconCategories.ts`): **navigation** (home/menu/settings/user/chevrons — identifica destino), **action** (add/edit/delete/refresh/search/close/check — dispara uma operação), **status** (warning/info/success/error/spinner/lock — sempre acompanhado de texto, nunca sozinho), **module** (module-crm/marketing/finance/analytics/automation/dashboard — identifica visualmente um domínio de negócio). Nenhum asset SVG real ainda — `Icon` reserva espaço/rótulo acessível; a substituição por um ícone real não muda a API.

## 6. Motion Design

Tokens (`tokens/motion.ts`, inalterados): `duration` (instant/fast/120ms/normal-200ms/slow-320ms/slower-480ms), `easing` (standard/decelerate/accelerate). Projetados no DOM como `--ads-duration-*`/`--ads-easing-*` pelo `ThemeProvider` (extensão da Sprint 29) — todo CSS de animação em `branding.css` referencia essas variáveis, nunca um valor duplicado.

**Padrões nomeados** (`branding.css`): `.ads-fade-in`, `.ads-slide-up`, `.ads-slide-down`, `.ads-scale-in` (entrada de Modal/Toast/Dropdown/Alert), `.ads-spinner` (rotação contínua, Loading), `.ads-skeleton--shimmer` (Skeleton). **Hover/Focus/Pressed**: `.ads-btn:hover` (brightness), `.ads-btn:active` (scale 0.98), `.ads-focusable:focus-visible` (outline 2px `--ads-color-primary`). Todas desativadas sob `prefers-reduced-motion: reduce`.

## 7. Microinterações

Padronizadas via classes utilitárias (`branding.css`), aplicadas aos 19 componentes base + `Progress`: `.ads-btn` (Button), `.ads-input` (Input, foco visível), `.ads-card`/`.ads-card--interactive` (Card, Dropdown), `.ads-modal-overlay`/`.ads-modal` (Modal), `.ads-drawer` (Drawer), `.ads-toast` (Toast), `.ads-tooltip` (Tooltip), `.ads-list-item` (Table/Tabs/Dropdown — hover + estado ativo), `.ads-badge` (Badge).

## 8. Empty States

6 presets oficiais (`foundations/branding/emptyStatePresets.ts`), prontos para `<EmptyState {...emptyStatePresets.X} />`: `noData`, `error`, `offline`, `permissionDenied`, `noSearchResults`, `firstAccess`.

## 9. Loading States

`Loading` (spinner, `.ads-spinner`), `Skeleton` (`.ads-skeleton`, com `shimmer` opcional via `.ads-skeleton--shimmer`), `Progress` (novo componente da Sprint 29 — barra linear determinada/indeterminada, `.ads-progress-track`/`.ads-progress-fill`). "Placeholder" é a combinação de `Skeleton` com as dimensões do conteúdo real esperado — não um componente à parte.

## 10. Exemplos de Uso

```tsx
<Button variant="primary">Salvar</Button>
<Badge variant="success">Ativo</Badge>
<EmptyState {...emptyStatePresets.noSearchResults} />
<Skeleton variant="text" width="60%" />
<Progress value={72} />
```

## 11. Boas Práticas

- Sempre importar cor/espaçamento/tipografia de `@/design-system/tokens` — nunca hex/px literais em código de feature.
- Sempre usar `Button`/`Badge`/`Input`... do Design System em vez de `<button>`/`<span>` cru, mesmo em código de feature (ver `features/dashboard` como referência).
- `ComponentVariant` "solid" (Button, Avatar) sempre com texto branco; "soft" (Badge, Alert) sempre com o tom 700 da mesma escala.

## 12. Restrições

- Não introduzir uma segunda paleta, escala tipográfica ou tokens de motion em nenhuma feature.
- Não estilizar com valores mágicos onde um token equivalente já existe.
- Não remover o respeito a `prefers-reduced-motion` de nenhuma animação nova.
- Este Brand Guide rege a **plataforma**; personalização por cliente (white-label) é escopo do Branding Hub (`docs/architecture/BRANDING_HUB.md`), não deste documento.
