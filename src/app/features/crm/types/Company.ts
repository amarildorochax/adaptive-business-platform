// Company.ts
//
// Responsabilidade:
// Contrato de "Empresa" do CRM. 100% mock nesta Sprint — quando o CRM
// for conectado ao Core (Sprint futura, via `CrmAdapter`, sem alterá-lo
// agora), este é o shape de ViewModel que o mapper deverá produzir.

import type { CrmRecordStatus } from './common';

export type CompanySize = 'micro' | 'pequena' | 'media' | 'grande';

export interface Company {
  id: string;
  name: string;
  tradeName: string;
  cnpj: string;
  segment: string;
  size: CompanySize;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  ownerName: string;
  status: CrmRecordStatus;
  createdAt: string;
}
