// Client.ts
//
// Responsabilidade:
// Contrato de "Cliente" do CRM — também a entidade usada para a visão
// de "Contatos" (ESCOPO da Sprint 32 lista os dois como subdivisões
// separadas, mas não detalha campos próprios para "Contato"). Decisão
// de modelagem: um único `Client` cobre ambos os papéis, diferenciados
// pelo campo `status` ('lead'/'prospect'/'customer'/'inactive') — o
// mesmo padrão usado por CRMs de referência (contato é a entidade
// base; "ser cliente" é apenas um status). Evita duplicar campos
// (telefone/e-mail/cargo/empresa) em duas entidades quase idênticas
// sem necessidade real.

export type ClientStatus = 'lead' | 'prospect' | 'customer' | 'inactive';

export interface Client {
  id: string;
  name: string;
  companyId: string | null;
  role: string;
  phone: string;
  whatsapp: string;
  email: string;
  source: string;
  salesOwnerName: string;
  status: ClientStatus;
  tagIds: string[];
  createdAt: string;
}
