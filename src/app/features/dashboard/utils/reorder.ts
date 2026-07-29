// reorder.ts
//
// Responsabilidade:
// Move um item de uma posição a outra em um array, sem mutar o array
// original — usado pela reordenação manual (setas) do `DashboardGrid`.

export function moveItem<Item>(items: Item[], fromIndex: number, toIndex: number): Item[] {
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}
