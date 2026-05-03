import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Clock, CheckCircle2, XCircle, ChevronRight,
  Bell, User, Building2, Download, TrendingUp, AlertCircle,
  PlusCircle, ArrowUpRight, CalendarDays, Inbox
} from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────────────────────
const USER = {
  name: 'Алибек Джаксыбеков',
  company: 'ТОО «АгроПром Казахстан»',
  bin: '210840003412',
  avatar: null,
};

const STATS = [
  { label: 'Всего заявок',      value: 12, icon: FileText,     color: 'text-accent',          bg: 'bg-accent/10' },
  { label: 'На рассмотрении',   value: 3,  icon: Clock,        color: 'text-yellow-400',      bg: 'bg-yellow-400/10' },
  { label: 'Одобрено',          value: 7,  icon: CheckCircle2, color: 'text-emerald-400',     bg: 'bg-emerald-400/10' },
  { label: 'Отклонено',         value: 2,  icon: XCircle,      color: 'text-rose-400',        bg: 'bg-rose-400/10' },
];

const STATUS_META = {
  pending:   { label: 'На рассмотрении', color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  dot: 'bg-yellow-400' },
  approved:  { label: 'Одобрено',        color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  rejected:  { label: 'Отклонено',       color: 'text-rose-400',    bg: 'bg-rose-400/10',    dot: 'bg-rose-400' },
  docs:      { label: 'Нужны документы', color: 'text-blue-400',    bg: 'bg-blue-400/10',    dot: 'bg-blue-400' },
};

const APPLICATIONS = [
  { id: 'APP-2024-0112', service: 'Микрокредитование МСБ', org: 'КМБ', amount: '₸15 000 000', status: 'pending',  date: '12 мая 2025',  updated: '2 дня назад' },
  { id: 'APP-2024-0098', service: 'Гарантирование займов',  org: 'КГФ', amount: '₸50 000 000', status: 'approved', date: '3 апр 2025',   updated: '5 дней назад' },
  { id: 'APP-2024-0081', service: 'Лизинг оборудования',    org: 'БРК', amount: '₸8 200 000',  status: 'docs',     date: '21 мар 2025',  updated: '1 день назад' },
  { id: 'APP-2024-0067', service: 'Экспортное страхование', org: 'КazExport', amount: '₸3 500 000', status: 'rejected', date: '14 фев 2025', updated: '18 дней назад' },
  { id: 'APP-2024-0055', service: 'Субсидирование ставки',  org: 'ДБ', amount: '₸22 000 000', status: 'approved', date: '6 янв 2025',   updated: '1 мес назад' },
];

const NOTIFICATIONS = [
  { id: 1, text: 'По заявке APP-2024-0081 требуется загрузить устав компании', time: '1 час назад', urgent: true },
  { id: 2, text: 'Заявка APP-2024-0098 одобрена. Ознакомьтесь с условиями договора', time: '5 дней назад', urgent: false },
  { id: 3, text: 'Плановый осмотр системы 18 мая с 02:00 до 04:00', time: '7 дней назад', urgent: false },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function StatCard({ stat, index }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
      className="bg-surface border border-primary/8 rounded-2xl p-5 flex items-center gap-4"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.bg}`}>
        <Icon size={20} className={stat.color} />
      </div>
      <div>
        <p className="text-2xl font-bold text-primary">{stat.value}</p>
        <p className="text-xs text-primary/50 mt-0.5">{stat.label}</p>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() =>
    filter === 'all' ? APPLICATIONS : APPLICATIONS.filter(a => a.status === filter),
    [filter]
  );

  const tabs = [
    { key: 'all',      label: 'Все' },
    { key: 'pending',  label: 'На рассмотрении' },
    { key: 'approved', label: 'Одобрено' },
    { key: 'docs',     label: 'Нужны документы' },
    { key: 'rejected', label: 'Отклонено' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Page header */}
      <div className="bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          >
            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <User size={22} className="text-accent" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg leading-tight">{USER.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Building2 size={12} className="text-white/40" />
                  <p className="text-white/50 text-sm">{USER.company}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-medium
                hover:bg-accent-light transition-colors duration-150 self-start sm:self-auto"
            >
              <PlusCircle size={15} />
              Подать новую заявку
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s, i) => <StatCard key={s.label} stat={s} index={i} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Applications table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">Мои заявки</h2>
              <Link to="/cabinet/applications" className="text-xs font-medium text-accent hover:text-accent-light transition-colors duration-150">
                Все заявки →
              </Link>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1.5 flex-wrap">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150
                    ${filter === tab.key
                      ? 'bg-accent text-white'
                      : 'bg-surface border border-primary/10 text-primary/60 hover:border-accent/40 hover:text-primary'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="bg-surface border border-primary/8 rounded-2xl p-10 text-center">
                  <Inbox size={32} className="text-primary/20 mx-auto mb-3" />
                  <p className="text-primary/40 text-sm">Заявок в этой категории нет</p>
                </div>
              )}
              {filtered.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link
                    to={`/cabinet/applications/${app.id}`}
                    className="flex items-start sm:items-center gap-4 bg-surface border border-primary/8 rounded-2xl p-4
                      hover:border-accent/30 hover:shadow-sm transition-[border-color,box-shadow] duration-150 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1.5">
                        <p className="text-xs font-mono text-primary/40">{app.id}</p>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-sm font-semibold text-primary truncate">{app.service}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-primary/40 flex items-center gap-1">
                          <Building2 size={11} /> {app.org}
                        </span>
                        <span className="text-xs text-primary/40 flex items-center gap-1">
                          <CalendarDays size={11} /> {app.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-primary">{app.amount}</p>
                      <p className="text-xs text-primary/35 mt-0.5">{app.updated}</p>
                    </div>
                    <ChevronRight size={16} className="text-primary/25 group-hover:text-accent flex-shrink-0 transition-colors duration-150 hidden sm:block" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Notifications */}
            <div className="bg-surface border border-primary/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                  <Bell size={15} className="text-accent" />
                  Уведомления
                </h3>
                <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                  {NOTIFICATIONS.filter(n => n.urgent).length}
                </span>
              </div>
              <div className="space-y-3">
                {NOTIFICATIONS.map((n, i) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                    className={`flex gap-3 p-3 rounded-xl ${n.urgent ? 'bg-accent/6 border border-accent/20' : 'bg-bg'}`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {n.urgent
                        ? <AlertCircle size={14} className="text-accent" />
                        : <Bell size={14} className="text-primary/30" />
                      }
                    </div>
                    <div>
                      <p className="text-xs text-primary/75 leading-relaxed">{n.text}</p>
                      <p className="text-[10px] text-primary/35 mt-1">{n.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-surface border border-primary/8 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-primary mb-3">Быстрые действия</h3>
              <div className="space-y-2">
                {[
                  { label: 'Скачать выписку',         icon: Download,      href: '#' },
                  { label: 'Просмотреть документы',    icon: FileText,      href: '/cabinet/documents' },
                  { label: 'История активности',       icon: TrendingUp,    href: '/cabinet/activity' },
                  { label: 'Каталог услуг',            icon: ArrowUpRight,  href: '/catalog' },
                ].map((a, i) => {
                  const Icon = a.icon;
                  return (
                    <Link
                      key={a.label}
                      to={a.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-primary/70
                        hover:bg-bg hover:text-primary transition-colors duration-150 group"
                    >
                      <Icon size={14} className="text-primary/35 group-hover:text-accent transition-colors duration-150" />
                      {a.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Profile card */}
            <div className="bg-primary rounded-2xl p-5">
              <p className="text-white/50 text-xs mb-3">Реквизиты компании</p>
              <p className="text-white font-semibold text-sm">{USER.company}</p>
              <p className="text-white/40 text-xs mt-1">БИН: {USER.bin}</p>
              <Link
                to="/cabinet/profile"
                className="inline-flex items-center gap-1.5 mt-4 text-accent text-xs font-medium hover:text-accent-light transition-colors duration-150"
              >
                Редактировать профиль <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}