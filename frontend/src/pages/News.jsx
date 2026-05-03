import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_NEWS } from '../constants/mockData';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Tabs from '../components/ui/Tabs';
import Pagination from '../components/ui/Pagination';
import NewsCard from '../components/shared/NewsCard';

const NEWS_TABS = [
  { id: 'all',          label: 'Все' },
  { id: 'press_release',label: 'Пресс-релизы' },
  { id: 'announcement', label: 'Анонсы' },
  { id: 'event',        label: 'Мероприятия' },
];

const PER_PAGE = 6;

export default function News() {
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  const featured = MOCK_NEWS.find(n => n.featured);

  const filtered = useMemo(() => {
    const list = MOCK_NEWS.filter(n => !n.featured);
    return activeTab === 'all' ? list : list.filter(n => n.category === activeTab);
  }, [activeTab]);

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

      {paged.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📰</p>
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
