const STATUS_MAP = {
  draft:     { label: 'Черновик',       cls: 'bg-primary/10 text-primary/70' },
  submitted: { label: 'На рассмотрении', cls: 'bg-yellow-100 text-yellow-800' },
  approved:  { label: 'Одобрено',       cls: 'bg-green-100 text-green-800' },
  rejected:  { label: 'Отклонено',      cls: 'bg-red-100 text-red-800' },
  signed:    { label: 'Подписано',      cls: 'bg-blue-100 text-blue-800' },
  pending:   { label: 'Ожидает',        cls: 'bg-orange-100 text-orange-800' },
};

export function serviceStatusBadge(status) {
  const s = STATUS_MAP[status] ?? { label: status, cls: 'bg-primary/10 text-primary/70' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
