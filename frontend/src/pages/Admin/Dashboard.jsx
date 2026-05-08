import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart2,
  Layers,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const STATS = [
  {
    id: 'applications',
    label: 'Всего заявок',
    value: '3 847',
    change: '+12.4%',
    positive: true,
    icon: FileText,
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    id: 'users',
    label: 'Пользователей',
    value: '14 291',
    change: '+8.1%',
    positive: true,
    icon: Users,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    id: 'approved',
    label: 'Одобрено',
    value: '2 104',
    change: '+5.3%',
    positive: true,
    icon: CheckCircle,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    id: 'rejected',
    label: 'Отклонено',
    value: '318',
    change: '-2.1%',
    positive: false,
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
];

const RECENT_APPLICATIONS = [
  { id: 'APP-2847', service: 'Микрокредит для МСБ', org: 'КМФ', user: 'ТОО «Алтын Дала»', status: 'pending', date: '03.05.2026' },
  { id: 'APP-2846', service: 'Гарантия по кредиту', org: 'КазГарант', user: 'ИП Сейткали А.', status: 'approved', date: '03.05.2026' },
  { id: 'APP-2845', service: 'Экспортное страхование', org: 'КазЭкспортГарант', user: 'ТОО «Global Trade»', status: 'processing', date: '02.05.2026' },
  { id: 'APP-2844', service: 'Лизинг оборудования', org: 'БРК-Лизинг', user: 'АО «ПромСтрой»', status: 'approved', date: '02.05.2026' },
  { id: 'APP-2843', service: 'Инвестиционный заём', org: 'БРК', user: 'ТОО «ЭнергоПроект»', status: 'rejected', date: '01.05.2026' },
  { id: 'APP-2842', service: 'Микрокредит для МСБ', org: 'КМФ', user: 'ИП Нурпеисова Д.', status: 'pending', date: '01.05.2026' },
];

const STATUS_BY_ORG = [
  { org: 'КМФ', total: 1240, approved: 880, pending: 290, rejected: 70 },
  { org: 'БРК', total: 640, approved: 410, pending: 160, rejected: 70 },
  { org: 'КазГарант', total: 920, approved: 630, pending: 220, rejected: 70 },
  { org: 'БРК-Лизинг', total: 580, approved: 380, pending: 150, rejected: 50 },
  { org: 'КЭГ', total: 467, approved: 290, pending: 130, rejected: 47 },
];

const ACTIVITY_FEED = [
  { time: '14:32', text: 'Новый пользователь зарегистрирован', type: 'user' },
  { time: '14:18', text: 'Заявка APP-2847 отправлена на рассмотрение', type: 'app' },
  { time: '13:55', text: 'Контент «База знаний» обновлён', type: 'content' },
  { time: '13:40', text: 'Заявка APP-2846 одобрена', type: 'approved' },
  { time: '13:12', text: 'Новая услуга опубликована: Лизинг 2.0', type: 'service' },
  { time: '12:50', text: 'Заявка APP-2843 отклонена', type: 'rejected' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    pending:    { label: 'На рассмотрении', cls: 'bg-amber-400/15 text-amber-600' },
    approved:   { label: 'Одобрена',        cls: 'bg-emerald-500/15 text-emerald-600' },
    processing: { label: 'В обработке',     cls: 'bg-blue-500/15 text-blue-600' },
    rejected:   { label: 'Отклонена',       cls: 'bg-red-400/15 text-red-500' },
  };
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-primary/10 text-primary' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
};

const ActivityDot = ({ type }) => {
  const map = {
    user:     'bg-blue-500',
    app:      'bg-amber-400',
    content:  'bg-purple-500',
    approved: 'bg-emerald-500',
    service:  'bg-accent',
    rejected: 'bg-red-400',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${map[type] ?? 'bg-primary/30'}`} />;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const maxTotal = useMemo(() => Math.max(...STATUS_BY_ORG.map(r => r.total)), []);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Дашборд</h1>
          <p className="text-primary/50 text-sm mt-0.5">Обзор активности портала · 3 мая 2026</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Система работает штатно
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.bg}`}>
                  <Icon size={18} className={s.color} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${s.positive ? 'text-emerald-500' : 'text-red-400'}`}>
                  {s.positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {s.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs text-primary/50 mt-0.5">{s.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent applications */}
        <div className="lg:col-span-2 bg-surface border border-primary/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-primary/8">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-primary/50" />
              <span className="text-sm font-semibold text-primary">Последние заявки</span>
            </div>
            <button className="text-xs text-accent hover:text-accent-light transition-colors">Все заявки →</button>
          </div>
          <div className="divide-y divide-primary/6">
            {RECENT_APPLICATIONS.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.04 }}
                className="flex items-center gap-3 px-5 py-3 hover:bg-bg transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-primary/40">{app.id}</span>
                    <span className="text-xs text-primary/30">·</span>
                    <span className="text-xs text-primary/50">{app.org}</span>
                  </div>
                  <p className="text-sm font-medium text-primary truncate">{app.service}</p>
                  <p className="text-xs text-primary/50 truncate">{app.user}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <StatusBadge status={app.status} />
                  <span className="text-xs text-primary/35">{app.date}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-primary/8">
            <Activity size={16} className="text-primary/50" />
            <span className="text-sm font-semibold text-primary">Активность</span>
          </div>
          <div className="p-5 space-y-3">
            {ACTIVITY_FEED.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="flex gap-3"
              >
                <ActivityDot type={item.type} />
                <div>
                  <p className="text-xs text-primary leading-snug">{item.text}</p>
                  <p className="text-xs text-primary/35 mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* By org bar chart */}
      <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-primary/8">
          <Layers size={16} className="text-primary/50" />
          <span className="text-sm font-semibold text-primary">Заявки по организациям</span>
        </div>
        <div className="p-5 space-y-4">
          {STATUS_BY_ORG.map((row, i) => (
            <motion.div
              key={row.org}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-primary">{row.org}</span>
                <span className="text-xs text-primary/50">{row.total.toLocaleString()} заявок</span>
              </div>
              <div className="h-5 bg-bg rounded-lg overflow-hidden flex" style={{ width: `${(row.total / maxTotal) * 100}%` }}>
                <div className="bg-emerald-500/70 h-full" style={{ width: `${(row.approved / row.total) * 100}%` }} />
                <div className="bg-amber-400/70 h-full" style={{ width: `${(row.pending / row.total) * 100}%` }} />
                <div className="bg-red-400/60 h-full" style={{ width: `${(row.rejected / row.total) * 100}%` }} />
              </div>
              <div className="flex gap-4 mt-1.5">
                <span className="text-xs text-emerald-600">✓ {row.approved} одобрено</span>
                <span className="text-xs text-amber-600">◷ {row.pending} на рассм.</span>
                <span className="text-xs text-red-500">✕ {row.rejected} отклонено</span>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-5 px-5 pb-5">
          {[
            { color: 'bg-emerald-500/70', label: 'Одобрено' },
            { color: 'bg-amber-400/70', label: 'На рассмотрении' },
            { color: 'bg-red-400/60', label: 'Отклонено' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
              <span className="text-xs text-primary/50">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}