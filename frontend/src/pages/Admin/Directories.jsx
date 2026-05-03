import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked,
  Building2,
  Tag,
  MapPin,
  Layers,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  ChevronDown,
  X,
  Check,
  MoreHorizontal,
  GripVertical,
  Hash,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const DIRECTORIES = [
  {
    id: 'orgs',
    label: 'Организации',
    icon: Building2,
    color: 'text-accent',
    bg: 'bg-accent/10',
    count: 7,
    description: 'Дочерние организации группы Холдинга',
    items: [
      { id: 1, name: 'Холдинг «Байтерек»', code: 'BAITEREK', active: true },
      { id: 2, name: 'БРК (Банк развития Казахстана)', code: 'BRK', active: true },
      { id: 3, name: 'КМФ (Казахстанский МФО)', code: 'KMF', active: true },
      { id: 4, name: 'КазГарант', code: 'KAZGARANT', active: true },
      { id: 5, name: 'БРК-Лизинг', code: 'BRK_LEASING', active: true },
      { id: 6, name: 'КазЭкспортГарант', code: 'KEG', active: true },
      { id: 7, name: 'ИФК (Инвест. Фонд)', code: 'IFK', active: false },
    ],
  },
  {
    id: 'categories',
    label: 'Категории услуг',
    icon: Tag,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    count: 8,
    description: 'Классификатор видов государственной поддержки',
    items: [
      { id: 1, name: 'Кредитование и займы', code: 'LOANS', active: true },
      { id: 2, name: 'Гарантии', code: 'GUARANTEES', active: true },
      { id: 3, name: 'Лизинг', code: 'LEASING', active: true },
      { id: 4, name: 'Экспортная поддержка', code: 'EXPORT', active: true },
      { id: 5, name: 'Инвестиции', code: 'INVESTMENTS', active: true },
      { id: 6, name: 'Страхование', code: 'INSURANCE', active: true },
      { id: 7, name: 'Субсидии', code: 'SUBSIDIES', active: true },
      { id: 8, name: 'Гранты', code: 'GRANTS', active: false },
    ],
  },
  {
    id: 'regions',
    label: 'Регионы',
    icon: MapPin,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    count: 17,
    description: 'Административно-территориальные единицы РК',
    items: [
      { id: 1, name: 'г. Астана', code: 'AST', active: true },
      { id: 2, name: 'г. Алматы', code: 'ALA', active: true },
      { id: 3, name: 'г. Шымкент', code: 'SHY', active: true },
      { id: 4, name: 'Алматинская область', code: 'ALM', active: true },
      { id: 5, name: 'Акмолинская область', code: 'AKM', active: true },
      { id: 6, name: 'Актюбинская область', code: 'AKT', active: true },
      { id: 7, name: 'Атырауская область', code: 'ATY', active: true },
      { id: 8, name: 'Восточно-Казахстанская область', code: 'VKO', active: true },
    ],
  },
  {
    id: 'statuses',
    label: 'Статусы заявок',
    icon: Layers,
    color: 'text-amber-600',
    bg: 'bg-amber-400/10',
    count: 6,
    description: 'Этапы жизненного цикла заявки',
    items: [
      { id: 1, name: 'Черновик',          code: 'DRAFT',      active: true },
      { id: 2, name: 'Подана',            code: 'SUBMITTED',  active: true },
      { id: 3, name: 'На рассмотрении',   code: 'REVIEWING',  active: true },
      { id: 4, name: 'Одобрена',          code: 'APPROVED',   active: true },
      { id: 5, name: 'Отклонена',         code: 'REJECTED',   active: true },
      { id: 6, name: 'Завершена',         code: 'COMPLETED',  active: true },
    ],
  },
];

// ─── Inline edit row ──────────────────────────────────────────────────────────

const EditableRow = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState(item?.name ?? '');
  const [code, setCode] = useState(item?.code ?? '');
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/5 border-l-2 border-accent">
      <div className="w-5 h-5 flex-shrink-0" />
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Название"
        className="flex-1 px-2.5 py-1 text-sm bg-surface border border-primary/15 rounded-lg text-primary placeholder:text-primary/35 focus:outline-none focus:border-accent/60"
      />
      <input
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        placeholder="КОД"
        className="w-28 px-2.5 py-1 text-sm font-mono bg-surface border border-primary/15 rounded-lg text-primary placeholder:text-primary/35 focus:outline-none focus:border-accent/60"
      />
      <button
        onClick={() => onSave({ name, code })}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 transition-colors"
      >
        <Check size={13} />
      </button>
      <button
        onClick={onCancel}
        className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary/8 text-primary/50 hover:bg-primary/15 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
};

// ─── Directory Panel ──────────────────────────────────────────────────────────

