import { useState } from 'react';
import { motion } from 'framer-motion';
import { SUBSIDIARIES } from '../constants/categories';
import { validateEmail, validateRequired } from '../utils/validators';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const MAIN_CONTACTS = {
  address: 'г. Астана, ул. Достык, 1, БЦ «Алатау»',
  phone:   '+7 (7172) 55-50-00',
  email:   'info@baiterek.kz',
  hours:   'Пн–Пт: 09:00–18:00',
};

export default function Contacts() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!validateRequired(form.name))    e.name    = 'Введите имя';
    if (!validateEmail(form.email))      e.email   = 'Введите корректный email';
    if (!validateRequired(form.message)) e.message = 'Введите сообщение';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1000);
  };

  return (
    <div>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Контакты' }]} />
          <h1 className="text-3xl font-bold text-white mt-4">Контакты</h1>
          <p className="text-white/60 mt-2">Главный офис и дочерние организации холдинга «Байтерек»</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Main contact card */}
        <div className="bg-surface rounded-2xl border border-primary/8 p-6 mb-8" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="font-semibold text-primary mb-4">АО «НИХ «Байтерек»</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><p className="text-primary/45 text-xs mb-1">Адрес</p><p className="text-primary/80">{MAIN_CONTACTS.address}</p></div>
            <div><p className="text-primary/45 text-xs mb-1">Телефон</p><a href={`tel:${MAIN_CONTACTS.phone}`} className="text-accent hover:text-accent-light transition-colors duration-150">{MAIN_CONTACTS.phone}</a></div>
            <div><p className="text-primary/45 text-xs mb-1">Email</p><a href={`mailto:${MAIN_CONTACTS.email}`} className="text-accent hover:text-accent-light transition-colors duration-150">{MAIN_CONTACTS.email}</a></div>
            <div><p className="text-primary/45 text-xs mb-1">Режим работы</p><p className="text-primary/80">{MAIN_CONTACTS.hours}</p></div>
          </div>
        </div>

        {/* Subsidiaries */}
        <h2 className="text-xl font-bold text-primary mb-5">Дочерние организации</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {SUBSIDIARIES.map((org, i) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface rounded-2xl border border-primary/8 p-5"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: org.color }} />
                <h3 className="font-semibold text-primary text-sm">{org.nameFull}</h3>
              </div>
              <div className="space-y-2 text-xs text-primary/60">
                <p>📞 +7 (7172) 55-50-0{i + 1}</p>
                <p>✉️ info@{org.id}.kz</p>
                <p>🌐 {org.id}.kz</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map placeholder */}
        <div className="w-full h-52 bg-primary/4 rounded-2xl border border-primary/10 flex items-center justify-center mb-14">
          <span className="text-primary/30 text-sm">🗺️ Карта офисов</span>
        </div>

        {/* Feedback form */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">Обратная связь</h2>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="bg-surface rounded-2xl border border-primary/8 p-8 text-center"
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              <p className="text-4xl mb-4">✅</p>
              <h3 className="font-semibold text-primary text-lg mb-2">Сообщение отправлено!</h3>
              <p className="text-primary/60 text-sm">Мы ответим на ваш запрос в течение 1–2 рабочих дней.</p>
            </motion.div>
          ) : (
            <div className="bg-surface rounded-2xl border border-primary/8 p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Имя"
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    error={errors.name}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    error={errors.email}
                  />
                </div>
                <Input
                  label="Тема"
                  placeholder="Тема обращения"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-primary/80">Сообщение</label>
                  <textarea
                    rows={5}
                    placeholder="Опишите ваш вопрос или предложение..."
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className={`w-full rounded-lg border bg-surface px-4 py-2.5 text-sm placeholder:text-primary/40 outline-none resize-none
                      transition-[border-color,box-shadow] duration-150
                      ${errors.message
                        ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                        : 'border-primary/20 focus:border-accent focus:ring-2 focus:ring-accent/20'
                      }`}
                  />
                  {errors.message && <p className="text-xs text-red-500">{errors.message}</p>}
                </div>
                <Button type="submit" size="lg" loading={loading} className="w-full md:w-auto">
                  Отправить сообщение
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
