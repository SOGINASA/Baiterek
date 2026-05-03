import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Newspaper,
  BookOpen,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Tag,
  Calendar,
  User,
  CheckCircle,
  Clock,
  Globe,
  ChevronDown,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CONTENT_ITEMS = [
  { id: 1, type: 'news',     title: 'Байтерек поддержал 500 предпринимателей в апреле', org: 'Холдинг', status: 'published', author: 'А. Нурланов', date: '03.05.2026', views: 1284 },
  { id: 2, type: 'article',  title: 'Как получить гарантию по кредиту: пошаговая инструкция', org: 'КазГарант', status: 'published', author: 'Д. Сарсенова', date: '02.05.2026', views: 947 },
  { id: 3, type: 'news',     title: 'КМФ снизил ставку по микрокредитам для сельского бизнеса', org: 'КМФ', status: 'draft', author: 'Б. Ержанов', date: '01.05.2026', views: 0 },
  { id: 4, type: 'knowledge',title: 'Требования к бизнес-плану для получения займа', org: 'БРК', status: 'published', author: 'М. Абдикеров', date: '30.04.2026', views: 3102 },
  { id: 5, type: 'article',  title: 'Экспортное страхование: какие риски покрывает КЭГ', org: 'КЭГ', status: 'published', author: 'Г. Токтарова', date: '29.04.2026', views: 672 },
  { id: 6, type: 'news',     title: 'Форум предпринимателей «Байтерек 2026» — итоги', org: 'Холдинг', status: 'published', author: 'А. Нурланов', date: '28.04.2026', views: 2450 },
  { id: 7, type: 'knowledge',title: 'Справочник по лизингу оборудования', org: 'БРК-Лизинг', status: 'draft', author: 'Р. Дюсекеев', date: '27.04.2026', views: 0 },
  { id: 8, type: 'article',  title: 'Как выйти на экспорт: 10 шагов для МСБ', org: 'КЭГ', status: 'review', author: 'Г. Токтарова', date: '26.04.2026', views: 0 },
  { id: 9, type: 'news',     title: 'БРК открыл новую кредитную линию для промышленности', org: 'БРК', status: 'published', author: 'М. Абдикеров', date: '25.04.2026', views: 1870 },
  { id: 10, type: 'knowledge',title: 'FAQ: Государственная поддержка агробизнеса', org: 'Холдинг', status: 'published', author: 'Д. Сарсенова', date: '24.04.2026', views: 4300 },
];

const TABS = [
  { id: 'all',      label: 'Все',            icon: FileText },
  { id: 'news',     label: 'Новости',        icon: Newspaper },
  { id: 'article',  label: 'Статьи',         icon: BookOpen },
  { id: 'knowledge',label: 'База знаний',    icon: BookOpen },
];

const TYPE_MAP = {
  news:     { label: 'Новость',       cls: 'bg-blue-500/12 text-blue-600' },
  article:  { label: 'Статья',        cls: 'bg-purple-500/12 text-purple-600' },
  knowledge:{ label: 'База знаний',   cls: 'bg-teal-600/12 text-teal-600' },
};

