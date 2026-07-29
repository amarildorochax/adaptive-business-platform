// CoreCommandMapper.ts
//
// Responsabilidade:
// Contrato de conversão Command do Frontend → Request do Core (sentido
// inverso de `CoreDtoMapper`). Mesma ressalva: nenhum Adapter desta
// Sprint implementa um mapper concreto.

export type CoreCommandMapper<Command, Request> = (command: Command) => Request;

/** Mapper identidade — usado apenas como placeholder até um mapper real existir para um módulo. */
export function identityCommandMapper<Command>(command: Command): Command {
  return command;
}
