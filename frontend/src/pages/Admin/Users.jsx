import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, Plus, MoreHorizontal, Shield,
  Building2, Mail, Edit2, Trash2, ShieldOff,
  UserCheck, UserX, Download, X,
} from 'lucide-react';

const MOCK_USERS = [
  { id: 1,  name: 'Алибек Джаксыбеков',   email: 'a.djaksybekov@mail.kz',   company: 'ТОО «АгроПром»',    role: 'user',   status: 'active',  bin: '210840003412', created: '12 янв 2025' },
  { id: 2,  name: 'Асель Нурмагамбетова', email: 'a.nurmagambetova@brk.kz', company: 'БРК-Лизинг',        role: 'author', status: 'active',  bin: null,           created: '5 фев 2025'  },
  { id: 3,  name: 'Данияр Сейткали',      email: 'd.seitkali@kmb.kz',       company: 'КМБ',               role: 'author', status: 'active',  bin: null,           created: '18 фев 2025' },
  { id: 4,  name: 'Жанна Бекова',         email: 'zh.bekova@mail.kz',       company: 'ИП Бекова',         role: 'user',   status: 'active',  bin: '880514400123', created: '2 мар 2025'  },
  { id: 5,  name: 'Максат Турганов',      email: 'm.turganov@admin.kz',     company: 'Байтерек',          role: 'admin',  status: 'active',  bin: null,           created: '10 мар 2025' },
  { id: 6,  name: 'Гульнара Сапарова',    email: 'g.saparova@mail.kz',      company: 'ТОО «СтройКапитал»',role: 'user',   status: 'blocked', bin: '950321005678', created: '15 мар 2025' },
  { id: 7,  name: 'Ерлан Ахметов',        email: 'e.akhmetov@kgf.kz',       company: 'КГФ',               role: 'author', status: 'active',  bin: null,           created: '22 мар 2025' },
  { id: 8,  name: 'Айгуль Мусина',        email: 'a.musina@mail.kz',        company: 'ТОО «ТехноИнвест»', role: 'user',   status: 'active',  bin: '001105007890', created: '1 апр 2025'  },
  { id: 9,  name: 'Болат Сарсенов',       email: 'b.sarsenov@mail.kz',      company: 'ИП Сарсенов',       role: 'user',   status: 'blocked', bin: '780908009012', created: '8 апр 2025'  },
  { id: 10, name: 'Камила Джумабекова',   email: 'k.dzhumabekova@db.kz',    company: 'ДБ',                role: 'author', status: 'active',  bin: null,           created: '14 апр 2025' },
];

const ROLE_META = {
  admin:  { label: 'Администратор', color: 'text-purple-400', bg: 'bg-purple-400/10', icon: Shield },
  author: { label: 'Автор',         color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: Edit2 },
  user:   { label: 'Пользователь',  color: 'text-primary/55', bg: 'bg-primary/8',     icon: Users },
};

const STATUS_META = {
  active:  { label: 'Активен',        color: 'text-emerald-400', dot: 'bg-emerald-400' },
  blocked: { label: 'Заблокирован',   color: 'text-rose-400',    dot: 'bg-rose-400' },
};

