import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, CheckCircle2, XCircle, ChevronRight,
  Inbox, PlusCircle, Building2, CalendarDays, AlertCircle,
} from 'lucide-react';
import { useApplicationsStore } from '../../store/applicationsStore';
import Button from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';

const STATUS_META = {
  draft:      { label: 'Черновик',        color: 'text-primary/60',   bg: 'bg-primary/8',      dot: 'bg-primary/40',    icon: FileText },
  pending:    { label: 'На рассмотрении', color: 'text-yellow-500',   bg: 'bg-yellow-400/10',  dot: 'bg-yellow-400',    icon: Clock },
  submitted:  { label: 'На рассмотрении', color: 'text-yellow-500',   bg: 'bg-yellow-400/10',  dot: 'bg-yellow-400',    icon: Clock },
  approved:   { label: 'Одобрено',        color: 'text-emerald-500',  bg: 'bg-emerald-400/10', dot: 'bg-emerald-400',   icon: CheckCircle2 },
  rejected:   { label: 'Отклонено',       color: 'text-rose-500',     bg: 'bg-rose-400/10',    dot: 'bg-rose-400',      icon: XCircle },
  docs:       { label: 'Нужны документы', color: 'text-blue-500',     bg: 'bg-blue-400/10',    dot: 'bg-blue-400',      icon: AlertCircle },
};

const TABS = [
  { key: 'all',       label: 'Все' },
  { key: 'pending',   label: 'На рассмотрении' },
  { key: 'approved',  label: 'Одобрено' },
  { key: 'docs',      label: 'Нужны документы' },
  { key: 'rejected',  label: 'Отклонено' },
];

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

export default function Applications() {
  const [filter, setFilter] = useState('all');
  const { applications, loading, fetchApplications } = useApplicationsStore();
  const navigate = useNavigate();

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const filtered = useMemo(() => {
    if (filter === 'all') return applications;
    return applications.filter(a => {
      if (filter === 'pending') return ['pending', 'submitted'].includes(a.status);
      return a.status === filter;
    });
  }, [applications, filter]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Мои заявки</h1>
          <p className="text-primary/50 text-sm mt-0.5">История и статус заявок на получение услуг</p>
        </div>
        <Button onClick={() => navigate('/catalog')} className="flex items-center gap-2 hidden sm:flex">
          <PlusCircle size={15} />
          Подать заявку
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
              filter === tab.key
                ? 'bg-accent text-white'
                : 'bg-surface border border-primary/10 text-primary/60 hover:border-accent/40 hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && applications.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-primary/8 p-14 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <Inbox size={40} className="text-primary/20 mx-auto mb-3" />
          <p className="font-medium text-primary/50 mb-1">
            {applications.length === 0 ? 'Заявок пока нет' : 'Заявок в этой категории нет'}
          </p>
          <p className="text-sm text-primary/35 mb-6">
            {applications.length === 0 ? 'Откройте каталог и подайте первую заявку' : 'Попробуйте выбрать другой фильтр'}
          </p>
          {applications.length === 0 && (
            <Button onClick={() => navigate('/catalog')}>Перейти в каталог</Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((app, i) => {
              const meta = STATUS_META[app.status] ?? STATUS_META.draft;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link
                    to={`/cabinet/applications/${app.id}`}
                    className="flex items-start sm:items-center gap-4 bg-surface border border-primary/8 rounded-2xl p-4
                      hover:border-accent/30 transition-[border-color,box-shadow] duration-150 group"
                    style={{ boxShadow: 'var(--shadow-card)' }}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg}`}>
                      <Icon size={18} className={meta.color} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-primary/35">#{app.id}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm font-semibold text-primary truncate">
                        {app.service?.title ?? app.service_title ?? 'Заявка на услугу'}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {(app.service?.subsidiary || app.org) && (
                          <span className="text-xs text-primary/40 flex items-center gap-1">
                            <Building2 size={11} />
                            {app.service?.subsidiary?.name ?? app.org}
                          </span>
                        )}
                        <span className="text-xs text-primary/40 flex items-center gap-1">
                          <CalendarDays size={11} />
                          {app.created_at
                            ? new Date(app.created_at).toLocaleDateString('ru-KZ')
                            : app.date ?? '—'}
                        </span>
                      </div>
                    </div>

                    {/* Amount + arrow */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {(app.amount || app.service?.amount_max) && (
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-primary">
                            {typeof app.amount === 'string' ? app.amount
                              : app.amount != null ? `₸${Number(app.amount).toLocaleString('ru')}`
                              : app.service?.amount_max ? `до ₸${Number(app.service.amount_max).toLocaleString('ru')}`
                              : ''}
                          </p>
                        </div>
                      )}
                      <ChevronRight size={16} className="text-primary/25 group-hover:text-accent transition-colors duration-150" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
