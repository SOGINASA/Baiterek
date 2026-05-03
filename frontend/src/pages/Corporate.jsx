import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, User, FileText } from 'lucide-react';
import { MOCK_LEADERSHIP, KEY_NUMBERS, MOCK_DOCUMENTS } from '../constants/mockData';
import { ROUTES } from '../constants/routes';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function Corporate() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'О холдинге' }]} />
          <div className="mt-6 max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                АО «НИХ «Байтерек»
              </h1>
              <p className="text-white/65 leading-relaxed">
                Национальный инновационный холдинг «Байтерек» — институт развития Республики Казахстан, реализующий государственную политику в области поддержки предпринимательства и развития экономики.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="bg-surface border-b border-primary/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {KEY_NUMBERS.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-accent mb-1">{item.value}</p>
                <p className="text-primary/55 text-sm leading-snug">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-4">О холдинге</h2>
            <div className="space-y-4 text-primary/65 leading-relaxed text-sm">
              <p>
                Холдинг «Байтерек» создан в целях реализации государственной политики по стимулированию развития предпринимательской среды и повышению конкурентоспособности казахстанской экономики.
              </p>
              <p>
                В структуру Холдинга входят семь дочерних организаций, специализирующихся на финансировании, гарантировании, лизинге, экспортной поддержке и венчурном инвестировании.
              </p>
              <p>
                Миссия холдинга — обеспечить доступность финансовых и нефинансовых инструментов поддержки для предпринимателей Казахстана на всех стадиях развития бизнеса.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-secondary/10 to-accent/5 border border-primary/8 h-56 flex items-center justify-center">
            <Building2 size={72} className="text-primary/15" />
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-bg py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary mb-8">Руководство</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {MOCK_LEADERSHIP.map((person, i) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.06, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                className="bg-surface rounded-2xl border border-primary/8 p-5 text-center"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-accent/10 border-2 border-accent/20 flex items-center justify-center mx-auto mb-3">
                  <User size={28} className="text-primary/30" />
                </div>
                <p className="font-semibold text-primary text-sm leading-snug">{person.name}</p>
                <p className="text-primary/50 text-xs mt-1 leading-snug">{person.position}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-primary mb-6">Документы</h2>
        <div className="bg-surface rounded-2xl border border-primary/8 divide-y divide-primary/8" style={{ boxShadow: 'var(--shadow-card)' }}>
          {MOCK_DOCUMENTS.map(doc => (
            <div key={doc.id} className="flex items-center gap-4 px-6 py-4 hover:bg-primary/3 transition-colors duration-150">
              <FileText size={20} className="text-primary/35 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary text-sm">{doc.title}</p>
                <p className="text-primary/45 text-xs mt-0.5">{doc.date}</p>
              </div>
              <Badge variant="muted">{doc.type}</Badge>
              <Badge variant="muted">{doc.size}</Badge>
              <button className="text-accent hover:text-accent-light transition-colors duration-150 text-sm font-medium flex-shrink-0">
                Скачать
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Contacts CTA */}
      <section className="bg-secondary py-12 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-3">Остались вопросы?</h2>
          <p className="text-white/65 mb-6">Свяжитесь с нами или найдите контакты нужной организации</p>
          <Link to={ROUTES.CONTACTS}><Button size="lg">Контакты холдинга</Button></Link>
        </div>
      </section>
    </div>
  );
}
