import Badge from '../ui/Badge';

const STATUS_MAP = {
  pending:    { label: 'На рассмотрении', variant: 'warning' },
  approved:   { label: 'Одобрено',        variant: 'success' },
  rejected:   { label: 'Отклонено',       variant: 'error'   },
  processing: { label: 'В обработке',     variant: 'default' },
  completed:  { label: 'Завершено',       variant: 'muted'   },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_MAP[status] ?? { label: status, variant: 'muted' };
  return <Badge variant={config.variant} size={size}>{config.label}</Badge>;
}