function RoleBadge({ role }) {
  const m = ROLE_META[role]; const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${m.color} ${m.bg}`}>
      <Icon size={11} />{m.label}
    </span>
  );
}

function RowMenu({ user, onToggle, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-primary/30
          hover:bg-bg hover:text-primary transition-colors duration-150 opacity-0 group-hover:opacity-100">
        <MoreHorizontal size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }} transition={{ duration: 0.12 }}
            onMouseLeave={() => setOpen(false)}
            className="absolute right-0 top-8 z-20 bg-surface border border-primary/10 rounded-xl shadow-lg w-44 py-1">
            <button onClick={() => { onToggle(); setOpen(false); }}
              className={`flex items-center gap-2.5 w-full px-3.5 py-2 text-sm transition-colors duration-100
                ${user.status === 'active' ? 'text-rose-400 hover:bg-rose-400/8' : 'text-emerald-400 hover:bg-emerald-400/8'}`}>
              {user.status === 'active' ? <ShieldOff size={13} /> : <UserCheck size={13} />}
              {user.status === 'active' ? 'Заблокировать' : 'Разблокировать'}
            </button>
            <button className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-primary/60 hover:bg-bg hover:text-primary transition-colors duration-100">
              <Edit2 size={13} />Редактировать
            </button>
            <button onClick={() => { onDelete(); setOpen(false); }}
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm text-rose-400 hover:bg-rose-400/8 transition-colors duration-100">
              <Trash2 size={13} />Удалить
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers]           = useState(MOCK_USERS);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatus]   = useState('all');
  const [selected, setSelected]     = useState([]);

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    return (!search || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.company.toLowerCase().includes(q))
      && (roleFilter === 'all' || u.role === roleFilter)
      && (statusFilter === 'all' || u.status === statusFilter);
  }), [users, search, roleFilter, statusFilter]);

  const allSel = filtered.length > 0 && filtered.every(u => selected.includes(u.id));
  const toggleAll = () => setSelected(allSel ? [] : filtered.map(u => u.id));
  const toggleOne = id => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleStatus = id => setUsers(p => p.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
  const deleteUser = id => { setUsers(p => p.filter(u => u.id !== id)); setSelected(p => p.filter(x => x !== id)); };

  const STATS = [
    { label: 'Всего',           value: users.length,                               icon: Users,     color: 'text-accent',     bg: 'bg-accent/10' },
    { label: 'Пользователей',   value: users.filter(u => u.role === 'user').length,   icon: UserCheck, color: 'text-primary/55', bg: 'bg-primary/8' },
    { label: 'Авторов',         value: users.filter(u => u.role === 'author').length, icon: Edit2,     color: 'text-blue-400',   bg: 'bg-blue-400/10' },
    { label: 'Заблокированных', value: users.filter(u => u.status === 'blocked').length, icon: UserX, color: 'text-rose-400',   bg: 'bg-rose-400/10' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-primary/8 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-primary">Пользователи</h1>
            <p className="text-xs text-primary/40 mt-0.5">Управление учётными записями и ролями</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-primary/10
              text-sm text-primary/55 hover:border-primary/25 hover:text-primary transition-colors duration-150">
              <Download size={14} /><span className="hidden sm:inline">Экспорт</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium
              hover:bg-accent-light transition-colors duration-150">
              <Plus size={15} />Добавить
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map((s, i) => { const Icon = s.icon; return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface border border-primary/8 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <Icon size={16} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-primary/45">{s.label}</p>
              </div>
            </motion.div>
          ); })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-52">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/35" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по имени, email, компании..."
              className="w-full pl-9 pr-9 py-2.5 bg-surface border border-primary/10 rounded-xl text-sm
                text-primary placeholder:text-primary/30 focus:outline-none focus:border-accent/50 transition-colors duration-150" />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/30 hover:text-primary"><X size={13} /></button>}
          </div>
          <div className="flex gap-1 bg-surface border border-primary/8 rounded-xl p-1">
            {[{ k: 'all', l: 'Все' }, { k: 'user', l: 'Пользователи' }, { k: 'author', l: 'Авторы' }, { k: 'admin', l: 'Админы' }].map(f => (
              <button key={f.k} onClick={() => setRoleFilter(f.k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150
                  ${roleFilter === f.k ? 'bg-accent text-white' : 'text-primary/55 hover:text-primary'}`}>{f.l}</button>
            ))}
          </div>
          <div className="flex gap-1 bg-surface border border-primary/8 rounded-xl p-1">
            {[{ k: 'all', l: 'Все' }, { k: 'active', l: 'Активные' }, { k: 'blocked', l: 'Заблок.' }].map(f => (
              <button key={f.k} onClick={() => setStatus(f.k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150
                  ${statusFilter === f.k ? 'bg-accent text-white' : 'text-primary/55 hover:text-primary'}`}>{f.l}</button>
            ))}
          </div>
        </div>

        {/* Bulk bar */}
        <AnimatePresence>
          {selected.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 bg-accent/8 border border-accent/25 rounded-xl px-4 py-2.5">
              <span className="text-sm font-medium text-accent">Выбрано: {selected.length}</span>
              <div className="flex gap-2 ml-auto">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-primary/10
                  text-xs text-primary/60 hover:text-primary transition-colors duration-150">
                  <ShieldOff size={12} />Заблокировать
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-400/10 border border-rose-400/20
                  text-xs text-rose-400 hover:bg-rose-400/20 transition-colors duration-150">
                  <Trash2 size={12} />Удалить
                </button>
                <button onClick={() => setSelected([])} className="text-primary/30 hover:text-primary transition-colors duration-150"><X size={14} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="text-primary/15 mx-auto mb-3" />
              <p className="text-primary/40 text-sm">Пользователи не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/8">
                    <th className="py-3 pl-5 pr-3 w-10">
                      <input type="checkbox" checked={allSel} onChange={toggleAll} className="rounded border-primary/20 accent-accent cursor-pointer" />
                    </th>
                    {['Пользователь', 'Компания', 'Роль', 'Статус', 'Зарегистрирован', ''].map(h => (
                      <th key={h} className="py-3 px-3 text-left text-xs font-semibold text-primary/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, i) => {
                    const sm = STATUS_META[user.status];
                    return (
                      <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-primary/6 hover:bg-primary/3 transition-colors duration-100 group">
                        <td className="py-3.5 pl-5 pr-3">
                          <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleOne(user.id)}
                            className="rounded border-primary/20 accent-accent cursor-pointer" />
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-accent">
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-primary whitespace-nowrap">{user.name}</p>
                              <p className="text-xs text-primary/40 flex items-center gap-1 mt-0.5"><Mail size={10} />{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 hidden md:table-cell">
                          <p className="text-sm text-primary/65 flex items-center gap-1.5 whitespace-nowrap">
                            <Building2 size={12} className="text-primary/30" />{user.company}
                          </p>
                          {user.bin && <p className="text-xs text-primary/35 mt-0.5">БИН: {user.bin}</p>}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap"><RoleBadge role={user.role} /></td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${sm.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />{sm.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 hidden lg:table-cell">
                          <p className="text-xs text-primary/40 whitespace-nowrap">{user.created}</p>
                        </td>
                        <td className="py-3.5 pr-5 pl-3 text-right">
                          <RowMenu user={user} onToggle={() => toggleStatus(user.id)} onDelete={() => deleteUser(user.id)} />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-primary/8">
            <p className="text-xs text-primary/40">Показано {filtered.length} из {users.length}</p>
            <div className="flex gap-1">
              {[1, 2, 3].map(p => (
                <button key={p} className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors duration-150
                  ${p === 1 ? 'bg-accent text-white' : 'text-primary/50 hover:bg-bg hover:text-primary'}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}