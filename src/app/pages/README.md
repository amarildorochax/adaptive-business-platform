# `pages/` — Composição de Rotas

`pages/` **não** é onde a UI é construída, nem onde regra de negócio
vive. É a camada mais fina do Frontend Foundation: cada arquivo aqui
apenas **compõe** um `layout` (de `layouts/`) com uma ou mais `features`
(de `features/<domínio>/`), ligando-os a uma rota concreta em
`router/routes.tsx`.

## O que pertence a `pages/`

- Páginas de infraestrutura de roteamento: `NotFoundPage`, `LoadingPage`.
- Futuras "Route Compositions": um componente de página que importa um
  Layout + uma ou mais Features e as arruma na tela — sem lógica
  própria além disso.

## O que **não** pertence a `pages/`

- Componentes visuais reutilizáveis → pertencem a `@/design-system`.
- Lógica de negócio, chamadas ao Core, estado de domínio → pertencem a
  `features/<domínio>/`.
- Estrutura de Shell/Header/Sidebar → pertence a `shell/` e `layouts/`.

## Regra prática

Se um arquivo em `pages/` precisar de mais do que "importar um Layout e
uma Feature e renderizá-los juntos", o excesso pertence a outra camada
— normalmente à Feature correspondente, não à página.
