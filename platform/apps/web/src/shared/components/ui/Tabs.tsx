export interface TabItem {
  readonly id: string;
  readonly label: string;
}

export interface TabsProps {
  readonly items: readonly TabItem[];
  readonly activeId: string;
  readonly onChange: (id: string) => void;
  readonly label: string;
}

/** Navegação por abas — controlada pelo pai (nenhum estado próprio), acessível via `role="tablist"`/teclado nativo do navegador. */
export function Tabs({ items, activeId, onChange, label }: TabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item) => (
        <button key={item.id} type="button" role="tab" aria-selected={item.id === activeId} className="tabs__tab" onClick={() => onChange(item.id)}>
          {item.label}
        </button>
      ))}
    </div>
  );
}
