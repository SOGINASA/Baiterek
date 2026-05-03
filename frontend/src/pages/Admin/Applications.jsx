import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Paperclip,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const APPLICATIONS = [
  {
    id: 'APP-2847', service: 'Микрокредит для МСБ', org: 'КМФ',
    user: 'ТОО «Алтын Дала»', bin: '180340012345', contact: 'Ермек Жаксыбеков',
    phone: '+7 701 234 56 78', amount: '15 000 000 ₸',
    status: 'pending', date: '03.05.2026', updated: '03.05.2026 14:32',
    docs: 3, comments: 1,
    history: [
      { status: 'submitted',  date: '03.05.2026 09:11', note: 'Заявка подана через портал' },
      { status: 'pending',    date: '03.05.2026 10:05', note: 'Передана на рассмотрение в КМФ' },
    ],
  },
  {
    id: 'APP-2846', service: 'Гарантия по кредиту', org: 'КазГарант',
    user: 'ИП Сейткали А.', bin: '830512301234', contact: 'Айбек Сейткали',
    phone: '+7 777 345 67 89', amount: '8 500 000 ₸',
    status: 'approved', date: '03.05.2026', updated: '03.05.2026 13:40',
    docs: 7, comments: 4,
    history: [
      { status: 'submitted',  date: '01.05.2026 11:20', note: 'Заявка подана' },
      { status: 'pending',    date: '01.05.2026 12:00', note: 'На рассмотрении' },
      { status: 'approved',   date: '03.05.2026 13:40', note: 'Одобрено. Гарантийное письмо выслано.' },
    ],
  },
  {
    id: 'APP-2845', service: 'Экспортное страхование', org: 'КЭГ',
    user: 'ТОО «Global Trade»', bin: '200340056789', contact: 'Дамир Исаев',
    phone: '+7 705 456 78 90', amount: '25 000 000 ₸',
    status: 'processing', date: '02.05.2026', updated: '02.05.2026 16:18',
    docs: 5, comments: 2,
    history: [
      { status: 'submitted',  date: '02.05.2026 09:00', note: 'Заявка подана' },
      { status: 'processing', date: '02.05.2026 16:18', note: 'В обработке — запрошены дополнительные документы' },
    ],
  },
  {
    id: 'APP-2844', service: 'Лизинг оборудования', org: 'БРК-Лизинг',
    user: 'АО «ПромСтрой»', bin: '050340078901', contact: 'Алия Бекова',
    phone: '+7 747 567 89 01', amount: '120 000 000 ₸',
    status: 'approved', date: '02.05.2026', updated: '02.05.2026 15:00',
    docs: 12, comments: 6,
    history: [
      { status: 'submitted',  date: '28.04.2026 10:00', note: 'Заявка подана' },
      { status: 'pending',    date: '28.04.2026 11:00', note: 'На рассмотрении' },
      { status: 'processing', date: '30.04.2026 09:30', note: 'Юридическая проверка' },
      { status: 'approved',   date: '02.05.2026 15:00', note: 'Лизинговый договор подписан' },
    ],
  },
  {
    id: 'APP-2843', service: 'Инвестиционный заём', org: 'БРК',
    user: 'ТОО «ЭнергоПроект»', bin: '150340034567', contact: 'Нурлан Сатов',
    phone: '+7 700 678 90 12', amount: '500 000 000 ₸',
    status: 'rejected', date: '01.05.2026', updated: '01.05.2026 17:55',
    docs: 9, comments: 8,
    history: [
      { status: 'submitted',  date: '20.04.2026 09:00', note: 'Заявка подана' },
      { status: 'pending',    date: '21.04.2026 10:00', note: 'На рассмотрении' },
      { status: 'rejected',   date: '01.05.2026 17:55', note: 'Отказ: недостаточное обеспечение по займу' },
    ],
  },
  {
    id: 'APP-2842', service: 'Микрокредит для МСБ', org: 'КМФ',
    user: 'ИП Нурпеисова Д.', bin: '890623401234', contact: 'Дина Нурпеисова',
    phone: '+7 778 789 01 23', amount: '5 000 000 ₸',
    status: 'pending', date: '01.05.2026', updated: '01.05.2026 11:30',
    docs: 2, comments: 0,
    history: [
      { status: 'submitted',  date: '01.05.2026 11:00', note: 'Заявка подана' },
      { status: 'pending',    date: '01.05.2026 11:30', note: 'Ожидает рассмотрения' },
    ],
  },
];

const STATUS_CONFIG = {
  pending:    { label: 'На рассмотрении', icon: Clock,        cls: 'bg-amber-400/12 text-amber-600',   dot: 'bg-amber-400' },
  approved:   { label: 'Одобрена',        icon: CheckCircle,  cls: 'bg-emerald-500/12 text-emerald-600', dot: 'bg-emerald-500' },
  processing: { label: 'В обработке',     icon: AlertCircle,  cls: 'bg-blue-500/12 text-blue-600',     dot: 'bg-blue-500' },
  rejected:   { label: 'Отклонена',       icon: XCircle,      cls: 'bg-red-400/12 text-red-500',       dot: 'bg-red-400' },
  submitted:  { label: 'Подана',          icon: FileText,     cls: 'bg-primary/8 text-primary/60',     dot: 'bg-primary/30' },
};

