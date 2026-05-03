import { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useServicesStore } from '../store/servicesStore';
import { useNewsStore } from '../store/newsStore';
import { SUBSIDIARIES } from '../constants/categories';
import { ROUTES } from '../constants/routes';
import SearchBar from '../components/shared/SearchBar';
import ServiceCard from '../components/shared/ServiceCard';
import NewsCard from '../components/shared/NewsCard';
import Button from '../components/ui/Button';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Home() {
  const { services, loading: servicesLoading, fetchServices } = useServicesStore();
  const { news, loading: newsLoading, fetchNews } = useNewsStore();
  const navigate = useNavigate();

  useEffect(() => { fetchServices(); }, [fetchServices]);
  useEffect(() => { fetchNews(); }, [fetchNews]);

  const popularServices = useMemo(() => services.filter(s => s.is_popular || s.popular).slice(0, 6), [services]);
  const latestNews = useMemo(() => news.slice(0, 3), [news]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary relative overflow-hidden min-h-[540px] flex items-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-medium mb-6">
              Единый портал господдержки бизнеса · Казахстан
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 max-w-3xl">
              Поддержка вашего бизнеса в{' '}
              <span className="text-accent">одном месте</span>
            </h1>
            <p className="text-white/65 text-lg mb-10 max-w-xl leading-relaxed">
              70+ мер государственной поддержки от институтов развития холдинга «Байтерек» — финансирование, гарантии, лизинг и экспортная поддержка.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-2xl"
          >
            <SearchBar
              size="hero"
              placeholder="Найдите подходящую меру поддержки..."
              onSubmit={(q) => navigate(`${ROUTES.CATALOG}?q=${encodeURIComponent(q)}`)}
            />
            <p className="text-white/40 text-xs mt-3">Например: микрокредит, гарантия, экспортное страхование</p>
          </motion.div>
        </div>
      </section>

      {/* Subsidiaries */}
      <section className="bg-surface border-b border-primary/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap gap-2 items-center justify-center md:justify-start">
            <span className="text-xs text-primary/40 mr-2 hidden md:block">Организации:</span>
            {SUBSIDIARIES.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04, duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <Link
                  to={`/subsidiary/${org.id}`}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-bg border border-primary/10
                    hover:border-accent/40 hover:text-primary text-sm font-medium text-primary/65
                    transition-[border-color,color] duration-150"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: org.color }} />
                  {org.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-primary">Популярные услуги</h2>
            <p className="text-primary/55 text-sm mt-1">Наиболее востребованные меры поддержки</p>
          </div>
          <Link to={ROUTES.CATALOG} className="text-sm font-medium text-accent hover:text-accent-light transition-colors duration-150 hidden sm:block">
            Весь каталог →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {servicesLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : popularServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.06, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))
          }
        </div>
      </section>

      {/* Key Numbers */}
      <section className="bg-secondary py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '₸4.8 трлн', label: 'Объём поддержки в 2024 году' },
              { value: '187 000+',  label: 'Предпринимателей поддержано' },
              { value: '7',         label: 'Дочерних организаций' },
              { value: '70+',       label: 'Мер государственной поддержки' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-accent mb-1">{item.value}</p>
                <p className="text-white/60 text-sm">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-primary">Последние новости</h2>
          <Link to={ROUTES.NEWS} className="text-sm font-medium text-accent hover:text-accent-light transition-colors duration-150">
            Все новости →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {newsLoading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : latestNews.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ delay: i * 0.07, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                >
                  <NewsCard article={article} />
                </motion.div>
              ))
          }
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <h2 className="text-3xl font-bold text-white mb-3">Готовы развивать бизнес?</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              Зарегистрируйтесь на портале и получите доступ ко всем мерам господдержки в одном месте.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Button size="lg">Подать заявку</Button>
              <Link to={ROUTES.CATALOG}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Просмотреть каталог
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
