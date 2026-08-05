/**
 * Query Keys do Supplier Hub — consolidadas em um único lugar para que nenhum hook precise
 * literalizar um array de chave por conta própria (risco de duplicação/divergência silenciosa
 * entre uma Query e a Mutation que deveria atualizar seu cache). Nenhum domínio já existente
 * (`crm`/`branding`/`business-profile`) centraliza suas chaves desta forma — cada hook já existente
 * inlina o array literal diretamente; esta Sprint introduz este arquivo porque IMP-204 pede
 * Query Keys "consistentes" e "nunca duplicadas" como item próprio, e o Supplier Hub, ao contrário
 * dos domínios anteriores, nasce com onze operações desde o primeiro dia — decisão documentada em
 * `IMP_204_SUPPLIER_FRONTEND_REPORT.md`.
 */
export const supplierQueryKeys = {
  list: (tenantId: string) => ["supplier", "list", tenantId] as const,
  detail: (supplierId: string) => ["supplier", "detail", supplierId] as const,
};
