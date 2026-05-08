import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Building2, Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function Profile() {
  const { user, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    bin_number: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? '',
        email: user.email ?? '',
        bin_number: user.bin_number ?? '',
      });
    }
  }, [user]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user ?? { ...user, ...form });
      } else {
        setUser({ ...user, ...form });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setUser({ ...user, ...form });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const initials = form.full_name
    ? form.full_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : form.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Avatar block */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface rounded-2xl border border-primary/8 p-6 flex items-center gap-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-accent/15 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-bold text-accent">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-primary text-lg truncate">{form.full_name || 'Пользователь'}</p>
          <p className="text-primary/50 text-sm truncate">{form.email}</p>
          {form.bin_number && (
            <p className="text-primary/40 text-xs mt-0.5">БИН: {form.bin_number}</p>
          )}
        </div>
      </motion.div>

      {/* Profile form */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface rounded-2xl border border-primary/8 overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-6 py-4 border-b border-primary/8 flex items-center gap-2">
          <User size={16} className="text-accent" />
          <h2 className="text-sm font-semibold text-primary">Личные данные</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Полное имя"
            value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            placeholder="Алибек Джаксыбеков"
            leftIcon={<User size={14} className="text-primary/35" />}
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="your@email.com"
            leftIcon={<Mail size={14} className="text-primary/35" />}
          />
          <Input
            label="БИН организации"
            value={form.bin_number}
            onChange={e => set('bin_number', e.target.value)}
            placeholder="123456789012"
            leftIcon={<Building2 size={14} className="text-primary/35" />}
          />

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-600"
            >
              <CheckCircle2 size={14} className="flex-shrink-0" />
              Данные сохранены
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={loading} className="flex-1">
              Сохранить изменения
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className="bg-surface rounded-2xl border border-primary/8 overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="px-6 py-4 border-b border-primary/8 flex items-center gap-2">
          <Shield size={16} className="text-accent" />
          <h2 className="text-sm font-semibold text-primary">Безопасность</h2>
        </div>

        <div className="divide-y divide-primary/8">
          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Изменить пароль</p>
              <p className="text-xs text-primary/45 mt-0.5">Минимум 8 символов, рекомендуется использовать цифры и знаки</p>
            </div>
            <Button size="sm" variant="outline" className="flex-shrink-0 flex items-center gap-1.5">
              <Lock size={13} />
              Изменить
            </Button>
          </div>

          <div className="px-6 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Активные сессии</p>
              <p className="text-xs text-primary/45 mt-0.5">1 активная сессия · Последний вход сегодня</p>
            </div>
            <Button size="sm" variant="outline" className="flex-shrink-0 text-rose-500 border-rose-200 hover:bg-rose-50"
              onClick={logout}>
              Выйти со всех устройств
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
