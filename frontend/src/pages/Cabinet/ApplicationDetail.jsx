import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle,
  FileText, Upload, Download, MessageSquare, ChevronRight,
  Building2, CalendarDays, User, Send, Paperclip,
  Shield, Hash, Banknote, ClipboardList
} from 'lucide-react';

// ─── Mock ──────────────────────────────────────────────────────────────────────
const APPLICATION = {
  id: 'APP-2024-0081',
  service: 'Лизинг оборудования',
  org: 'БРК-Лизинг',
  orgColor: '#0EA5E9',
  amount: '₸8 200 000',
  status: 'docs',
  submittedAt: '21 марта 2025',
  updatedAt: '2 мая 2025',
  managerName: 'Асель Нурмагамбетова',
  managerEmail: 'a.nurmagambetova@brk.kz',
  description: 'Приобретение сельскохозяйственного оборудования (трактор John Deere 6130M) для нужд фермерского хозяйства.',
  purpose: 'Развитие производственных мощностей',
  term: '60 месяцев',
  advance: '20%',
};

const STATUS_META = {
  pending:  { label: 'На рассмотрении', color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/25',  icon: Clock },
  approved: { label: 'Одобрено',        color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/25', icon: CheckCircle2 },
  rejected: { label: 'Отклонено',       color: 'text-rose-400',    bg: 'bg-rose-400/10',    border: 'border-rose-400/25',    icon: XCircle },
  docs:     { label: 'Нужны документы', color: 'text-blue-400',    bg: 'bg-blue-400/10',    border: 'border-blue-400/25',    icon: AlertCircle },
};

const TIMELINE = [
  { date: '21 мар 2025', event: 'Заявка подана',                    done: true  },
  { date: '23 мар 2025', event: 'Заявка принята в обработку',       done: true  },
  { date: '28 мар 2025', event: 'Первичная проверка документов',    done: true  },
  { date: '2 май 2025',  event: 'Запрос дополнительных документов', done: true,  active: true },
  { date: '—',           event: 'Финансовый анализ',                done: false },
  { date: '—',           event: 'Решение кредитного комитета',      done: false },
  { date: '—',           event: 'Подписание договора',              done: false },
];

const DOCUMENTS = [
  { id: 1, name: 'Заявление на лизинг.pdf',          size: '240 KB', uploaded: true,  required: true,  date: '21 мар 2025' },
  { id: 2, name: 'Финансовая отчётность 2024.xlsx',  size: '1.2 MB', uploaded: true,  required: true,  date: '21 мар 2025' },
  { id: 3, name: 'Устав компании.pdf',               size: null,     uploaded: false, required: true,  date: null },
  { id: 4, name: 'Справка об отсутствии задолженностей.pdf', size: null, uploaded: false, required: true, date: null },
  { id: 5, name: 'Коммерческое предложение.pdf',     size: '580 KB', uploaded: true,  required: false, date: '21 мар 2025' },
];

const MESSAGES = [
  {
    id: 1, from: 'manager',
    text: 'Добрый день! Ваша заявка принята в обработку. В ближайшее время с вами свяжется наш специалист.',
    time: '23 мар, 10:14',
  },
  {
    id: 2, from: 'manager',
    text: 'Для продолжения рассмотрения заявки необходимо предоставить устав компании и справку об отсутствии задолженностей перед бюджетом.',
    time: '2 мая, 14:32',
  },
  {
    id: 3, from: 'user',
    text: 'Поняли, готовим документы. Можем предоставить до конца этой недели.',
    time: '2 мая, 15:01',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadgeLarge({ status }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border ${m.color} ${m.bg} ${m.border}`}>
      <Icon size={14} />
      {m.label}
    </span>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-primary/40" />
      </div>
      <div>
        <p className="text-xs text-primary/40">{label}</p>
        <p className="text-sm font-medium text-primary mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ApplicationDetail() {
  const { id } = useParams();
  const app = APPLICATION; // In real app: look up by id

  const [activeTab, setActiveTab] = useState('documents');
  const [message, setMessage] = useState('');

  const missingDocs = DOCUMENTS.filter(d => d.required && !d.uploaded);

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 relative">
          <Link
            to="/cabinet"
            className="inline-flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-5 transition-colors duration-150"
          >
            <ArrowLeft size={14} />
            Личный кабинет
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-white/40 font-mono text-xs">{app.id}</p>
                <StatusBadgeLarge status={app.status} />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{app.service}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: app.orgColor }} />
                <p className="text-white/50 text-sm">{app.org}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <p className="text-white/40 text-xs">Сумма заявки</p>
              <p className="text-3xl font-bold text-white">{app.amount}</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Alert for missing docs */}
      {missingDocs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1 pt-5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-start gap-3 bg-blue-500/10 border border-blue-400/25 rounded-2xl px-4 py-3.5"
          >
            <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-300">Требуется загрузка документов</p>
              <p className="text-xs text-blue-300/70 mt-0.5">
                Для продолжения рассмотрения необходимо загрузить {missingDocs.length} документ(а):{' '}
                {missingDocs.map(d => d.name).join(', ')}.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Tabs content */}
          <div className="lg:col-span-2 space-y-5">

            {/* Tabs */}
            <div className="flex gap-1 bg-surface border border-primary/8 rounded-xl p-1 w-fit">
              {[
                { key: 'documents', label: 'Документы',   icon: FileText },
                { key: 'messages',  label: 'Сообщения',   icon: MessageSquare },
                { key: 'history',   label: 'История',     icon: ClipboardList },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                      ${activeTab === tab.key
                        ? 'bg-accent text-white'
                        : 'text-primary/55 hover:text-primary'
                      }`}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {tab.key === 'messages' && (
                      <span className="w-4 h-4 rounded-full bg-accent/20 text-accent text-[10px] font-bold flex items-center justify-center">
                        {activeTab !== 'messages' ? MESSAGES.length : ''}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Documents tab */}
            {activeTab === 'documents' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-2"
              >
                {DOCUMENTS.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className={`flex items-center gap-4 bg-surface border rounded-2xl p-4
                      ${!doc.uploaded && doc.required ? 'border-blue-400/25 bg-blue-500/5' : 'border-primary/8'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${doc.uploaded ? 'bg-emerald-400/10' : 'bg-blue-400/10'}`}>
                      <FileText size={16} className={doc.uploaded ? 'text-emerald-400' : 'text-blue-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {doc.required && (
                          <span className="text-[10px] text-primary/35 font-medium uppercase tracking-wide">Обязательный</span>
                        )}
                        {doc.uploaded && doc.date && (
                          <span className="text-[10px] text-primary/30">Загружен {doc.date} • {doc.size}</span>
                        )}
                        {!doc.uploaded && (
                          <span className="text-[10px] text-blue-400">Ожидает загрузки</span>
                        )}
                      </div>
                    </div>
                    {doc.uploaded ? (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-primary/50
                        hover:bg-bg hover:text-primary transition-colors duration-150">
                        <Download size={13} />
                        Скачать
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent
                        hover:bg-accent hover:text-white text-xs font-medium transition-colors duration-150">
                        <Upload size={13} />
                        Загрузить
                      </button>
                    )}
                  </motion.div>
                ))}

                {/* Upload new */}
                <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/12
                  rounded-2xl py-4 text-sm text-primary/35 hover:border-accent/40 hover:text-accent
                  transition-colors duration-150">
                  <Paperclip size={14} />
                  Прикрепить дополнительный документ
                </button>
              </motion.div>
            )}

            {/* Messages tab */}
            {activeTab === 'messages' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-surface border border-primary/8 rounded-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-primary/8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
                      <User size={14} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{app.managerName}</p>
                      <p className="text-xs text-primary/40">Менеджер • {app.org}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                  {MESSAGES.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.2 }}
                      className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3
                        ${msg.from === 'user'
                          ? 'bg-accent text-white rounded-br-sm'
                          : 'bg-bg text-primary rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1.5 ${msg.from === 'user' ? 'text-white/50' : 'text-primary/35'}`}>
                          {msg.time}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 border-t border-primary/8 flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Напишите сообщение..."
                    className="flex-1 bg-bg border border-primary/10 rounded-xl px-4 py-2.5 text-sm text-primary
                      placeholder:text-primary/30 focus:outline-none focus:border-accent/50 transition-colors duration-150"
                  />
                  <button className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center
                    hover:bg-accent-light transition-colors duration-150 flex-shrink-0">
                    <Send size={15} className="text-white" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* History tab */}
            {activeTab === 'history' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-surface border border-primary/8 rounded-2xl p-5"
              >
                <div className="relative">
                  {TIMELINE.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="flex gap-4 pb-6 last:pb-0 relative"
                    >
                      {/* Line */}
                      {i < TIMELINE.length - 1 && (
                        <div className={`absolute left-[11px] top-6 w-0.5 h-full
                          ${step.done ? 'bg-accent/30' : 'bg-primary/8'}`}
                        />
                      )}
                      {/* Dot */}
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center relative z-10
                        ${step.active ? 'bg-accent ring-4 ring-accent/20' : step.done ? 'bg-accent/25' : 'bg-primary/8'}`}
                      >
                        {step.done && <div className={`w-2 h-2 rounded-full ${step.active ? 'bg-white' : 'bg-accent'}`} />}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={`text-sm font-medium ${step.done ? 'text-primary' : 'text-primary/35'}`}>
                          {step.event}
                        </p>
                        <p className="text-xs text-primary/35 mt-0.5">{step.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-4">

            {/* Details card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-2xl p-5 space-y-4"
            >
              <h3 className="text-sm font-bold text-primary">Детали заявки</h3>
              <InfoRow icon={Hash}         label="Номер заявки"    value={app.id} />
              <InfoRow icon={Building2}    label="Организация"     value={app.org} />
              <InfoRow icon={Banknote}     label="Сумма"           value={app.amount} />
              <InfoRow icon={CalendarDays} label="Срок лизинга"    value={app.term} />
              <InfoRow icon={Shield}       label="Авансовый платёж" value={app.advance} />
              <InfoRow icon={CalendarDays} label="Дата подачи"     value={app.submittedAt} />
              <InfoRow icon={Clock}        label="Последнее обновление" value={app.updatedAt} />
            </motion.div>

            {/* Manager */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-2xl p-5"
            >
              <h3 className="text-sm font-bold text-primary mb-3">Ответственный менеджер</h3>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center">
                  <User size={16} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{app.managerName}</p>
                  <p className="text-xs text-primary/40 mt-0.5">{app.managerEmail}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('messages')}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                  border border-primary/10 text-sm text-primary/60 hover:border-accent/40 hover:text-accent
                  transition-colors duration-150"
              >
                <MessageSquare size={14} />
                Написать менеджеру
              </button>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-2xl p-5"
            >
              <h3 className="text-sm font-bold text-primary mb-2">Описание</h3>
              <p className="text-sm text-primary/55 leading-relaxed">{app.description}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}