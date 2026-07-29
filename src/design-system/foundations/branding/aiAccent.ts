// aiAccent.ts
//
// Responsabilidade:
// Acento "IA" (#8B5CF6, violet-500) — fixo e independente de tema, no
// mesmo espírito de `solidVariant.ts`: usado por elementos
// relacionados a inteligência artificial (ex.: ícone do
// `AIInsightsWidget`) para que a cor "roxo IA" seja reconhecível em
// qualquer tema, sem depender do slot `secondary` (que varia por tema).
//
// Nota de contraste: 4.42:1 contra o fundo escuro (#0B1220) — atende o
// mínimo AA (3:1) para texto grande/ícones, mas fica levemente abaixo
// de 4.5:1 para texto pequeno. Por isso, `AI_ACCENT_COLOR` deve ser
// usado apenas em ícones/acentos (tamanho >= 18px), nunca em texto
// corrido pequeno — ver Brand Guide.

import { colorPrimitives } from '../../tokens/colors';

export const AI_ACCENT_COLOR = colorPrimitives.violet[500];
