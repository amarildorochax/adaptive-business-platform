/**
 * Segment — categoria principal de negócio de uma Empresa, mantida pelo Business Classifier e pelo
 * Segment Engine (`BUSINESS_PROFILE_ENGINE.md`, Capítulo 8; Ownership: `DOMAIN_OWNERSHIP_MATRIX.md`,
 * "Segment (Empresa)").
 *
 * Deliberadamente `string`, nunca uma união fechada de literais — ADR-007: "Nenhum Segmento é
 * implementado como versão de código separada... garantir que a extensibilidade de catálogo de
 * Segmentos... nunca exija alteração de componente já existente." Os dez exemplos do Capítulo 10
 * (Floricultura, Pet Shop, Clínica, Restaurante, Moda, Academia, Advocacia, Agência, E-commerce,
 * Prestação de Serviços) são ilustrativos do catálogo mantido pelo Segment Engine, nunca um enum de
 * código — mesma disciplina já aplicada a `KnowledgeAsset.category` (IMP-015).
 */
export type Segment = string;
