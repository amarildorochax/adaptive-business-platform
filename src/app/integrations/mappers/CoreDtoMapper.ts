// CoreDtoMapper.ts
//
// Responsabilidade:
// Contrato de conversão DTO do Core → ViewModel do Frontend. Nenhum
// Adapter desta Sprint implementa um mapper concreto (não há DTO real
// para converter ainda) — este é o formato que uma Sprint futura de
// integração real deverá seguir, garantindo que nenhuma tela consuma
// um DTO do Core diretamente.

export type CoreDtoMapper<Dto, ViewModel> = (dto: Dto) => ViewModel;

/** Mapper identidade — usado apenas como placeholder até um mapper real existir para um módulo. */
export function identityDtoMapper<Dto>(dto: Dto): Dto {
  return dto;
}
