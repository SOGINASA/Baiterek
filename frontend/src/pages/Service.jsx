import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useServicesStore } from '../store/servicesStore';
import { CATEGORIES, SUBSIDIARIES } from '../constants/categories';
import { MOCK_SERVICES } from '../constants/mockData';
import { formatAmount } from '../utils/formatters';
import { ROUTES } from '../constants/routes';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ServiceCard from '../components/shared/ServiceCard';

function AccordionItem({ id, title, children, openId, setOpenId }) {
  const isOpen = openId === id;
  return (
    <div className="border-b border-primary/10 last:border-b-0">
      <button
        onClick={() => setOpenId(isOpen ? null : id)}
        className="w-full flex justify-between items-center py-4 text-left font-medium text-primary hover:text-accent transition-colors duration-150"
      >
        {title}
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex-shrink-0 ml-2 text-primary/40"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm text-primary/65 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Service() {
  const { slug } = useParams();
  const { services, fetchServices } = useServicesStore();
  const [openId, setOpenId] = useState(null);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const service = useMemo(
    () => services.find(s => s.slug === slug) || MOCK_SERVICES.find(s => s.slug === slug),
    [services, slug]
  );

  const related = useMemo(
    () => service ? MOCK_SERVICES.filter(s => s.category === service.category && s.slug !== slug).slice(0, 4) : [],
    [service, slug]
  );

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-xl font-semibold text-primary mb-2">Услуга не найдена</h1>
        <Link to={ROUTES.CATALOG} className="text-accent hover:underline text-sm">Вернуться в каталог</Link>
      </div>
    );
  }

  const category   = CATEGORIES.find(c => c.id === service.category);
  const subsidiary = SUBSIDIARIES.find(s => s.id === service.subsidiaryId);

  return (
    <div>
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог', href: ROUTES.CATALOG }, { label: service.title }]} />
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-2xl">{category?.icon}</span>
              {subsidiary && <Badge variant="accent">{subsidiary.name}</Badge>}
              {service.tags?.slice(0, 3).map(tag => (
                <Badge key={tag} variant="muted" className="bg-white/10 text-white/60">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">{service.title}</h1>
            <p className="text-white/60 mt-2">{service.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8 items-start">
          <div className="flex-1 min-w-0">
            <p className="text-primary/70 leading-relaxed mb-8">{service.description}</p>

            <div className="bg-surface rounded-2xl border border-primary/8 px-6" style={{ boxShadow: 'var(--shadow-card)' }}>
              {service.conditions?.length > 0 && (
                <AccordionItem id="conditions" title="Условия получения" openId={openId} setOpenId={setOpenId}>
                  <ul className="space-y-2">
                    {service.conditions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-accent mt-0.5 flex-shrink-0">✓</span>{c}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              {service.documents?.length > 0 && (
                <AccordionItem id="documents" title="Необходимые документы" openId={openId} setOpenId={setOpenId}>
                  <ul className="space-y-2">
                    {service.documents.map((d, i) => (
                      <li key={i} className="flex items-start gap-2"><span className="text-primary/40 flex-shrink-0">📄</span>{d}</li>
                    ))}
                  </ul>
                </AccordionItem>
              )}
              {service.timeline && (
                <AccordionItem id="timeline" title="Сроки рассмотрения" openId={openId} setOpenId={setOpenId}>
                  <p>Срок рассмотрения заявки: <strong>{service.timeline}</strong>.</p>
                </AccordionItem>
              )}
            </div>

            {related.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-primary mb-4">Похожие услуги</h2>
                <div className="space-y-1">
                  {related.map(s => <ServiceCard key={s.id} service={s} compact />)}
                </div>
              </div>
            )}
          </div>

          {/* Sticky apply card */}
          <div className="hidden lg:block sticky top-24 w-72 flex-shrink-0">
            <div className="bg-surface rounded-2xl border border-primary/8 p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
              {service.amount?.max > 0 && (
                <div className="mb-4">
                  <p className="text-2xl font-bold text-primary">до {formatAmount(service.amount.max)}</p>
                  {service.rate?.label && <p className="text-sm text-primary/55 mt-0.5">{service.rate.label}</p>}
                </div>
              )}
              {service.term?.label && (
                <div className="flex items-center gap-2 mb-5 text-sm text-primary/60">
                  <span>⏱</span>{service.term.label}
                </div>
              )}
              <Button className="w-full" size="lg">Подать заявку</Button>
              <Button variant="outline" className="w-full mt-2" size="md">Узнать подробнее</Button>
              {subsidiary && (
                <p className="text-center text-xs text-primary/40 mt-4">{subsidiary.nameFull}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur border-t border-primary/10 p-4 z-30">
        <Button className="w-full" size="lg">Подать заявку</Button>
      </div>
    </div>
  );
}
