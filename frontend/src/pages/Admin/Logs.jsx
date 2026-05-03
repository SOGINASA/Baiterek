import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  User,
  Settings,
  FileText,
  LogIn,
  LogOut,
  Trash2,
  Pencil,
  Plus,
  Search,
  ChevronDown,
  Download,
  RefreshCw,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Terminal,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LOGS = [
  { id: 1, level: 'info',    category: 'auth',    action: 'Вход в систему',                  actor: 'А. Нурланов',      ip: '192.168.1.14',  time: '03.05.2026 14:32:11', detail: 'Успешная авторизация через eGov IDP' },
  { id: 2, level: 'info',    category: 'content', action: 'Публикация материала',             actor: 'Д. Сарсенова',     ip: '10.0.0.22',     time: '03.05.2026 14:18:44', detail: 'Опубликована статья «Гарантия по кредиту»' },
  { id: 3, level: 'warning', category: 'auth',    action: 'Неудачная попытка входа',          actor: 'Неизвестно',       ip: '85.234.11.9',   time: '03.05.2026 13:55:02', detail: '5 попыток подряд с IP 85.234.11.9' },
  { id: 4, level: 'info',    category: 'service', action: 'Услуга обновлена',                 actor: 'Б. Ержанов',       ip: '10.0.0.31',     time: '03.05.2026 13:40:17', detail: 'Обновлена карточка услуги «Микрокредит МСБ»' },
  { id: 5, level: 'error',   category: 'system',  action: 'Ошибка интеграции ЕИШ',           actor: 'Система',          ip: '—',             time: '03.05.2026 13:12:55', detail: 'Timeout при отправке заявки APP-2841 в БРК BPM' },
  { id: 6, level: 'info',    category: 'user',    action: 'Регистрация пользователя',         actor: 'ТОО «Алтын Дала»', ip: '176.53.4.200',  time: '03.05.2026 12:50:38', detail: 'Новый аккаунт зарегистрирован через портал' },
  { id: 7, level: 'info',    category: 'auth',    action: 'Выход из системы',                 actor: 'М. Абдикеров',     ip: '10.0.0.18',     time: '03.05.2026 12:33:00', detail: 'Сессия завершена пользователем' },
  { id: 8, level: 'warning', category: 'system',  action: 'Высокая нагрузка на сервер',      actor: 'Система',          ip: '—',             time: '03.05.2026 12:10:45', detail: 'CPU > 85% в течение 3 минут' },
  { id: 9, level: 'info',    category: 'content', action: 'Удаление черновика',               actor: 'Г. Токтарова',     ip: '10.0.0.41',     time: '03.05.2026 11:58:22', detail: 'Удалён черновик «Экспортный FAQ»' },
  { id: 10, level: 'error',  category: 'auth',    action: 'Ошибка ЭЦП',                      actor: 'ИП Сейткали А.',   ip: '91.147.22.5',   time: '03.05.2026 11:44:10', detail: 'Сертификат ЭЦП недействителен или истёк' },
  { id: 11, level: 'info',   category: 'service', action: 'Новая услуга создана',             actor: 'Р. Дюсекеев',      ip: '10.0.0.31',     time: '03.05.2026 11:20:05', detail: 'Создана услуга «Лизинг 2.0» — статус черновик' },
  { id: 12, level: 'info',   category: 'user',    action: 'Роль изменена',                    actor: 'А. Нурланов',      ip: '10.0.0.14',     time: '03.05.2026 10:55:33', detail: 'Пользователю Б. Ержанов назначена роль «Автор»' },
];

const LEVEL_MAP = {
  info:    { label: 'Info',    icon: Info,          cls: 'bg-blue-500/10 text-blue-600',    dot: 'bg-blue-500' },
  warning: { label: 'Warning', icon: AlertTriangle, cls: 'bg-amber-400/10 text-amber-600', dot: 'bg-amber-400' },
  error:   { label: 'Error',   icon: XCircle,       cls: 'bg-red-400/10 text-red-500',     dot: 'bg-red-400' },
};

