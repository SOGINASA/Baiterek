import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { useNewsStore } from '../store/newsStore';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Tabs from '../components/ui/Tabs';
import Pagination from '../components/ui/Pagination';
import NewsCard from '../components/shared/NewsCard';
import { SkeletonCard } from '../components/ui/Skeleton';

const NEWS_TABS = [
  { id: 'all',           label: 'Все' },
  { id: 'press_release', label: 'Пресс-релизы' },
  { id: 'announcement',  label: 'Анонсы' },
  { id: 'event',         label: 'Мероприятия' },
];

const PER_PAGE = 6;

export default function News() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const { news, featured, loading, fetchNews } = useNewsStore();

  useEffect(() => {
    fetchNews({ type: activeTab === 'all' ? undefined : activeTab });
  }, [activeTab, fetchNews]);

  const filtered = useMemo(() => news.filter(n => n !== featured), [news, featured]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Новости' }]} />

      <div className="mt-4 mb-8">
        <h1 className="text-3xl font-bold text-primary">Новости</h1>
        <p className="text-primary/55 mt-1">Последние события холдинга «Байтерек» и дочерних организаций</p>
      </div>

      {/* Featured */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="mb-10"
        >
          <NewsCard article={featured} featured />
        </motion.div>
      )}

      <Tabs
        tabs={NEWS_TABS}
        activeTab={activeTab}
        onChange={(id) => { setActiveTab(id); setPage(1); }}
        variant="pill"
        className="mb-8"
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : paged.length === 0 ? (
        <div className="text-center py-16">
          <Newspaper size={48} className="text-primary/20 mx-auto mb-3" />
          <p className="text-primary/60">Новости не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paged.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <NewsCard article={article} />
            </motion.div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
