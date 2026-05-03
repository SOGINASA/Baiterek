import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Phone, Mail, MapPin, Shield, Pencil, Check, X, KeyRound } from 'lucide-react';
import Button from '../../components/ui/Button';

const FIELD = ({ label, value, editing, name, onChange }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs text-primary/40 font-medium uppercase tracking-wide">{label}</span>
    {editing ? (
      <input
        name={name}
        defaultValue={value}
        onChange={onChange}
        className="text-sm text-primary bg-bg border border-primary/15 rounded-lg px-3 py-2 focus:outline-none focus:border-accent/60 transition-colors"
      />
    ) : (
      <span className="text-sm text-primary font-medium">{value || '—'}</span>
    )}
  </div>
);

export default function CabinetProfile() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Мой профиль</h1>
          <p className="text-primary/45 text-sm mt-0.5">Персональные данные и настройки аккаунта</p>
        </div>
        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-full"
          >
            <Check size={14} /> Сохранено
          </motion.div>
        )}
      </div>

      {/* Personal info card */}
      <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/8">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <User size={16} className="text-accent" />
            Личные данные
          </div>
          {editing ? (
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-primary/50 hover:text-primary px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors">
                <X size={13} /> Отмена
              </button>
              <button onClick={handleSave} className="flex items-center gap-1 text-xs text-white bg-accent hover:bg-accent-light px-3 py-1.5 rounded-lg transition-colors font-medium">
                <Check size={13} /> Сохранить
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-primary/50 hover:text-primary px-2 py-1 rounded-lg hover:bg-primary/5 transition-colors">
              <Pencil size={12} /> Редактировать
            </button>
          )}
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-primary/6">
            <div className="w-20 h-20 rounded-2xl bg-accent/12 flex items-center justify-center flex-shrink-0">
              <span className="text-accent font-bold text-2xl">АС</span>
            </div>
            <div>
              <p className="text-xl font-bold text-primary">Алтынбек Сериков</p>
              <p className="text-primary/45 text-sm mt-0.5">ИИН: 860512300245</p>
              <div className="flex items-center gap-1.5 mt-2">
                <Shield size={12} className="text-green-500" />
                <span className="text-xs text-green-600 font-medium">Идентифицирован через eGov</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FIELD label="Фамилия" value="Сериков" editing={editing} name="lastName" />
            <FIELD label="Имя" value="Алтынбек" editing={editing} name="firstName" />
            <FIELD label="Отчество" value="Маратович" editing={editing} name="middleName" />
            <FIELD label="ИИН" value="860512300245" editing={false} name="iin" />
          </div>
        </div>
      </div>

      {/* Contacts */}
      <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 text-primary font-semibold px-6 py-4 border-b border-primary/8">
          <Phone size={16} className="text-accent" />
          Контактные данные
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FIELD label="Телефон" value="+7 (701) 234-56-78" editing={editing} name="phone" />
          <FIELD label="Email" value="a.serikov@example.kz" editing={editing} name="email" />
          <FIELD label="Город" value="Алматы" editing={editing} name="city" />
        </div>
      </div>

      {/* Business info */}
      <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 text-primary font-semibold px-6 py-4 border-b border-primary/8">
          <Building2 size={16} className="text-accent" />
          Сведения о предпринимательской деятельности
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FIELD label="Форма деятельности" value="Индивидуальный предприниматель" editing={false} name="bizType" />
          <FIELD label="БИН / ИИН" value="860512300245" editing={false} name="bin" />
          <FIELD label="Наименование" value="ИП «Сериков А.»" editing={editing} name="bizName" />
          <FIELD label="Вид деятельности (ОКЭД)" value="47.91 — Розничная торговля" editing={false} name="okved" />
          <FIELD label="Регион деятельности" value="г. Алматы" editing={editing} name="region" />
          <FIELD label="Дата регистрации" value="12.03.2018" editing={false} name="regDate" />
        </div>
      </div>

      {/* Security */}
      <div className="bg-surface border border-primary/8 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 text-primary font-semibold px-6 py-4 border-b border-primary/8">
          <KeyRound size={16} className="text-accent" />
          Безопасность
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-primary/6">
            <div>
              <p className="text-sm font-medium text-primary">Электронная цифровая подпись (ЭЦП)</p>
              <p className="text-xs text-primary/40 mt-0.5">Действует до: 14.08.2026</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">Активна</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-primary">Двухфакторная аутентификация</p>
              <p className="text-xs text-primary/40 mt-0.5">Вход через SMS-код на номер +7 (701) ***-56-78</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium">Включена</span>
          </div>
        </div>
      </div>
    </div>
  );
}