const SUMMARY_STATS = [
  { status: 'pending',    value: 2 },
  { status: 'processing', value: 1 },
  { status: 'approved',   value: 2 },
  { status: 'rejected',   value: 1 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const { label, icon: Icon, cls } = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-primary/8 text-primary', icon: FileText };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  );
};

const HistoryStep = ({ step, isLast }) => {
  const { label, dot } = STATUS_CONFIG[step.status] ?? { label: step.status, dot: 'bg-primary/30' };
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${dot}`} />
        {!isLast && <div className="w-px flex-1 bg-primary/10 my-1" />}
      </div>
      <div className="pb-3">
        <p className="text-xs font-medium text-primary">{label}</p>
        <p className="text-xs text-primary/50 mt-0.5">{step.note}</p>
        <p className="text-xs text-primary/35 mt-0.5">{step.date}</p>
      </div>
    </div>
  );
};

const AppRow = ({ app }) => {
  const [expanded, setExpanded] = useState(false);
  const { dot } = STATUS_CONFIG[app.status] ?? { dot: 'bg-primary/30' };

  return (
    <>
      <tr
        className="hover:bg-bg/60 transition-colors cursor-pointer group"
        onClick={() => setExpanded(v => !v)}
      >
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            <span className="text-xs font-mono text-primary/50">{app.id}</span>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <p className="text-sm font-medium text-primary leading-snug">{app.service}</p>
          <p className="text-xs text-primary/45 mt-0.5">{app.org}</p>
        </td>
        <td className="px-4 py-3.5 hidden md:table-cell">
          <p className="text-sm text-primary">{app.user}</p>
          <p className="text-xs text-primary/40 mt-0.5">БИН/ИИН: {app.bin}</p>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <span className="text-sm font-medium text-primary">{app.amount}</span>
        </td>
        <td className="px-4 py-3.5 hidden xl:table-cell">
          <StatusBadge status={app.status} />
        </td>
        <td className="px-4 py-3.5 hidden xl:table-cell">
          <p className="text-xs text-primary/45">{app.date}</p>
        </td>
        <td className="px-4 py-3.5 hidden md:table-cell">
          <div className="flex items-center gap-2 text-xs text-primary/40">
            <span className="flex items-center gap-1"><Paperclip size={11} />{app.docs}</span>
            <span className="flex items-center gap-1"><MessageSquare size={11} />{app.comments}</span>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <ChevronRight
            size={15}
            className={`text-primary/30 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr>
          <td colSpan={8} className="px-5 pb-4 bg-bg/40">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2"
            >
              {/* Contact info */}
              <div className="bg-surface border border-primary/8 rounded-xl p-4">
                <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-3">Контакт</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User size={13} className="text-primary/40 flex-shrink-0" />
                    <span className="text-sm text-primary">{app.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary/40 w-3.5">☎</span>
                    <span className="text-sm text-primary">{app.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-primary/40 flex-shrink-0" />
                    <span className="text-sm text-primary/60">Обновлено: {app.updated}</span>
                  </div>
                </div>
              </div>

              {/* History */}
              <div className="md:col-span-2 bg-surface border border-primary/8 rounded-xl p-4">
                <p className="text-xs font-medium text-primary/40 uppercase tracking-wide mb-3">История заявки</p>
                <div>
                  {app.history.map((step, i) => (
                    <HistoryStep key={i} step={step} isLast={i === app.history.length - 1} />
                  ))}
                </div>
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminApplications() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  const filtered = useMemo(() => APPLICATIONS.filter(app => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      app.id.toLowerCase().includes(q) ||
      app.service.toLowerCase().includes(q) ||
      app.user.toLowerCase().includes(q) ||
      app.bin.includes(q);
    const matchStatus = !statusFilter || app.status === statusFilter;
    const matchOrg = !orgFilter || app.org === orgFilter;
    return matchSearch && matchStatus && matchOrg;
  }), [search, statusFilter, orgFilter]);

  const orgs = useMemo(() => [...new Set(APPLICATIONS.map(a => a.org))], []);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Заявки</h1>
          <p className="text-primary/50 text-sm mt-0.5">Мониторинг и сопровождение заявок пользователей</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 border border-primary/10 rounded-xl text-sm text-primary/60 hover:text-primary hover:bg-bg transition-colors">
          <Download size={14} />
          Экспорт
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SUMMARY_STATS.map((s, i) => {
          const { label, cls, dot } = STATUS_CONFIG[s.status];
          const active = statusFilter === s.status;
          return (
            <motion.div
              key={s.status}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setStatusFilter(active ? '' : s.status)}
              className={`bg-surface border rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                active ? 'border-accent/40 bg-accent/5' : 'border-primary/8 hover:border-primary/20'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
              <div>
                <p className="text-xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-primary/50">{label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table card */}
      <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-primary/8 bg-bg/40">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/35" />
            <input
              type="text"
              placeholder="ID, услуга, заявитель, БИН..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary placeholder:text-primary/35 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary focus:outline-none focus:border-accent/50 cursor-pointer">
              <option value="">Все статусы</option>
              {Object.entries(STATUS_CONFIG).filter(([k]) => k !== 'submitted').map(([k, v]) =>
                <option key={k} value={k}>{v.label}</option>
              )}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary focus:outline-none focus:border-accent/50 cursor-pointer">
              <option value="">Все организации</option>
              {orgs.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
          </div>
          <span className="text-xs text-primary/40 ml-auto">{filtered.length} заявок</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-primary/35 uppercase tracking-wide border-b border-primary/6">
                <th className="text-left px-5 py-3 font-medium">ID</th>
                <th className="text-left px-4 py-3 font-medium">Услуга</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Заявитель</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Сумма</th>
                <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Статус</th>
                <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Дата</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Вложения</th>
                <th className="w-8 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filtered.map(app => <AppRow key={app.id} app={app} />)}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-primary/40 text-sm">Заявки не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-primary/8 bg-bg/30">
          <span className="text-xs text-primary/40">Показано {filtered.length} из {APPLICATIONS.length}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button key={p} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${p === 1 ? 'bg-accent text-white' : 'text-primary/50 hover:bg-bg'}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}