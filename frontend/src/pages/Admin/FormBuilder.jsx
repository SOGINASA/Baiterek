import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Type, AlignLeft, Hash, Mail, Phone, Calendar, List,
  CheckSquare, ToggleLeft, Upload, Link2, ChevronDown,
  Plus, Trash2, Copy, Eye, Save, Settings, GripVertical,
  X, Check, AlertCircle, ChevronRight, Layers, FileText,
  ArrowLeft, Sparkles,
} from 'lucide-react';

// ─── Field type registry ──────────────────────────────────────────────────────
const FIELD_TYPES = [
  { type: 'text',     label: 'Текст (строка)',    icon: Type,        color: 'text-blue-400',    bg: 'bg-blue-400/10' },
  { type: 'textarea', label: 'Текст (абзац)',     icon: AlignLeft,   color: 'text-indigo-400',  bg: 'bg-indigo-400/10' },
  { type: 'number',   label: 'Число',             icon: Hash,        color: 'text-violet-400',  bg: 'bg-violet-400/10' },
  { type: 'email',    label: 'Email',             icon: Mail,        color: 'text-cyan-400',    bg: 'bg-cyan-400/10' },
  { type: 'phone',    label: 'Телефон',           icon: Phone,       color: 'text-teal-400',    bg: 'bg-teal-400/10' },
  { type: 'date',     label: 'Дата',              icon: Calendar,    color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  { type: 'select',   label: 'Выпадающий список', icon: List,        color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
  { type: 'checkbox', label: 'Чекбокс',           icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { type: 'toggle',   label: 'Переключатель',     icon: ToggleLeft,  color: 'text-green-400',   bg: 'bg-green-400/10' },
  { type: 'file',     label: 'Загрузка файла',    icon: Upload,      color: 'text-rose-400',    bg: 'bg-rose-400/10' },
  { type: 'url',      label: 'Ссылка (URL)',       icon: Link2,       color: 'text-pink-400',    bg: 'bg-pink-400/10' },
];

const TYPE_MAP = Object.fromEntries(FIELD_TYPES.map(f => [f.type, f]));

// ─── Initial demo form ────────────────────────────────────────────────────────
let _id = 10;
const uid = () => `field_${++_id}`;

const DEMO_FIELDS = [
  { id: 'field_1', type: 'text',     label: 'Наименование организации', placeholder: 'ТОО «Название»',      required: true,  hint: '',                         width: 'full' },
  { id: 'field_2', type: 'text',     label: 'БИН/ИИН',                  placeholder: '12 цифр',             required: true,  hint: 'Бизнес-идентификационный номер', width: 'half' },
  { id: 'field_3', type: 'phone',    label: 'Контактный телефон',        placeholder: '+7 (___) ___-__-__', required: true,  hint: '',                         width: 'half' },
  { id: 'field_4', type: 'number',   label: 'Запрашиваемая сумма (₸)',   placeholder: '0',                  required: true,  hint: 'Минимум 1 000 000 тенге',  width: 'half' },
  { id: 'field_5', type: 'select',   label: 'Цель финансирования',       placeholder: '',                   required: true,  hint: '',                         width: 'half',
    options: ['Пополнение оборотных средств', 'Приобретение оборудования', 'Строительство', 'Другое'] },
  { id: 'field_6', type: 'textarea', label: 'Описание проекта',          placeholder: 'Опишите суть проекта и как будут использованы средства...', required: false, hint: 'До 2000 символов', width: 'full' },
  { id: 'field_7', type: 'file',     label: 'Финансовая отчётность',     placeholder: '',                   required: true,  hint: 'PDF, XLSX — до 10 МБ',    width: 'full',
    accept: '.pdf,.xlsx,.xls', multiple: true },
  { id: 'field_8', type: 'checkbox', label: 'Согласие на обработку персональных данных', placeholder: '', required: true, hint: '', width: 'full' },
];

// ─── Defaults per type ────────────────────────────────────────────────────────
const typeDefaults = (type) => ({
  id: uid(), type, label: TYPE_MAP[type]?.label ?? 'Поле',
  placeholder: '', required: false, hint: '', width: 'full',
  ...(type === 'select'   ? { options: ['Вариант 1', 'Вариант 2'] } : {}),
  ...(type === 'file'     ? { accept: '.pdf', multiple: false }      : {}),
  ...(type === 'number'   ? { min: '', max: '' }                     : {}),
});

// ─── Field preview renderer ───────────────────────────────────────────────────
function FieldPreview({ field }) {
  const baseInput = 'w-full px-3.5 py-2.5 bg-bg border border-primary/12 rounded-xl text-sm text-primary/40 placeholder:text-primary/25 pointer-events-none';

  return (
    <div className={`${field.width === 'half' ? 'col-span-1' : 'col-span-2'}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-medium text-primary/70">{field.label || 'Без названия'}</label>
        {field.required && <span className="text-rose-400 text-xs">*</span>}
      </div>

      {field.type === 'text'     && <input type="text" placeholder={field.placeholder || 'Введите текст...'} readOnly className={baseInput} />}
      {field.type === 'textarea' && <textarea placeholder={field.placeholder || 'Введите текст...'} readOnly rows={3} className={`${baseInput} resize-none`} />}
      {field.type === 'number'   && <input type="text" placeholder={field.placeholder || '0'} readOnly className={baseInput} />}
      {field.type === 'email'    && <input type="text" placeholder={field.placeholder || 'example@mail.kz'} readOnly className={baseInput} />}
      {field.type === 'phone'    && <input type="text" placeholder={field.placeholder || '+7 (___) ___-__-__'} readOnly className={baseInput} />}
      {field.type === 'date'     && <input type="text" placeholder="дд.мм.гггг" readOnly className={baseInput} />}
      {field.type === 'url'      && <input type="text" placeholder={field.placeholder || 'https://'} readOnly className={baseInput} />}

      {field.type === 'select' && (
        <div className={`${baseInput} flex items-center justify-between`}>
          <span>{field.options?.[0] ?? 'Выберите...'}</span>
          <ChevronDown size={14} className="text-primary/25" />
        </div>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-start gap-2.5 cursor-pointer">
          <div className="w-4 h-4 rounded border border-primary/20 bg-bg flex-shrink-0 mt-0.5" />
          <span className="text-xs text-primary/55">{field.label || 'Чекбокс'}</span>
        </label>
      )}

      {field.type === 'toggle' && (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-5 rounded-full bg-primary/12 flex items-center px-0.5">
            <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
          </div>
          <span className="text-xs text-primary/55">{field.label}</span>
        </div>
      )}

      {field.type === 'file' && (
        <div className={`${baseInput} flex items-center gap-2`}>
          <Upload size={13} className="text-primary/25 flex-shrink-0" />
          <span className="text-xs">Выберите файл{field.multiple ? 'ы' : ''}... {field.accept && `(${field.accept})`}</span>
        </div>
      )}

      {field.hint && <p className="text-[10px] text-primary/35 mt-1">{field.hint}</p>}
    </div>
  );
}

// ─── Field card in canvas ─────────────────────────────────────────────────────
function FieldCard({ field, selected, onSelect, onDelete, onDuplicate }) {
  const meta = TYPE_MAP[field.type];
  const Icon = meta?.icon ?? Type;

  return (
    <motion.div layout transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className={`${field.width === 'half' ? 'col-span-1' : 'col-span-2'}`}>
      <div
        onClick={() => onSelect(field.id)}
        className={`relative group rounded-xl border-2 p-4 cursor-pointer transition-all duration-150
          ${selected
            ? 'border-accent bg-accent/5 shadow-sm'
            : 'border-primary/8 bg-surface hover:border-primary/20'}`}
      >
        {/* Drag handle */}
        <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity duration-150 cursor-grab">
          <GripVertical size={14} className="text-primary" />
        </div>

        {/* Type badge */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${meta?.bg}`}>
            <Icon size={11} className={meta?.color} />
          </div>
          <span className="text-[10px] font-semibold text-primary/35 uppercase tracking-wider">{meta?.label}</span>
          {field.required && <span className="text-[10px] text-rose-400 font-medium ml-auto">Обязательное</span>}
        </div>

        <FieldPreview field={field} />

        {/* Actions */}
        <div className={`absolute top-2.5 right-2.5 flex gap-1 transition-opacity duration-150
          ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button onClick={e => { e.stopPropagation(); onDuplicate(field.id); }}
            className="w-6 h-6 rounded-lg bg-surface border border-primary/10 flex items-center justify-center
              text-primary/40 hover:text-primary hover:border-primary/25 transition-colors duration-100">
            <Copy size={11} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(field.id); }}
            className="w-6 h-6 rounded-lg bg-surface border border-primary/10 flex items-center justify-center
              text-primary/40 hover:text-rose-400 hover:border-rose-400/30 transition-colors duration-100">
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Field settings panel ─────────────────────────────────────────────────────
function SettingsPanel({ field, onChange, onClose }) {
  if (!field) return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="w-12 h-12 rounded-2xl bg-primary/6 flex items-center justify-center mb-3">
        <Settings size={20} className="text-primary/25" />
      </div>
      <p className="text-sm font-medium text-primary/40">Выберите поле</p>
      <p className="text-xs text-primary/25 mt-1">Нажмите на поле в конструкторе для редактирования</p>
    </div>
  );

  const set = (key, val) => onChange({ ...field, [key]: val });

  const updateOption = (i, val) => {
    const opts = [...(field.options ?? [])];
    opts[i] = val;
    set('options', opts);
  };
  const addOption    = ()  => set('options', [...(field.options ?? []), `Вариант ${(field.options?.length ?? 0) + 1}`]);
  const removeOption = (i) => set('options', field.options.filter((_, j) => j !== i));

  const meta = TYPE_MAP[field.type];
  const Icon = meta?.icon ?? Type;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-primary/8 flex-shrink-0">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${meta?.bg}`}>
          <Icon size={14} className={meta?.color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary truncate">{field.label || 'Без названия'}</p>
          <p className="text-xs text-primary/35">{meta?.label}</p>
        </div>
        <button onClick={onClose} className="text-primary/30 hover:text-primary transition-colors duration-150 flex-shrink-0">
          <X size={15} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Label */}
        <div>
          <label className="block text-xs font-medium text-primary/55 mb-1.5">Название поля *</label>
          <input value={field.label} onChange={e => set('label', e.target.value)}
            placeholder="Введите название..."
            className="w-full px-3 py-2 bg-bg border border-primary/10 rounded-xl text-sm text-primary
              placeholder:text-primary/25 focus:outline-none focus:border-accent/50 transition-colors duration-150" />
        </div>

        {/* Placeholder (not for checkbox/toggle/file) */}
        {!['checkbox', 'toggle', 'file'].includes(field.type) && (
          <div>
            <label className="block text-xs font-medium text-primary/55 mb-1.5">Подсказка в поле</label>
            <input value={field.placeholder} onChange={e => set('placeholder', e.target.value)}
              placeholder="Placeholder..."
              className="w-full px-3 py-2 bg-bg border border-primary/10 rounded-xl text-sm text-primary
                placeholder:text-primary/25 focus:outline-none focus:border-accent/50 transition-colors duration-150" />
          </div>
        )}

        {/* Hint */}
        <div>
          <label className="block text-xs font-medium text-primary/55 mb-1.5">Подсказка под полем</label>
          <input value={field.hint} onChange={e => set('hint', e.target.value)}
            placeholder="Поясняющий текст..."
            className="w-full px-3 py-2 bg-bg border border-primary/10 rounded-xl text-sm text-primary
              placeholder:text-primary/25 focus:outline-none focus:border-accent/50 transition-colors duration-150" />
        </div>

        {/* Width */}
        <div>
          <label className="block text-xs font-medium text-primary/55 mb-1.5">Ширина</label>
          <div className="flex gap-1.5">
            {[{ v: 'full', l: 'На всю ширину' }, { v: 'half', l: 'Половина' }].map(opt => (
              <button key={opt.v} onClick={() => set('width', opt.v)}
                className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors duration-150
                  ${field.width === opt.v
                    ? 'bg-accent text-white border-accent'
                    : 'bg-bg border-primary/10 text-primary/55 hover:border-primary/25 hover:text-primary'}`}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* Required toggle */}
        <div className="flex items-center justify-between py-2.5 border-b border-primary/6">
          <div>
            <p className="text-sm font-medium text-primary">Обязательное поле</p>
            <p className="text-xs text-primary/35 mt-0.5">Нельзя пропустить при заполнении</p>
          </div>
          <button onClick={() => set('required', !field.required)}
            className={`w-10 h-6 rounded-full border transition-colors duration-200 flex items-center px-0.5
              ${field.required ? 'bg-accent border-accent' : 'bg-primary/10 border-primary/15'}`}>
            <motion.div animate={{ x: field.required ? 16 : 0 }} transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        {/* Number min/max */}
        {field.type === 'number' && (
          <div className="grid grid-cols-2 gap-3">
            {[{ k: 'min', l: 'Минимум' }, { k: 'max', l: 'Максимум' }].map(f => (
              <div key={f.k}>
                <label className="block text-xs font-medium text-primary/55 mb-1.5">{f.l}</label>
                <input type="number" value={field[f.k] ?? ''} onChange={e => set(f.k, e.target.value)}
                  placeholder="—"
                  className="w-full px-3 py-2 bg-bg border border-primary/10 rounded-xl text-sm text-primary
                    placeholder:text-primary/25 focus:outline-none focus:border-accent/50 transition-colors duration-150" />
              </div>
            ))}
          </div>
        )}

        {/* File options */}
        {field.type === 'file' && (
          <>
            <div>
              <label className="block text-xs font-medium text-primary/55 mb-1.5">Допустимые форматы</label>
              <input value={field.accept ?? ''} onChange={e => set('accept', e.target.value)}
                placeholder=".pdf,.xlsx,.docx"
                className="w-full px-3 py-2 bg-bg border border-primary/10 rounded-xl text-sm text-primary
                  placeholder:text-primary/25 focus:outline-none focus:border-accent/50 transition-colors duration-150" />
            </div>
            <div className="flex items-center justify-between py-2.5 border-b border-primary/6">
              <p className="text-sm font-medium text-primary">Несколько файлов</p>
              <button onClick={() => set('multiple', !field.multiple)}
                className={`w-10 h-6 rounded-full border transition-colors duration-200 flex items-center px-0.5
                  ${field.multiple ? 'bg-accent border-accent' : 'bg-primary/10 border-primary/15'}`}>
                <motion.div animate={{ x: field.multiple ? 16 : 0 }} transition={{ duration: 0.2 }}
                  className="w-5 h-5 rounded-full bg-white shadow-sm" />
              </button>
            </div>
          </>
        )}

        {/* Select options */}
        {field.type === 'select' && (
          <div>
            <label className="block text-xs font-medium text-primary/55 mb-2">Варианты выбора</label>
            <div className="space-y-1.5">
              <AnimatePresence>
                {(field.options ?? []).map((opt, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}
                    className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] text-primary/30 bg-primary/6 flex-shrink-0 font-mono">
                      {i + 1}
                    </div>
                    <input value={opt} onChange={e => updateOption(i, e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-bg border border-primary/10 rounded-lg text-sm text-primary
                        focus:outline-none focus:border-accent/50 transition-colors duration-150" />
                    <button onClick={() => removeOption(i)}
                      className="w-6 h-6 flex items-center justify-center text-primary/25 hover:text-rose-400 transition-colors duration-100 flex-shrink-0">
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button onClick={addOption}
              className="mt-2 flex items-center gap-1.5 text-xs text-accent hover:text-accent-light transition-colors duration-150">
              <Plus size={12} />Добавить вариант
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FormBuilder() {
  const [fields, setFields]       = useState(DEMO_FIELDS);
  const [selectedId, setSelected] = useState(null);
  const [view, setView]           = useState('build'); // build | preview
  const [formTitle, setFormTitle] = useState('Заявка на микрокредитование МСБ');
  const [saved, setSaved]         = useState(false);
  const [draggingType, setDragType] = useState(null);
  const canvasRef                 = useRef(null);

  const selected = fields.find(f => f.id === selectedId) ?? null;

  const addField = useCallback((type) => {
    const newField = typeDefaults(type);
    setFields(prev => [...prev, newField]);
    setSelected(newField.id);
    setTimeout(() => canvasRef.current?.scrollTo({ top: 9999, behavior: 'smooth' }), 50);
  }, []);

  const updateField = useCallback((updated) => {
    setFields(prev => prev.map(f => f.id === updated.id ? updated : f));
  }, []);

  const deleteField = useCallback((id) => {
    setFields(prev => prev.filter(f => f.id !== id));
    setSelected(prev => prev === id ? null : prev);
  }, []);

  const duplicateField = useCallback((id) => {
    const src = fields.find(f => f.id === id);
    if (!src) return;
    const copy = { ...src, id: uid(), label: src.label + ' (копия)' };
    const idx  = fields.findIndex(f => f.id === id);
    const next = [...fields];
    next.splice(idx + 1, 0, copy);
    setFields(next);
    setSelected(copy.id);
  }, [fields]);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Drag from palette
  const handlePaletteDragStart = (type) => setDragType(type);
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    if (draggingType) { addField(draggingType); setDragType(null); }
  };

  return (
    <div className="h-screen bg-bg flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="bg-surface border-b border-primary/8 px-5 py-3 flex items-center gap-4 flex-shrink-0 z-10">
        <button className="flex items-center gap-1.5 text-sm text-primary/50 hover:text-primary transition-colors duration-150">
          <ArrowLeft size={15} /><span className="hidden sm:inline">Назад</span>
        </button>

        <div className="w-px h-5 bg-primary/10" />

        <div className="flex-1 min-w-0">
          <input value={formTitle} onChange={e => setFormTitle(e.target.value)}
            className="text-sm font-semibold text-primary bg-transparent border-none outline-none w-full truncate" />
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* View toggle */}
          <div className="flex gap-0.5 bg-bg border border-primary/10 rounded-xl p-0.5">
            {[{ v: 'build', icon: Layers, l: 'Конструктор' }, { v: 'preview', icon: Eye, l: 'Превью' }].map(opt => {
              const Icon = opt.icon;
              return (
                <button key={opt.v} onClick={() => setView(opt.v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150
                    ${view === opt.v ? 'bg-accent text-white' : 'text-primary/50 hover:text-primary'}`}>
                  <Icon size={13} />{opt.l}
                </button>
              );
            })}
          </div>

          <button onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
              ${saved ? 'bg-emerald-400/15 text-emerald-400 border border-emerald-400/25' : 'bg-accent text-white hover:bg-accent-light'}`}>
            {saved ? <><Check size={14} />Сохранено</> : <><Save size={14} />Сохранить</>}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">

        {view === 'build' ? (
          <>
            {/* ── Left palette ── */}
            <div className="w-56 flex-shrink-0 bg-surface border-r border-primary/8 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-primary/8">
                <p className="text-xs font-semibold text-primary/40 uppercase tracking-wider">Типы полей</p>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                {FIELD_TYPES.map(ft => {
                  const Icon = ft.icon;
                  return (
                    <button key={ft.type}
                      draggable
                      onDragStart={() => handlePaletteDragStart(ft.type)}
                      onDragEnd={() => setDragType(null)}
                      onClick={() => addField(ft.type)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left
                        hover:bg-bg border border-transparent hover:border-primary/8
                        transition-colors duration-100 group cursor-grab active:cursor-grabbing">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${ft.bg}`}>
                        <Icon size={13} className={ft.color} />
                      </div>
                      <span className="text-xs font-medium text-primary/65 group-hover:text-primary transition-colors duration-100 leading-tight">
                        {ft.label}
                      </span>
                      <Plus size={12} className="text-primary/20 group-hover:text-accent ml-auto flex-shrink-0 transition-colors duration-100" />
                    </button>
                  );
                })}
              </div>
              <div className="px-3 py-3 border-t border-primary/8">
                <div className="flex items-start gap-2 bg-accent/6 border border-accent/15 rounded-xl px-3 py-2.5">
                  <Sparkles size={12} className="text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-primary/50 leading-relaxed">Нажмите или перетащите поле на холст</p>
                </div>
              </div>
            </div>

            {/* ── Center canvas ── */}
            <div ref={canvasRef}
              className="flex-1 overflow-y-auto"
              onDragOver={e => e.preventDefault()}
              onDrop={handleCanvasDrop}
            >
              <div className="max-w-3xl mx-auto px-6 py-6">
                {/* Form meta */}
                <div className="bg-surface border border-primary/8 rounded-2xl p-5 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <FileText size={16} className="text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-primary">{formTitle}</p>
                      <p className="text-xs text-primary/40 mt-0.5">{fields.length} полей · {fields.filter(f => f.required).length} обязательных</p>
                    </div>
                  </div>
                </div>

                {/* Fields grid */}
                {fields.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-2 border-dashed border-primary/12 rounded-2xl py-20 text-center">
                    <Plus size={28} className="text-primary/20 mx-auto mb-3" />
                    <p className="text-sm font-medium text-primary/35">Добавьте первое поле</p>
                    <p className="text-xs text-primary/25 mt-1">Выберите тип поля из панели слева</p>
                  </motion.div>
                ) : (
                  <Reorder.Group axis="y" values={fields} onReorder={setFields} className="grid grid-cols-2 gap-3">
                    <AnimatePresence>
                      {fields.map(field => (
                        <Reorder.Item key={field.id} value={field}
                          className={field.width === 'half' ? 'col-span-1' : 'col-span-2'}>
                          <FieldCard
                            field={field}
                            selected={selectedId === field.id}
                            onSelect={setSelected}
                            onDelete={deleteField}
                            onDuplicate={duplicateField}
                          />
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                )}

                {/* Drop zone hint */}
                {draggingType && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-3 border-2 border-dashed border-accent/40 rounded-2xl py-6 text-center">
                    <p className="text-sm text-accent/70">Отпустите, чтобы добавить поле</p>
                  </motion.div>
                )}

                {/* Add field shortcut */}
                {fields.length > 0 && (
                  <button onClick={() => addField('text')}
                    className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/10
                      rounded-2xl py-3.5 text-sm text-primary/30 hover:border-accent/30 hover:text-accent
                      transition-colors duration-150">
                    <Plus size={15} />Добавить поле
                  </button>
                )}
              </div>
            </div>

            {/* ── Right settings ── */}
            <AnimatePresence>
              <motion.div
                key={selectedId ?? 'empty'}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="w-72 flex-shrink-0 bg-surface border-l border-primary/8 flex flex-col overflow-hidden"
              >
                <SettingsPanel
                  field={selected}
                  onChange={updateField}
                  onClose={() => setSelected(null)}
                />
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          /* ── Preview mode ── */
          <div className="flex-1 overflow-y-auto bg-bg">
            <div className="max-w-2xl mx-auto px-6 py-10">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}>

                <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
                  {/* Form header */}
                  <div className="bg-primary px-7 py-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                      <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Форма заявки</p>
                    </div>
                    <h2 className="text-xl font-bold text-white">{formTitle}</h2>
                    <p className="text-white/40 text-sm mt-1">{fields.filter(f => f.required).length} обязательных поля из {fields.length}</p>
                  </div>

                  <div className="p-7">
                    <div className="grid grid-cols-2 gap-5">
                      {fields.map(field => {
                        const baseInput = 'w-full px-3.5 py-2.5 bg-bg border border-primary/12 rounded-xl text-sm text-primary focus:outline-none focus:border-accent/50 transition-colors duration-150';
                        return (
                          <div key={field.id} className={field.width === 'half' ? 'col-span-1' : 'col-span-2'}>
                            {field.type !== 'checkbox' && field.type !== 'toggle' && (
                              <div className="flex items-center gap-1 mb-1.5">
                                <label className="text-xs font-medium text-primary/70">{field.label}</label>
                                {field.required && <span className="text-rose-400 text-xs">*</span>}
                              </div>
                            )}

                            {field.type === 'text'     && <input type="text"  placeholder={field.placeholder} className={baseInput} />}
                            {field.type === 'textarea' && <textarea placeholder={field.placeholder} rows={3} className={`${baseInput} resize-none`} />}
                            {field.type === 'number'   && <input type="number" placeholder={field.placeholder || '0'} className={baseInput} />}
                            {field.type === 'email'    && <input type="email" placeholder={field.placeholder || 'example@mail.kz'} className={baseInput} />}
                            {field.type === 'phone'    && <input type="tel"   placeholder={field.placeholder || '+7 (___) ___-__-__'} className={baseInput} />}
                            {field.type === 'date'     && <input type="date"  className={baseInput} />}
                            {field.type === 'url'      && <input type="url"   placeholder={field.placeholder || 'https://'} className={baseInput} />}
                            {field.type === 'select'   && (
                              <select className={`${baseInput} cursor-pointer`}>
                                <option value="">Выберите...</option>
                                {(field.options ?? []).map((o, i) => <option key={i}>{o}</option>)}
                              </select>
                            )}
                            {field.type === 'checkbox' && (
                              <label className="flex items-start gap-2.5 cursor-pointer group">
                                <input type="checkbox" className="mt-0.5 accent-accent cursor-pointer" />
                                <span className="text-sm text-primary/70 group-hover:text-primary transition-colors duration-150">
                                  {field.label}{field.required && <span className="text-rose-400 ml-0.5">*</span>}
                                </span>
                              </label>
                            )}
                            {field.type === 'toggle' && (
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-9 h-5 rounded-full bg-primary/15 peer-checked:bg-accent transition-colors duration-200 relative flex items-center px-0.5">
                                  <div className="w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-4 transition-transform duration-200" />
                                </div>
                                <span className="text-sm text-primary/70">{field.label}</span>
                              </label>
                            )}
                            {field.type === 'file' && (
                              <label className={`${baseInput} flex items-center gap-2 cursor-pointer hover:border-accent/40 transition-colors duration-150`}>
                                <Upload size={14} className="text-primary/30" />
                                <span className="text-primary/35 text-sm">Выберите файл{field.multiple ? 'ы' : ''}...</span>
                                <input type="file" accept={field.accept} multiple={field.multiple} className="hidden" />
                              </label>
                            )}

                            {field.hint && <p className="text-[10px] text-primary/35 mt-1">{field.hint}</p>}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-7 flex items-center justify-between pt-5 border-t border-primary/8">
                      <p className="text-xs text-primary/30 flex items-center gap-1.5">
                        <AlertCircle size={11} />Поля, отмеченные * — обязательны
                      </p>
                      <button className="flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-medium
                        rounded-xl hover:bg-accent-light transition-colors duration-150">
                        Отправить заявку <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}