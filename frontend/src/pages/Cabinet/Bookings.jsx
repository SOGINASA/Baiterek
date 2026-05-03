import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  Clock,
  MapPin,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertCircle,
  Phone,
  User,
  ChevronDown,
  Ticket,
} from 'lucide-react';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const BOOKINGS = [
  {
    id: 'BK-1041',
    org: 'КМФ',
    orgColor: '#2563eb',
    service: 'Консультация по микрокредиту',
    address: 'г. Астана, пр. Республики, 13',
    date: '2026-05-07',
    dateLabel: '7 мая 2026',
    time: '11:00',
    manager: 'Айгерим Сарсенова',
    phone: '+7 701 234 56 78',
    status: 'upcoming',
    ticket: 'A-047',
  },
  {
    id: 'BK-1038',
    org: 'КазГарант',
    orgColor: '#059669',
    service: 'Подача документов на гарантию',
    address: 'г. Астана, ул. Сыганак, 29',
    date: '2026-04-28',
    dateLabel: '28 апреля 2026',
    time: '14:30',
    manager: 'Берик Жуманов',
    phone: '+7 777 345 67 89',
    status: 'completed',
    ticket: 'B-012',
  },
  {
    id: 'BK-1031',
    org: 'БРК',
    orgColor: '#7c3aed',
    service: 'Консультация по инвестиционному займу',
    address: 'г. Астана, ул. Достык, 5',
    date: '2026-04-15',
    dateLabel: '15 апреля 2026',
    time: '10:00',
    manager: 'Дана Мухамедова',
    phone: '+7 705 456 78 90',
    status: 'completed',
    ticket: 'C-088',
  },
  {
    id: 'BK-1044',
    org: 'БРК-Лизинг',
    orgColor: '#d97706',
    service: 'Оформление лизинга оборудования',
    address: 'г. Алматы, пр. Аль-Фараби, 77/8',
    date: '2026-05-14',
    dateLabel: '14 мая 2026',
    time: '09:30',
    manager: 'Нуржан Асанов',
    phone: '+7 747 567 89 01',
    status: 'upcoming',
    ticket: 'D-003',
  },
];

const ORGS = [
  { id: 'kmf',      name: 'КМФ',        color: '#2563eb', slots: ['09:00','10:00','11:00','14:00','15:00','16:00'] },
  { id: 'kazgar',   name: 'КазГарант',  color: '#059669', slots: ['09:30','10:30','13:00','14:30','15:30'] },
  { id: 'brk',      name: 'БРК',        color: '#7c3aed', slots: ['10:00','11:00','13:30','15:00','16:30'] },
  { id: 'brkliz',   name: 'БРК-Лизинг',color: '#d97706', slots: ['09:00','10:30','12:00','14:00','16:00'] },
];

const SERVICES_BY_ORG = {
  kmf:    ['Консультация по микрокредиту', 'Подача заявки на кредит', 'Проверка статуса'],
  kazgar: ['Консультация по гарантии', 'Подача документов на гарантию'],
  brk:    ['Консультация по займу', 'Инвестиционный заём — документы'],
  brkliz: ['Консультация по лизингу', 'Оформление лизинга оборудования'],
};

const STATUS_CONFIG = {
  upcoming:  { label: 'Предстоит',  cls: 'bg-accent/12 text-accent',           dot: 'bg-accent' },
  completed: { label: 'Завершено',  cls: 'bg-emerald-500/12 text-emerald-600', dot: 'bg-emerald-500' },
  cancelled: { label: 'Отменено',   cls: 'bg-red-400/12 text-red-500',         dot: 'bg-red-400' },
};

// ─── Mini calendar helpers ────────────────────────────────────────────────────

const DAYS = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7; // Mon-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

// ─── New Booking Modal ────────────────────────────────────────────────────────

