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

export default function ApplicationForm({ isOpen, onClose, service }) {
  const { isAuth } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const fields = [
    { name: 'amount', label: 'Запрашиваемая сумма (₸)', type: 'number', placeholder: '0', required: true },
    { name: 'purpose', label: 'Цель финансирования', type: 'textarea', placeholder: 'Опишите цель...', required: true },
    { name: 'comment', label: 'Дополнительная информация', type: 'textarea', placeholder: 'По желанию...', required: false },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuth) {
      navigate('/auth');
      onClose();
      return;
    }

    // Validate required fields
    const hasRequired = fields.filter(f => f.required).every(f => formData[f.name]);
    if (!hasRequired) {
      setErrorMsg('Пожалуйста, заполните все обязательные поля');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
       const token = localStorage.getItem('token');
       const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';
       const response = await fetch(`${API_BASE_URL}/applications`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
         },
         body: JSON.stringify({
           service_id: service?.id,
           form_data: formData,
         }),
       });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании заявки');
      }

      const newApp = await response.json();
      setStatus('success');
      
      // Автоматически закрываем через 2 сек и переходим в кабинет
      setTimeout(() => {
        onClose();
        navigate(`/cabinet/applications/${newApp.id}`);
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Что-то пошло не так');
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      setStatus('idle');
      setFormData({});
      setErrorMsg('');
      onClose();
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
              <p className="text-xs text-primary/50 mt-1">{service?.title}</p>
            </div>
            <button
              onClick={handleClose}
              disabled={status === 'loading'}
              className="text-primary/40 hover:text-primary disabled:opacity-50 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-400/10 rounded-full mb-3">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                </div>
                <p className="font-semibold text-primary mb-1">Заявка создана!</p>
                <p className="text-sm text-primary/60">Перенаправление в кабинет...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3 bg-rose-400/10 border border-rose-400/20 rounded-lg"
                  >
                    <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-rose-600">{errorMsg}</p>
                  </motion.div>
                )}

                {fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-primary mb-2">
                      {field.label}
                      {field.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                    <FieldInput
                      field={field}
                      value={formData[field.name] || ''}
                      onChange={(val) => setFormData(prev => ({ ...prev, [field.name]: val }))}
                    />
                  </div>
                ))}

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Отправка...
                      </>
                    ) : (
                      'Подать заявку'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleClose}
                    disabled={status === 'loading'}
                  >
                    Отмена
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