const CATEGORY_MAP = {
  auth:    { label: 'Авторизация', icon: ShieldAlert, cls: 'bg-purple-500/10 text-purple-600' },
  content: { label: 'Контент',     icon: FileText,    cls: 'bg-teal-600/10 text-teal-600' },
  service: { label: 'Услуги',      icon: Settings,    cls: 'bg-accent/10 text-accent' },
  user:    { label: 'Пользователи',icon: User,        cls: 'bg-emerald-500/10 text-emerald-600' },
  system:  { label: 'Система',     icon: Terminal,    cls: 'bg-primary/8 text-primary/60' },
};

const SUMMARY = [
  { level: 'info',    value: 9,  label: 'Info' },
  { level: 'warning', value: 2,  label: 'Предупреждения' },
  { level: 'error',   value: 2,  label: 'Ошибки' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const LevelBadge = ({ level }) => {
  const { label, cls, icon: Icon } = LEVEL_MAP[level] ?? { label: level, cls: 'bg-primary/10 text-primary', icon: Info };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  );
};

const CategoryBadge = ({ category }) => {
  const { label, cls } = CATEGORY_MAP[category] ?? { label: category, cls: 'bg-primary/10 text-primary' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminLogs() {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = useMemo(() => {
    return LOGS.filter(log => {
      const matchSearch = !search ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.detail.toLowerCase().includes(search.toLowerCase());
      const matchLevel = !levelFilter || log.level === levelFilter;
      const matchCat = !categoryFilter || log.category === categoryFilter;
      return matchSearch && matchLevel && matchCat;
    });
  }, [search, levelFilter, categoryFilter]);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Журнал событий</h1>
          <p className="text-primary/50 text-sm mt-0.5">Аудит действий пользователей и системных событий</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-primary/10 rounded-xl text-sm text-primary/60 hover:text-primary hover:bg-bg transition-colors">
            <RefreshCw size={14} />
            Обновить
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-xl transition-colors">
            <Download size={14} />
            Экспорт
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        {SUMMARY.map((s, i) => {
          const { dot, cls } = LEVEL_MAP[s.level];
          return (
            <motion.div
              key={s.level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => setLevelFilter(prev => prev === s.level ? '' : s.level)}
              className={`bg-surface border rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
                levelFilter === s.level ? 'border-accent/40 bg-accent/5' : 'border-primary/8 hover:border-primary/20'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
              <div>
                <p className="text-xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-primary/50">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table card */}
      <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-primary/8 bg-bg/40">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/35" />
            <input
              type="text"
              placeholder="Поиск по событию, актору..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary placeholder:text-primary/35 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
            >
              <option value="">Все уровни</option>
              {Object.entries(LEVEL_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
            >
              <option value="">Все категории</option>
              {Object.entries(CATEGORY_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
          </div>

          <span className="text-xs text-primary/40 ml-auto">{filtered.length} записей</span>
        </div>

        {/* Log rows */}
        <div className="divide-y divide-primary/5">
          <AnimatePresence mode="popLayout">
            {filtered.map((log, i) => {
              const expanded = expandedId === log.id;
              const { dot } = LEVEL_MAP[log.level] ?? {};
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <div
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-bg/60 transition-colors cursor-pointer"
                    onClick={() => setExpandedId(expanded ? null : log.id)}
                  >
                    {/* Dot */}
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${dot}`} />

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-primary">{log.action}</span>
                        <LevelBadge level={log.level} />
                        <CategoryBadge category={log.category} />
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-primary/45">
                        <span className="flex items-center gap-1"><User size={11} />{log.actor}</span>
                        <span>IP: {log.ip}</span>
                        <span>{log.time}</span>
                      </div>
                    </div>

                    <ChevronDown
                      size={15}
                      className={`text-primary/30 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                    />
                  </div>

                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-10 pb-4">
                          <div className="bg-bg rounded-xl px-4 py-3 border border-primary/8">
                            <p className="text-xs font-medium text-primary/40 mb-1 uppercase tracking-wide">Детали</p>
                            <p className="text-sm text-primary leading-relaxed">{log.detail}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-primary/40 text-sm">Записи не найдены</div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-primary/8 bg-bg/30">
          <span className="text-xs text-primary/40">Показано {filtered.length} из {LOGS.length}</span>
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