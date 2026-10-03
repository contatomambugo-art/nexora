export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return <div className="state" role="status"><div className="spinner" /><p>{label}</p></div>;
}
