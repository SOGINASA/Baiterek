import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Download, FolderOpen,
  CheckCircle2, Clock, XCircle, ChevronRight,
} from 'lucide-react';
import { useApplicationsStore } from '../../store/applicationsStore';
import { SkeletonCard } from '../../components/ui/Skeleton';

const DOC_STATUS = {
  approved: { label: 'Принят',      cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Отклонён',    cls: 'bg-red-100 text-red-700',         icon: XCircle },
  pending:  { label: 'На проверке', cls: 'bg-yellow-100 text-yellow-700',   icon: Clock },
  signed:   { label: 'Подписан',    cls: 'bg-blue-100 text-blue-700',       icon: CheckCircle2 },
};

export default function Documents() {
  const { applications, loading, fetchApplications } = useApplicationsStore();
  const [dragging, setDragging] = useState(false);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const allDocs = applications.flatMap(app =>
    (app.documents ?? []).map(doc => ({
      ...doc,
      appTitle: app.service?.title ?? 'Заявка',
      appId: app.id,
    }))
  ).sort((a, b) => new Date(b.created_at ?? 0) - new Date(a.created_at ?? 0));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Документы</h1>
          <p className="text-primary/50 text-sm mt-0.5">Файлы по всем вашим заявкам</p>
        </div>
      </div>

      {/* Upload drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors duration-150 cursor-pointer ${
          dragging ? 'border-accent bg-accent/5' : 'border-primary/15 bg-surface hover:border-accent/40'
        }`}
        style={{ boxShadow: 'var(--shadow-card)' }}
        onClick={() => document.getElementById('doc-upload')?.click()}
      >
        <input id="doc-upload" type="file" className="hidden" multiple />
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
          <Upload size={22} className="text-accent" />
        </div>
        <p className="text-sm font-medium text-primary mb-1">Перетащите файлы сюда или нажмите для выбора</p>
        <p className="text-xs text-primary/40">PDF, DOC, JPG, PNG — до 10 МБ каждый</p>
      </motion.div>

      {/* Documents list */}
      {loading && applications.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : allDocs.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-primary/8 p-14 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
          <FolderOpen size={40} className="text-primary/20 mx-auto mb-3" />
          <p className="font-medium text-primary/50 mb-1">Документов пока нет</p>
          <p className="text-sm text-primary/35">Документы появятся здесь после подачи заявки</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-primary/8 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="px-5 py-3.5 border-b border-primary/8">
            <p className="text-xs font-semibold text-primary/40 uppercase tracking-wider">Все документы</p>
          </div>
          <div className="divide-y divide-primary/6">
            <AnimatePresence>
              {allDocs.map((doc, i) => {
                const s = DOC_STATUS[doc.status] ?? DOC_STATUS.pending;
                const StatusIcon = s.icon;
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-bg/50 transition-colors duration-150"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/8 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{doc.file_name ?? 'Документ'}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-primary/40 truncate">{doc.appTitle}</p>
                        {doc.file_size && (
                          <span className="text-xs text-primary/30">·</span>
                        )}
                        {doc.file_size && (
                          <p className="text-xs text-primary/30">{(doc.file_size / 1024 / 1024).toFixed(1)} МБ</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
                        <StatusIcon size={10} />
                        {s.label}
                      </span>
                      <button
                        onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}
                        className="p-1.5 rounded-lg hover:bg-bg text-primary/35 hover:text-accent transition-colors duration-150"
                      >
                        <Download size={14} />
                      </button>
                      <Link
                        to={`/cabinet/applications/${doc.appId}`}
                        className="p-1.5 rounded-lg hover:bg-bg text-primary/35 hover:text-primary transition-colors duration-150"
                      >
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
