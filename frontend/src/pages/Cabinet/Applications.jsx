import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUSES = {
  review:    { label: 'На рассмотрении', color: 'bg-amber-50 border-amber-200 text-amber-700',  icon: Clock },
  approved:  { label: 'Одобрена',        color: 'bg-green-50 border-green-200 text-green-700',  icon: CheckCircle2 },
  rejected:  { label: 'Отклонена',       color: 'bg-red-50 border-red-200 text-red-600',        icon: XCircle },
  info:      { label: 'Нужны документы', color: 'bg-blue-50 border-blue-200 text-blue-700',     icon: AlertCircle },
  processing:{ label: 'В обработке',     color: 'bg-purple-50 border-purple-200 text-purple-700', icon: RefreshCw },
};

const MOCK_APPLICATIONS = [
  {
    id: 'ZAY-2024-00342',
    service: 'Микрокредитование малого бизнеса',
    org: 'КМБ «Байтерек»',
    orgColor: '#0070F3',
    amount: '5 000 000 ₸',
    status: 'review',
    date: '14.01.2025',
    updated: '2 дня назад',
  },
  {
    id: 'ZAY-2024-00298',
    service: 'Гарантирование кредитов МСБ',
    org: 'КГФ',
    orgColor: '#FF6B35',
    amount: '15 000 000 ₸',
    status: 'approved',
    date: '28.12.2024',
    updated: '10 дней назад',
  },
  {
    id: 'ZAY-2024-00251',
    service: 'Лизинг оборудования',
    org: 'БРК-Лизинг',
    orgColor: '#6B46C1',
    amount: '32 000 000 ₸',
    status: 'info',
    date: '05.12.2024',
    updated: '1 день назад',
  },
  {
    id: 'ZAY-2024-00198',
    service: 'Экспортное страхование сделок',
    org: 'КазЭкспортГарант',
    orgColor: '#059669',
    amount: '8 500 000 ₸',
    status: 'processing',
    date: '11.11.2024',
    updated: '5 часов назад',
  },
  {
    id: 'ZAY-2024-00102',
    service: 'Субсидирование процентной ставки',
    org: 'КМБ «Байтерек»',
    orgColor: '#0070F3',
    amount: '—',
    status: 'rejected',
    date: '22.09.2024',
    updated: '3 месяца назад',
  },
];

const FILTER_TABS = [
  { key: 'all',    label: 'Все' },
  { key: 'review', label: 'На рассмотрении' },
  { key: 'approved', label: 'Одобренные' },
  { key: 'info',   label: 'Требуют действий' },
];

export default function CabinetApplications() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filtered = MOCK_APPLICATIONS.filter(a => {
    const matchSearch = a.service.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search);
    const matchTab = activeTab === 'all' || a.status === activeTab;
    return matchSearch && matchTab;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Мои заявки</h1>
          <p className="text-primary/45 text-sm mt-0.5">История и статусы ваших обращений</p>
        </div>
        <Link
          to="/catalog"
          className="flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-light transition-colors"
        >
          Подать новую <ArrowRight size={14} />
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Всего заявок',     value: MOCK_APPLICATIONS.length,                                     color: 'text-primary' },
          { label: 'На рассмотрении', value: MOCK_APPLICATIONS.filter(a => a.status === 'review' || a.status === 'processing').length, color: 'text-amber-600' },
          { label: 'Одобрено',         value: MOCK_APPLICATIONS.filter(a => a.status === 'approved').length,  color: 'text-green-600' },
          { label: 'Требуют действий', value: MOCK_APPLICATIONS.filter(a => a.status === 'info').length,      color: 'text-blue-600' },
        ].map((s, i) => (
          <div key={i} className="bg-surface border border-primary/8 rounded-xl px-4 py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-primary/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-1 px-4 py-3 border-b border-primary/8 overflow-x-auto">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                activeTab === tab.key
                  ? 'bg-accent text-white'
                  : 'text-primary/55 hover:text-primary hover:bg-primary/6'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative flex-shrink-0">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/35" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="pl-7 pr-3 py-1.5 text-xs bg-bg border border-primary/10 rounded-full focus:outline-none focus:border-accent/50 transition-colors w-40"
            />
          </div>
        </div>

        {/* Application list */}
        <div className="divide-y divide-primary/5">
          {filtered.length === 0 && (
            <div className="py-14 text-center text-primary/35 text-sm">
              Заявки не найдены
            </div>
          )}
          {filtered.map((app, i) => {
            const S = STATUSES[app.status];
            const SIcon = S.icon;
            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-primary/2 transition-colors cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${app.orgColor}15` }}>
                  <FileText size={15} style={{ color: app.orgColor }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-primary truncate">{app.service}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-primary/40">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: app.orgColor }} />
                      {app.org}
                    </span>
                    <span className="text-xs text-primary/30">#{app.id}</span>
                    <span className="text-xs text-primary/30">{app.date}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {app.amount !== '—' && (
                    <span className="text-sm font-bold text-primary">{app.amount}</span>
                  )}
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${S.color}`}>
                    <SIcon size={10} />
                    {S.label}
                  </span>
                  <span className="text-xs text-primary/30">обновлено {app.updated}</span>
                </div>

                <ChevronRight size={14} className="text-primary/20 group-hover:text-primary/40 transition-colors flex-shrink-0" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}