const NewBookingModal = ({ onClose, onSave }) => {
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [step, setStep] = useState(1); // 1=org+date, 2=time+service, 3=confirm

  const cells = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth]);
  const org = ORGS.find(o => o.id === selectedOrg);
  const services = selectedOrg ? SERVICES_BY_ORG[selectedOrg] : [];

  const prevMonth = () => {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  };

  const canNext1 = selectedOrg && selectedDay;
  const canNext2 = selectedSlot && selectedService;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/20 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface border border-primary/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/8">
          <div>
            <h2 className="text-base font-bold text-primary">Новая запись</h2>
            <p className="text-xs text-primary/45 mt-0.5">Шаг {step} из 3</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-bg text-primary/40 hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-primary/8">
          <motion.div
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-accent"
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6 space-y-5">
          <AnimatePresence mode="wait">

            {/* Step 1 — org + calendar */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-primary/50 mb-2">Организация</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ORGS.map(o => (
                      <button
                        key={o.id}
                        onClick={() => setSelectedOrg(o.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                          selectedOrg === o.id
                            ? 'border-accent/50 bg-accent/8 text-primary'
                            : 'border-primary/10 text-primary/65 hover:border-primary/25 hover:text-primary'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: o.color }} />
                        {o.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-primary/50 mb-2">Выберите дату</p>
                  <div className="border border-primary/10 rounded-xl overflow-hidden">
                    {/* Cal nav */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary/8 bg-bg/40">
                      <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg text-primary/40 hover:text-primary transition-colors"><ChevronLeft size={14} /></button>
                      <span className="text-sm font-medium text-primary">{MONTHS[calMonth]} {calYear}</span>
                      <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-bg text-primary/40 hover:text-primary transition-colors"><ChevronRight size={14} /></button>
                    </div>
                    {/* Day labels */}
                    <div className="grid grid-cols-7 px-3 pt-2">
                      {DAYS.map(d => <div key={d} className="text-center text-xs text-primary/35 py-1">{d}</div>)}
                    </div>
                    {/* Cells */}
                    <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
                      {cells.map((day, i) => {
                        const isPast = day && new Date(calYear, calMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const isSelected = day === selectedDay && calMonth === today.getMonth();
                        const isToday = day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear();
                        return (
                          <button
                            key={i}
                            disabled={!day || isPast}
                            onClick={() => day && !isPast && setSelectedDay(day)}
                            className={`h-8 w-full rounded-lg text-xs font-medium transition-colors ${
                              !day ? 'invisible' :
                              isPast ? 'text-primary/20 cursor-not-allowed' :
                              isSelected ? 'bg-accent text-white' :
                              isToday ? 'border border-accent/50 text-accent' :
                              'text-primary hover:bg-bg'
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 — time slot + service */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-primary/50 mb-2">Доступное время</p>
                  <div className="grid grid-cols-3 gap-2">
                    {org?.slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 rounded-xl border text-sm font-medium transition-colors ${
                          selectedSlot === slot
                            ? 'border-accent/50 bg-accent/8 text-accent'
                            : 'border-primary/10 text-primary/65 hover:border-primary/25 hover:text-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary/50 mb-2">Цель визита</p>
                  <div className="space-y-2">
                    {services.map(svc => (
                      <button
                        key={svc}
                        onClick={() => setSelectedService(svc)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors ${
                          selectedService === svc
                            ? 'border-accent/50 bg-accent/8 text-primary'
                            : 'border-primary/10 text-primary/65 hover:border-primary/25 hover:text-primary'
                        }`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 — confirm */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-3">
                <div className="bg-bg rounded-xl border border-primary/8 divide-y divide-primary/6">
                  {[
                    { label: 'Организация', value: org?.name },
                    { label: 'Услуга',      value: selectedService },
                    { label: 'Дата',        value: `${selectedDay} ${MONTHS[calMonth]} ${calYear}` },
                    { label: 'Время',       value: selectedSlot },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs text-primary/45">{row.label}</span>
                      <span className="text-sm font-medium text-primary">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2.5 px-4 py-3 bg-amber-400/8 border border-amber-400/20 rounded-xl">
                  <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">Приходите за 10 минут до начала. При опоздании более 15 минут запись аннулируется.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-primary/8 bg-bg/30">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="px-4 py-2 rounded-xl border border-primary/12 text-sm text-primary/60 hover:text-primary hover:bg-bg transition-colors"
          >
            {step === 1 ? 'Отмена' : '← Назад'}
          </button>
          {step < 3 ? (
            <button
              disabled={step === 1 ? !canNext1 : !canNext2}
              onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
            >
              Далее →
            </button>
          ) : (
            <button
              onClick={() => { onSave(); onClose(); }}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent hover:bg-accent-dark text-white text-sm font-medium transition-colors"
            >
              <Check size={15} /> Подтвердить
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// ─── Booking Card ─────────────────────────────────────────────────────────────

const BookingCard = ({ booking, onCancel }) => {
  const { label, cls, dot } = STATUS_CONFIG[booking.status];
  const isUpcoming = booking.status === 'upcoming';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="bg-surface border border-primary/8 rounded-2xl overflow-hidden"
    >
      {/* Color stripe */}
      <div className="h-1" style={{ backgroundColor: booking.orgColor }} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
              <span className="text-xs font-medium text-primary/50">{booking.org}</span>
              <span className="text-xs text-primary/25">·</span>
              <span className="text-xs font-mono text-primary/35">{booking.id}</span>
            </div>
            <h3 className="text-sm font-semibold text-primary leading-snug">{booking.service}</h3>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${cls}`}>
            {label}
          </span>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
              <CalendarDays size={13} className="text-primary/50" />
            </div>
            <div>
              <p className="text-xs text-primary/40">Дата</p>
              <p className="text-xs font-medium text-primary">{booking.dateLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
              <Clock size={13} className="text-primary/50" />
            </div>
            <div>
              <p className="text-xs text-primary/40">Время</p>
              <p className="text-xs font-medium text-primary">{booking.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <div className="w-7 h-7 rounded-lg bg-bg flex items-center justify-center flex-shrink-0">
              <MapPin size={13} className="text-primary/50" />
            </div>
            <p className="text-xs text-primary/60 leading-snug">{booking.address}</p>
          </div>
        </div>

        {/* Manager + ticket */}
        <div className="flex items-center justify-between pt-3 border-t border-primary/8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center text-accent text-[10px] font-bold flex-shrink-0">
              {booking.manager[0]}
            </div>
            <span className="text-xs text-primary/55">{booking.manager}</span>
          </div>
          <div className="flex items-center gap-2">
            {isUpcoming && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 rounded-full">
                <Ticket size={11} className="text-accent" />
                <span className="text-xs font-bold text-accent">{booking.ticket}</span>
              </div>
            )}
            {isUpcoming && (
              <button
                onClick={() => onCancel(booking.id)}
                className="text-xs text-red-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-400/8"
              >
                Отменить
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CabinetBookings() {
  const [bookings, setBookings] = useState(BOOKINGS);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() =>
    bookings.filter(b => filter === 'all' || b.status === filter),
    [bookings, filter]
  );

  const upcoming = bookings.filter(b => b.status === 'upcoming').length;
  const completed = bookings.filter(b => b.status === 'completed').length;

  const handleCancel = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Мои записи</h1>
          <p className="text-primary/50 text-sm mt-0.5">Управление онлайн-бронированием очереди</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-medium rounded-xl transition-colors duration-150"
        >
          <Plus size={16} />
          Записаться
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Всего записей', value: bookings.length, cls: 'text-primary' },
          { label: 'Предстоит',     value: upcoming,         cls: 'text-accent' },
          { label: 'Завершено',     value: completed,        cls: 'text-emerald-600' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-surface border border-primary/8 rounded-xl px-4 py-3 text-center"
          >
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-primary/45 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-bg border border-primary/10 rounded-xl p-1 w-fit">
        {[
          { id: 'all',       label: 'Все' },
          { id: 'upcoming',  label: 'Предстоящие' },
          { id: 'completed', label: 'Завершённые' },
          { id: 'cancelled', label: 'Отменённые' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab.id
                ? 'bg-surface text-primary shadow-sm border border-primary/10'
                : 'text-primary/50 hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(b => (
            <BookingCard key={b.id} booking={b} onCancel={handleCancel} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-2 py-16 text-center text-primary/40 text-sm">
            Записей не найдено
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <NewBookingModal
            onClose={() => setShowModal(false)}
            onSave={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}