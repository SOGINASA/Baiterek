import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, Plus, Search, X, MoreHorizontal,
  Eye, EyeOff, Edit2, Trash2, Copy, Star,
  Building2, Clock, CheckCircle2, ArrowUpRight,
} from 'lucide-react';

const ORGS = ['КМБ', 'КГФ', 'БРК', 'БРК-Лизинг', 'KazExport', 'ДБ', 'НАТР'];
const CATS = ['Кредитование', 'Гарантирование', 'Лизинг', 'Экспорт', 'Инвестиции', 'Субсидирование'];

const MOCK_SERVICES = [
  { id: 1,  title: 'Микрокредитование МСБ',          org: 'КМБ',        category: 'Кредитование',   status: 'published', popular: true,  views: 4821, apps: 312, updated: '1 мая 2025'   },
  { id: 2,  title: 'Гарантирование займов',           org: 'КГФ',        category: 'Гарантирование', status: 'published', popular: true,  views: 3540, apps: 218, updated: '28 апр 2025' },
  { id: 3,  title: 'Лизинг оборудования',             org: 'БРК-Лизинг', category: 'Лизинг',         status: 'published', popular: false, views: 2190, apps: 145, updated: '25 апр 2025' },
  { id: 4,  title: 'Экспортное страхование',          org: 'KazExport',  category: 'Экспорт',        status: 'published', popular: false, views: 1870, apps: 89,  updated: '20 апр 2025' },
  { id: 5,  title: 'Субсидирование ставки вознагр.',  org: 'ДБ',         category: 'Субсидирование', status: 'draft',     popular: false, views: 0,    apps: 0,   updated: '18 апр 2025' },
  { id: 6,  title: 'Инвестиционный займ',             org: 'БРК',        category: 'Инвестиции',     status: 'published', popular: true,  views: 3210, apps: 201, updated: '15 апр 2025' },
  { id: 7,  title: 'Поддержка экспортёров',           org: 'KazExport',  category: 'Экспорт',        status: 'published', popular: false, views: 980,  apps: 43,  updated: '10 апр 2025' },
  { id: 8,  title: 'Лизинг автотранспорта',           org: 'БРК-Лизинг', category: 'Лизинг',         status: 'draft',     popular: false, views: 0,    apps: 0,   updated: '8 апр 2025'  },
  { id: 9,  title: 'Гарантия для стартапов',          org: 'КГФ',        category: 'Гарантирование', status: 'hidden',    popular: false, views: 560,  apps: 21,  updated: '5 апр 2025'  },
  { id: 10, title: 'Технологич. гранты для МСБ',      org: 'НАТР',       category: 'Инвестиции',     status: 'published', popular: false, views: 1450, apps: 76,  updated: '1 апр 2025'  },
];

