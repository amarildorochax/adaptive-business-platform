// index.ts
//
// Responsabilidade:
// Ponto único de exportação dos módulos de negócio da plataforma — agrega
// todos os submódulos de src/modules/* (academy, agenda, analytics,
// business, communication, crm, documents, fiscal, hr, marketing,
// marketplace, projects). Nenhum destes módulos possui lógica de negócio
// implementada nesta etapa — cada um é apenas o Manager/Events/Models/
// Types reservados para as próximas Sprints.

export * from './academy';
export * from './agenda';
export * from './analytics';
export * from './business';
export * from './communication';
export * from './crm';
export * from './documents';
export * from './fiscal';
export * from './hr';
export * from './marketing';
export * from './marketplace';
export * from './projects';