const DirectoryPanel = ({ dir }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [items, setItems] = useState(dir.items);

  const filtered = useMemo(() =>
    items.filter(it => !search || it.name.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const Icon = dir.icon;

  const handleSave = (id, data) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, ...data } : it));
    setEditingId(null);
  };

  const handleAdd = (data) => {
    if (!data.name) return;
    setItems(prev => [...prev, { id: Date.now(), ...data, active: true }]);
    setAddingNew(false);
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(it => it.id !== id));
  };

  const handleToggle = (id) => {
    setItems(prev => prev.map(it => it.id === id ? { ...it, active: !it.active } : it));
  };

  return (
    <div className="bg-surface border border-primary/8 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-bg/50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${dir.bg}`}>
          <Icon size={18} className={dir.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary">{dir.label}</p>
          <p className="text-xs text-primary/45 truncate">{dir.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary/50">
            {items.length}
          </span>
          <ChevronDown
            size={15}
            className={`text-primary/35 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden border-t border-primary/8"
          >
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-bg/40 border-b border-primary/6">
              <div className="relative flex-1 max-w-[220px]">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary/35" />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1 text-xs bg-surface border border-primary/10 rounded-lg text-primary placeholder:text-primary/35 focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <button
                onClick={() => { setAddingNew(true); setOpen(true); }}
                className="ml-auto flex items-center gap-1.5 px-2.5 py-1 bg-accent hover:bg-accent-dark text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Plus size={12} /> Добавить
              </button>
            </div>

            {/* Table head */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] items-center px-4 py-2 border-b border-primary/6 text-xs text-primary/35 uppercase tracking-wide font-medium">
              <div className="w-5 mr-3" />
              <span>Название</span>
              <span className="px-8 hidden sm:block">Код</span>
              <span>Статус</span>
            </div>

            {/* Items */}
            <div className="divide-y divide-primary/5">
              {filtered.map((item) => (
                <div key={item.id}>
                  {editingId === item.id ? (
                    <EditableRow
                      item={item}
                      onSave={(data) => handleSave(item.id, data)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center px-4 py-2.5 hover:bg-bg/60 transition-colors group gap-1">
                      <GripVertical size={14} className="text-primary/20 mr-3 cursor-grab" />
                      <span className={`text-sm ${item.active ? 'text-primary' : 'text-primary/35 line-through'}`}>
                        {item.name}
                      </span>
                      <span className="text-xs font-mono text-primary/35 px-8 hidden sm:block">{item.code}</span>
                      <div className="flex items-center gap-1">
                        {/* toggle */}
                        <button
                          onClick={() => handleToggle(item.id)}
                          className={`w-7 h-4 rounded-full transition-colors flex-shrink-0 relative ${item.active ? 'bg-emerald-500' : 'bg-primary/15'}`}
                        >
                          <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all ${item.active ? 'left-3.5' : 'left-0.5'}`} />
                        </button>
                        {/* edit */}
                        <button
                          onClick={() => setEditingId(item.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-primary/30 hover:text-primary hover:bg-bg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Pencil size={12} />
                        </button>
                        {/* delete */}
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-primary/30 hover:text-red-500 hover:bg-red-400/8 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {addingNew && (
                <EditableRow
                  item={null}
                  onSave={handleAdd}
                  onCancel={() => setAddingNew(false)}
                />
              )}

              {filtered.length === 0 && !addingNew && (
                <div className="py-8 text-center text-xs text-primary/35">Записи не найдены</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDirectories() {
  const [globalSearch, setGlobalSearch] = useState('');

  const visibleDirs = useMemo(() =>
    DIRECTORIES.filter(d =>
      !globalSearch || d.label.toLowerCase().includes(globalSearch.toLowerCase())
    ),
    [globalSearch]
  );

  const totalItems = useMemo(() => DIRECTORIES.reduce((a, d) => a + d.count, 0), []);

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Справочники</h1>
          <p className="text-primary/50 text-sm mt-0.5">Управление классификаторами и системными данными</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-xl transition-colors">
          <Plus size={16} />
          Новый справочник
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {DIRECTORIES.map((dir, i) => {
          const Icon = dir.icon;
          return (
            <motion.div
              key={dir.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${dir.bg}`}>
                <Icon size={15} className={dir.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{dir.count}</p>
                <p className="text-xs text-primary/50">{dir.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Global search */}
      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/35" />
        <input
          type="text"
          placeholder="Поиск по справочникам..."
          value={globalSearch}
          onChange={e => setGlobalSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm bg-surface border border-primary/10 rounded-xl text-primary placeholder:text-primary/35 focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Directory panels */}
      <div className="space-y-3">
        {visibleDirs.map((dir, i) => (
          <motion.div
            key={dir.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            <DirectoryPanel dir={dir} />
          </motion.div>
        ))}

        {visibleDirs.length === 0 && (
          <div className="py-16 text-center text-primary/40 text-sm">Справочники не найдены</div>
        )}
      </div>

    </div>
  );
}