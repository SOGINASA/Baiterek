import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, ChevronLeft, Clock, CheckCircle2, XCircle,
  AlertCircle, Building2, CalendarDays, Download,
} from 'lucide-react';
import { useApplicationsStore } from '../../store/applicationsStore';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const STATUS_META = {
  draft:      { label: 'Черновик',        color: 'text-primary/60',  bg: 'bg-primary/8',      dot: 'bg-primary/40' },
  pending:    { label: 'На рассмотрении', color: 'text-yellow-500',  bg: 'bg-yellow-400/10',  dot: 'bg-yellow-400' },
  submitted:  { label: 'На рассмотрении', color: 'text-yellow-500',  bg: 'bg-yellow-400/10',  dot: 'bg-yellow-400' },
  approved:   { label: 'Одобрено',        color: 'text-emerald-500', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  rejected:   { label: 'Отклонено',       color: 'text-rose-500',    bg: 'bg-rose-400/10',    dot: 'bg-rose-400' },
  docs:       { label: 'Нужны документы', color: 'text-blue-500',    bg: 'bg-blue-400/10',    dot: 'bg-blue-400' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] ?? STATUS_META.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
      {m.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-primary/40 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-primary">{value || '—'}</p>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { application, loading, error, fetchApplication } = useApplicationsStore();

  useEffect(() => { if (id) fetchApplication(id); }, [id, fetchApplication]);

  if (loading && !application) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <FileText size={44} className="text-primary/20 mx-auto mb-3" />
        <h1 className="text-lg font-semibold text-primary mb-2">
          {error ? 'Ошибка загрузки' : 'Заявка не найдена'}
        </h1>
        <p className="text-primary/50 text-sm mb-6">{error ?? 'Заявка с указанным ID не существует.'}</p>
        <Button variant="outline" onClick={() => navigate('/cabinet/applications')}>
          <ChevronLeft size={15} className="mr-1" />
          К списку заявок
        </Button>
      </div>
    );
  }

  const docs = application.documents ?? [];
  const formEntries = application.form_data ? Object.entries(application.form_data) : [];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

      {/* Back */}
      <Link to="/cabinet/applications"
        className="inline-flex items-center gap-1.5 text-sm text-primary/50 hover:text-accent transition-colors duration-150">
        <ChevronLeft size={15} />
        Мои заявки
      </Link>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface rounded-2xl border border-primary/8 p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-primary/35 mb-1">#{application.id}</p>
            <h1 className="text-lg font-bold text-primary leading-snug">
              {application.service?.title ?? 'Заявка на услугу'}
            </h1>
            {application.service?.subtitle && (
              <p className="text-sm text-primary/50 mt-1">{application.service.subtitle}</p>
            )}
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InfoRow
            label="Организация"
            value={application.service?.subsidiary?.name ?? application.org ?? '—'}
          />
          <InfoRow
            label="Дата подачи"
            value={application.created_at
              ? new Date(application.created_at).toLocaleDateString('ru-KZ')
              : application.date ?? '—'}
          />
          <InfoRow
            label="Сумма"
            value={application.service?.amount_max
              ? `до ₸${Number(application.service.amount_max).toLocaleString('ru')}`
              : '—'}
          />
          <InfoRow
            label="Срок рассмотрения"
            value={application.service?.timeline ?? '—'}
          />
        </div>

        {application.status_reason && (
          <div className="mt-5 p-4 bg-amber-400/8 border border-amber-400/20 rounded-xl flex gap-3">
            <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-700 mb-0.5">Комментарий специалиста</p>
              <p className="text-sm text-amber-700/80">{application.status_reason}</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Form data */}
      {formEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="bg-surface rounded-2xl border border-primary/8 overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="px-6 py-4 border-b border-primary/8">
            <h2 className="text-sm font-semibold text-primary">Данные заявки</h2>
          </div>
          <div className="divide-y divide-primary/6">
            {formEntries.map(([key, value]) => (
              <div key={key} className="px-6 py-3.5 flex items-start justify-between gap-4">
                <p className="text-xs text-primary/40 capitalize flex-shrink-0 w-40">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-primary text-right">{value ?? '—'}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Documents */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface rounded-2xl border border-primary/8 overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-6 py-4 border-b border-primary/8">
          <h2 className="text-sm font-semibold text-primary">Документы</h2>
        </div>

        {docs.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <FileText size={32} className="text-primary/15 mx-auto mb-2" />
            <p className="text-sm text-primary/40">Документы не прикреплены</p>
          </div>
        ) : (
          <div className="divide-y divide-primary/6">
            {docs.map(doc => (
              <div key={doc.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">{doc.file_name}</p>
                  <p className="text-xs text-primary/40 mt-0.5">
                    {doc.file_type?.toUpperCase()} · {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} МБ` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    doc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-primary/8 text-primary/60'
                  }`}>
                    {doc.status === 'approved' ? 'Принят' : doc.status === 'rejected' ? 'Отклонён' : 'На проверке'}
                  </span>
                  <button
                    onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                    className="p-1.5 rounded-lg hover:bg-bg text-primary/40 hover:text-accent transition-colors duration-150"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pb-4">
        <Button variant="outline" onClick={() => navigate('/cabinet/applications')}>
          Назад
        </Button>
        {application.status === 'draft' && (
          <Button onClick={() => alert('Отправлено на рассмотрение')}>
            Отправить заявку
          </Button>
        )}
      </div>
    </div>
  );
}