const STATUS_META = {
  published: { label: 'Опубликована', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  draft:     { label: 'Черновик',     color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  dot: 'bg-yellow-400' },
  hidden:    { label: 'Скрыта',       color: 'text-primary/40',  bg: 'bg-primary/8',      dot: 'bg-primary/25' },
};

function ServiceCard({ service, onToggle, onDelete }) {
  const [menu, setMenu] = useState(false);
  const sm = STATUS_META[service.status];

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="bg-surface border border-primary/8 rounded-2xl p-5 hover:border-primary/20 transition-colors duration-150 group relative">

      {service.popular && (
        <div className="absolute top-4 right-12 flex items-center gap-1 text-yellow-400">
          <Star size={12} fill="currentColor" />
          <span className="text-[10px] font-medium">Популярная</span>
        </div>
      )}

      {/* Menu */}
      <div className="absolute top-3.5 right-3.5">
        <button onClick={() => setMenu(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-primary/30
            hover:bg-bg hover:text-primary transition-colors duration-150 opacity-0 group-hover:opacity-100">
          <MoreHorizontal size={15} />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }}
              onMouseLeave={() => setMenu(false)}
              className="absolute right-0 top-8 z-20 bg-surface border border-primary/10 rounded-xl shadow-lg w-44 py-1">
              {[
                { icon: Edit2,  label: 'Редактировать', cls: 'text-primary/60 hover:bg-bg hover:text-primary' },
                { icon: Copy,   label: 'Дублировать',   cls: 'text-primary/60 hover:bg-bg hover:text-primary' },
                { icon: service.status === 'hidden' ? Eye : EyeOff,
                  label: service.status === 'hidden' ? 'Показать' : 'Скрыть',
                  cls: 'text-primary/60 hover:bg-bg hover:text-primary',
                  action: onToggle },
                { icon: Trash2, label: 'Удалить',       cls: 'text-rose-400 hover:bg-rose-400/8', action: onDelete },
              ].map(item => { const Icon = item.icon; return (
                <button key={item.label} onClick={() => { item.action?.(); setMenu(false); }}
                  className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-sm transition-colors duration-100 ${item.cls}`}>
                  <Icon size={13} />{item.label}
                </button>
              ); })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Briefcase size={16} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0 pr-8">
          <p className="text-sm font-semibold text-primary leading-snug">{service.title}</p>
          <p className="text-xs text-primary/40 flex items-center gap-1 mt-1"><Building2 size={10} />{service.org} · {service.category}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-base font-bold text-primary">{service.views.toLocaleString()}</p>
          <p className="text-[10px] text-primary/35">Просмотров</p>
        </div>
        <div className="w-px h-8 bg-primary/8" />
        <div className="text-center">
          <p className="text-base font-bold text-primary">{service.apps}</p>
          <p className="text-[10px] text-primary/35">Заявок</p>
        </div>
        <div className="w-px h-8 bg-primary/8" />
        <div className="text-center">
          <p className="text-[10px] text-primary/40 whitespace-nowrap">Обновлено</p>
          <p className="text-xs font-medium text-primary/60">{service.updated}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-primary/6">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sm.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{sm.label}
        </span>
        <button className="flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors duration-150">
          Открыть <ArrowUpRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminServices() {
  const [services, setServices] = useState(MOCK_SERVICES);
  const [search, setSearch]     = useState('');
  const [orgFilter, setOrg]     = useState('all');
  const [catFilter, setCat]     = useState('all');
  const [statusFilter, setSt]   = useState('all');
  const [view, setView]         = useState('grid'); // grid | list

  const filtered = useMemo(() => services.filter(s => {
    const q = search.toLowerCase();
    return (!search || s.title.toLowerCase().includes(q))
      && (orgFilter === 'all' || s.org === orgFilter)
      && (catFilter === 'all' || s.category === catFilter)
      && (statusFilter === 'all' || s.status === statusFilter);
  }), [services, search, orgFilter, catFilter, statusFilter]);

  const toggleHide = id => setServices(p => p.map(s =>
    s.id === id ? { ...s, status: s.status === 'hidden' ? 'published' : 'hidden' } : s
  ));
  const deleteService = id => setServices(p => p.filter(s => s.id !== id));

  const STATS = [
    { label: 'Всего услуг',    value: services.length,                                    color: 'text-accent',        bg: 'bg-accent/10' },
    { label: 'Опубликованных', value: services.filter(s => s.status === 'published').length, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Черновиков',     value: services.filter(s => s.status === 'draft').length,     color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
    { label: 'Скрытых',        value: services.filter(s => s.status === 'hidden').length,    color: 'text-primary/40',  bg: 'bg-primary/8' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-primary/8 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">Управление услугами</h1>
            <p className="text-xs text-primary/40 mt-0.5">Каталог и карточки услуг</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium
            hover:bg-accent-light transition-colors duration-150">
            <Plus size={15} />Добавить услугу
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-xl px-4 py-3.5 flex items-center gap-3">
              <div className={`w-2 h-8 rounded-full flex-shrink-0 ${s.bg.replace('bg-', 'bg-').replace('/10', '/40')}`} />
              <div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-primary/40">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/35" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface border border-primary/10 rounded-xl text-sm
                text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent/50 transition-colors duration-150" />
          </div>

          <select value={orgFilter} onChange={e => setOrg(e.target.value)}
            className="px-3 py-2.5 bg-surface border border-primary/10 rounded-xl text-sm text-primary/70
              focus:outline-none focus:border-accent/50 transition-colors duration-150 cursor-pointer">
            <option value="all">Все организации</option>
            {ORGS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>

          <select value={catFilter} onChange={e => setCat(e.target.value)}
            className="px-3 py-2.5 bg-surface border border-primary/10 rounded-xl text-sm text-primary/70
              focus:outline-none focus:border-accent/50 transition-colors duration-150 cursor-pointer">
            <option value="all">Все категории</option>
            {CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex gap-1 bg-surface border border-primary/8 rounded-xl p-1">
            {[{ k: 'all', l: 'Все' }, { k: 'published', l: 'Опубл.' }, { k: 'draft', l: 'Черновик' }, { k: 'hidden', l: 'Скрытые' }].map(f => (
              <button key={f.k} onClick={() => setSt(f.k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150
                  ${statusFilter === f.k ? 'bg-accent text-white' : 'text-primary/55 hover:text-primary'}`}>{f.l}</button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-primary/40">Найдено: <span className="font-semibold text-primary">{filtered.length}</span></p>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-surface border border-primary/8 rounded-2xl py-16 text-center">
            <Briefcase size={32} className="text-primary/15 mx-auto mb-3" />
            <p className="text-primary/40 text-sm">Услуги не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(s => (
              <ServiceCard key={s.id} service={s}
                onToggle={() => toggleHide(s.id)}
                onDelete={() => deleteService(s.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}