const STATUS_MAP = {
  published: { label: 'Опубликовано', icon: CheckCircle, cls: 'text-emerald-600' },
  draft:     { label: 'Черновик',     icon: FileText,    cls: 'text-primary/40' },
  review:    { label: 'На проверке',  icon: Clock,       cls: 'text-amber-500' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const { label, cls } = TYPE_MAP[type] ?? { label: type, cls: 'bg-primary/10 text-primary' };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
};

const StatusCell = ({ status }) => {
  const { label, icon: Icon, cls } = STATUS_MAP[status] ?? { label: status, icon: Globe, cls: 'text-primary/50' };
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${cls}`}>
      <Icon size={13} />
      {label}
    </div>
  );
};

const ActionMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg text-primary/40 hover:text-primary transition-colors"
      >
        <MoreHorizontal size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-40 bg-surface border border-primary/10 rounded-xl shadow-lg z-10 overflow-hidden"
          >
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-bg transition-colors"
            >
              <Eye size={14} className="text-primary/50" /> Просмотр
            </button>
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary hover:bg-bg transition-colors"
            >
              <Pencil size={14} className="text-primary/50" /> Редактировать
            </button>
            <div className="h-px bg-primary/8 mx-2" />
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-400/8 transition-colors"
            >
              <Trash2 size={14} /> Удалить
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Summary cards ────────────────────────────────────────────────────────────

const SUMMARY = [
  { label: 'Всего материалов', value: 10, icon: FileText, bg: 'bg-accent/10', color: 'text-accent' },
  { label: 'Опубликовано',     value: 7,  icon: Globe,    bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
  { label: 'Черновики',        value: 2,  icon: FileText, bg: 'bg-primary/8', color: 'text-primary/50' },
  { label: 'На проверке',      value: 1,  icon: Clock,    bg: 'bg-amber-400/10', color: 'text-amber-500' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState('');

  const filtered = useMemo(() => {
    return CONTENT_ITEMS.filter(item => {
      const matchTab = activeTab === 'all' || item.type === activeTab;
      const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
      const matchOrg = !orgFilter || item.org === orgFilter;
      return matchTab && matchSearch && matchOrg;
    });
  }, [activeTab, search, orgFilter]);

  const orgs = useMemo(() => [...new Set(CONTENT_ITEMS.map(i => i.org))], []);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Контент</h1>
          <p className="text-primary/50 text-sm mt-0.5">Управление публикациями, новостями и базой знаний</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-xl transition-colors duration-150">
          <Plus size={16} />
          Создать материал
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {SUMMARY.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <Icon size={15} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-primary/50">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs + Filters */}
      <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">

        {/* Tab bar */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-primary/8 pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors duration-150 -mb-px ${
                  active
                    ? 'text-accent border-accent bg-accent/5'
                    : 'text-primary/50 border-transparent hover:text-primary hover:bg-bg'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-primary/8 bg-bg/50">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/35" />
            <input
              type="text"
              placeholder="Поиск по заголовку..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary placeholder:text-primary/35 focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          {/* Org filter */}
          <div className="relative">
            <select
              value={orgFilter}
              onChange={e => setOrgFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-sm bg-surface border border-primary/10 rounded-lg text-primary focus:outline-none focus:border-accent/50 transition-colors cursor-pointer"
            >
              <option value="">Все организации</option>
              {orgs.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" />
          </div>

          <span className="text-xs text-primary/40 ml-auto">{filtered.length} материалов</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-primary/40 uppercase tracking-wide border-b border-primary/6">
                <th className="text-left px-5 py-3 font-medium">Материал</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Тип</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Организация</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Статус</th>
                <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Автор</th>
                <th className="text-left px-4 py-3 font-medium hidden xl:table-cell">Дата</th>
                <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Просмотры</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              <AnimatePresence mode="popLayout">
                {filtered.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-bg/60 transition-colors group"
                  >
                    {/* Title */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-primary leading-snug max-w-xs truncate group-hover:text-accent transition-colors cursor-pointer">
                        {item.title}
                      </p>
                    </td>
                    {/* Type */}
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <TypeBadge type={item.type} />
                    </td>
                    {/* Org */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-primary/60">{item.org}</span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <StatusCell status={item.status} />
                    </td>
                    {/* Author */}
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-accent/15 flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0">
                          {item.author[0]}
                        </div>
                        <span className="text-xs text-primary/60">{item.author}</span>
                      </div>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3.5 hidden xl:table-cell">
                      <span className="text-xs text-primary/40">{item.date}</span>
                    </td>
                    {/* Views */}
                    <td className="px-4 py-3.5 text-right hidden md:table-cell">
                      <span className="text-sm text-primary/50">
                        {item.views > 0 ? item.views.toLocaleString() : '—'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-3.5 text-right">
                      <ActionMenu onEdit={() => {}} onDelete={() => {}} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-primary/40 text-sm">
              Материалы не найдены
            </div>
          )}
        </div>

        {/* Pagination placeholder */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-primary/8 bg-bg/30">
          <span className="text-xs text-primary/40">Показано {filtered.length} из {CONTENT_ITEMS.length}</span>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(p => (
              <button
                key={p}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  p === 1 ? 'bg-accent text-white' : 'text-primary/50 hover:bg-bg'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}