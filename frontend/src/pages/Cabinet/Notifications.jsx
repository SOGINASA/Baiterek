import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCircle2, Clock, FileText, AlertCircle,
  Info, CheckCheck, Trash2, ChevronRight,
} from 'lucide-react';

const NOTIF_TYPES = {
  status:   { icon: CheckCircle2, color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  document: { icon: FileText,     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  action:   { icon: AlertCircle,  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  info:     { icon: Info,         color: 'text-primary/50', bg: 'bg-primary/5', border: 'border-primary/10' },
};

const MOCK_NOTIFS = [
  {
    id: 1,
    type: 'action',
    title: 'Требуется загрузка документов',
    body: 'По заявке ZAY-2024-00251 запрошены дополнительные документы: выписка из банка за последние 6 месяцев.',
    time: '2 часа назад',
    app: 'ZAY-2024-00251',
    read: false,
  },
  {
    id: 2,
    type: 'document',
    title: 'Документ ожидает подписи',
    body: 'Акт приёма-передачи оборудования по заявке ZAY-2024-00251 направлен на подписание.',
    time: '5 часов назад',
    app: 'ZAY-2024-00251',
    read: false,
  },
  {
    id: 3,
    type: 'status',
    title: 'Заявка одобрена',
    body: 'Ваша заявка ZAY-2024-00298 на гарантирование кредита одобрена. Сумма гарантии: 15 000 000 ₸.',
    time: '3 дня назад',
    app: 'ZAY-2024-00298',
    read: true,
  },
  {
    id: 4,
    type: 'info',
    title: 'Заявка принята в работу',
    body: 'Ваша заявка ZAY-2024-00342 зарегистрирована и передана на рассмотрение. Ожидайте ответа в течение 5 рабочих дней.',
    time: '5 дней назад',
    app: 'ZAY-2024-00342',
    read: true,
  },
  {
    id: 5,
    type: 'info',
    title: 'Новая мера поддержки',
    body: 'КМБ «Байтерек» запустил программу льготного кредитования для аграрного сектора с ставкой от 6% годовых.',
    time: '1 неделю назад',
    app: null,
    read: true,
  },
];

export default function CabinetNotifications() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifs.filter(n => !n.read).length;

  const markAllRead = () => setNotifs(n => n.map(i => ({ ...i, read: true })));
  const markRead = (id) => setNotifs(n => n.map(i => i.id === id ? { ...i, read: true } : i));
  const deleteNotif = (id) => setNotifs(n => n.filter(i => i.id !== id));

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'action') return n.type === 'action' || n.type === 'document';
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            Уведомления
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-primary/45 text-sm mt-0.5">Статусы заявок и важные события</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary px-3 py-1.5 border border-primary/12 rounded-lg hover:bg-primary/4 transition-colors"
          >
            <CheckCheck size={13} /> Отметить все прочитанными
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-surface border border-primary/8 rounded-xl p-1">
        {[
          { key: 'all',    label: 'Все' },
          { key: 'unread', label: `Непрочитанные${unreadCount ? ` (${unreadCount})` : ''}` },
          { key: 'action', label: 'Требуют действий' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === f.key ? 'bg-bg shadow-sm text-primary border border-primary/8' : 'text-primary/45 hover:text-primary'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Bell size={32} className="mx-auto text-primary/15 mb-3" />
              <p className="text-primary/35 text-sm">Нет уведомлений</p>
            </div>
          )}
          {filtered.map((notif) => {
            const T = NOTIF_TYPES[notif.type];
            const TIcon = T.icon;
            return (
              <motion.div
                key={notif.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  notif.read
                    ? 'bg-surface border-primary/8'
                    : 'bg-surface border-primary/12 ring-2 ring-accent/10'
                }`}
              >
                {!notif.read && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                )}

                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${T.bg} ${T.border}`}>
                  <TIcon size={16} className={T.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold ${notif.read ? 'text-primary/70' : 'text-primary'}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-primary/30 flex-shrink-0 mt-0.5">{notif.time}</span>
                  </div>
                  <p className="text-xs text-primary/50 mt-1 leading-relaxed">{notif.body}</p>
                  {notif.app && (
                    <div className="flex items-center gap-3 mt-2">
                      <button className="flex items-center gap-1 text-xs text-accent hover:text-accent-light font-medium transition-colors">
                        Перейти к заявке #{notif.app} <ChevronRight size={11} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1 flex-shrink-0">
                  {!notif.read && (
                    <button
                      onClick={() => markRead(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-primary/8 text-primary/30 hover:text-primary transition-colors"
                      title="Отметить прочитанным"
                    >
                      <CheckCheck size={13} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotif(notif.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-primary/20 hover:text-red-500 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}