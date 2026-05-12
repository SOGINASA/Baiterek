import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Lock, Mail, Building2, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const TABS = [
  { id: 'login',    label: 'Войти' },
  { id: 'register', label: 'Зарегистрироваться' },
];

export default function Auth() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', fullName: '', binNumber: '' });
  const [error, setError] = useState('');
  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let data;
      if (tab === 'login') {
        data = await login(form.email, form.password);
      } else {
        data = await register(form.email, form.password, form.fullName, form.binNumber);
      }
      navigate(data?.user?.user_type === 'admin' ? '/admin' : '/cabinet');
    } catch (err) {
      let msg = err.message || 'Ошибка авторизации';
      try { msg = JSON.parse(msg)?.message ?? msg; } catch { /* noop */ }
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-accent font-bold text-lg">Б</span>
            </div>
            <span className="text-primary font-semibold text-lg">Байтерек</span>
          </Link>
          <p className="text-primary/50 text-sm mt-2">Единый портал господдержки бизнеса</p>
        </div>

        <div className="bg-surface rounded-2xl border border-primary/8 overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          {/* Tabs */}
          <div className="flex border-b border-primary/8">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => { setTab(t.id); setError(''); }}
                className={`flex-1 py-4 text-sm font-medium transition-colors duration-150 ${
                  tab === t.id
                    ? 'text-primary border-b-2 border-accent -mb-px'
                    : 'text-primary/45 hover:text-primary'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.form
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {tab === 'register' && (
                  <Input
                    label="Полное имя"
                    placeholder="Алибек Джаксыбеков"
                    value={form.fullName}
                    onChange={e => set('fullName', e.target.value)}
                    required
                    leftIcon={<User size={15} className="text-primary/35" />}
                  />
                )}

                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                  leftIcon={<Mail size={15} className="text-primary/35" />}
                />

                <Input
                  label="Пароль"
                  type="password"
                  placeholder={tab === 'login' ? '••••••••' : 'Минимум 8 символов'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  leftIcon={<Lock size={15} className="text-primary/35" />}
                />

                {tab === 'register' && (
                  <Input
                    label="БИН компании"
                    placeholder="123456789012"
                    value={form.binNumber}
                    onChange={e => set('binNumber', e.target.value)}
                    leftIcon={<Building2 size={15} className="text-primary/35" />}
                  />
                )}

                {error && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={loading}
                >
                  {tab === 'login' ? 'Войти' : 'Создать аккаунт'}
                </Button>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>

        <p className="text-center text-xs text-primary/40 mt-6">
          Нажимая «{tab === 'login' ? 'Войти' : 'Создать аккаунт'}», вы принимаете{' '}
          <span className="text-accent cursor-pointer hover:underline">условия использования</span>
        </p>
      </motion.div>
    </div>
  );
}
