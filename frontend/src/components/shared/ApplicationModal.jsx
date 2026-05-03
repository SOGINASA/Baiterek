import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Button from '../ui/Button';

function FieldInput({ field, value, onChange }) {
  const base = `w-full rounded-lg border border-primary/20 bg-bg px-3 py-2.5 text-sm
    placeholder:text-primary/40 outline-none transition-[border-color,box-shadow] duration-150
    focus:border-accent focus:ring-2 focus:ring-accent/20`;

  if (field.type === 'textarea') {
    return (
      <textarea
        rows={3}
        placeholder={field.placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${base} resize-none`}
      />
    );
  }
  if (field.type === 'select') {
    return (
      <select value={value} onChange={e => onChange(e.target.value)} className={base}>
        <option value="">Выберите...</option>
        {field.options?.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      type={field.type || 'text'}
      placeholder={field.placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={base}
    />
  );
}

export default function ApplicationModal({ isOpen, onClose, service }) {
  const { isAuth } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const fields = service?.form_schema?.fields ?? [
    { name: 'amount', label: 'Запрашиваемая сумма (₸)', type: 'number', placeholder: '0', required: true },
    { name: 'purpose', label: 'Цель финансирования', type: 'textarea', placeholder: 'Опишите цель...', required: true },
    { name: 'comment', label: 'Дополнительная информация', type: 'textarea', placeholder: 'По желанию...', required: false },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuth) { navigate('/auth'); return; }

    setStatus('loading');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ service_id: service?.id, form_data: formData }),
      });

      if (!res.ok) throw new Error('Ошибка при создании заявки');
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.message || 'Что-то пошло не так');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/30 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="bg-surface border border-primary/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-5 border-b border-primary/8">
            <div>
              <h2 className="text-base font-bold text-primary">Подать заявку</h2>
              {service && <p className="text-xs text-primary/50 mt-0.5 line-clamp-1">{service.title}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-bg text-primary/40 hover:text-primary transition-colors ml-4 flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-primary mb-1">Заявка отправлена!</h3>
                <p className="text-sm text-primary/55 mb-6">
                  Мы рассмотрим вашу заявку в течение 1–3 рабочих дней и свяжемся с вами.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={onClose}>Закрыть</Button>
                  <Button onClick={() => { onClose(); navigate('/cabinet/applications'); }}>
                    Мои заявки
                  </Button>
                </div>
              </motion.div>
            ) : !isAuth ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-accent">Б</span>
                </div>
                <h3 className="text-base font-semibold text-primary mb-2">Войдите для подачи заявки</h3>
                <p className="text-sm text-primary/55 mb-6">
                  Для подачи заявки необходимо авторизоваться или зарегистрироваться на портале.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={onClose}>Отмена</Button>
                  <Button onClick={() => { onClose(); navigate('/auth'); }}>Войти</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-primary/80 mb-1.5">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <FieldInput
                      field={field}
                      value={formData[field.name] ?? ''}
                      onChange={val => setFormData(d => ({ ...d, [field.name]: val }))}
                    />
                  </div>
                ))}

                {status === 'error' && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    {errorMsg}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    Отмена
                  </Button>
                  <Button type="submit" className="flex-1" disabled={status === 'loading'}>
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={15} className="animate-spin" />
                        Отправка...
                      </span>
                    ) : 'Подать заявку'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
