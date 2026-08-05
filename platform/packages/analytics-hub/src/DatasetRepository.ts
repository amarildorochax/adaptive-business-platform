import type { Dataset } from './Dataset';

/** Contrato de persistência de Dataset — apenas o contrato, per Etapa "Repository Interfaces". */
export interface DatasetRepository {
  create(dataset: Dataset): Promise<Dataset>;
  update(dataset: Dataset): Promise<Dataset>;
  get(datasetId: string): Promise<Dataset | undefined>;
  list(tenantId: string): Promise<Dataset[]>;
}
