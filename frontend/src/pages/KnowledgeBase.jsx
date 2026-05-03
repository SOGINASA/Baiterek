import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MOCK_ARTICLES, MOCK_FAQ } from '../constants/mockData';
import { CATEGORIES } from '../constants/categories';
import { formatDateShort } from '../utils/formatters';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import SearchBar from '../components/shared/SearchBar';

const ALL_TABS = [
  { id: 'all', label: 'Все' },
  ...CATEGORIES.map(c => ({ id: c.id, label: c.label })),
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-primary/10 last:border-b-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex justify-between items-center py-4 text-left font-medium text-primary hover:text-accent transition-colors duration-150"
      >
        {item.question}
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="flex-shrink-0 ml-3 text-primary/40"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-primary/65 leading-relaxed">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return MOCK_ARTICLES.filter(a => {
      const matchCat = activeTab === 'all' || a.category === activeTab;
      const matchQ   = !query || a.title.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [activeTab, query]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary relative overflow-hidden min-h-[260px] flex items-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'База знаний' }]} />
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4 mb-6">База знаний</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1, ease: [0.23, 1, 0.32, 1] }} className="max-w-xl">
            <SearchBar size="hero" placeholder="Поиск по статьям и инструкциям..." value={query} onChange={setQuery} />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs
          tabs={ALL_TABS.slice(0, 6)}
          activeTab={activeTab}
          onChange={(id) => { setActiveTab(id); }}
          variant="underline"
          className="mb-8"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">📚</p>
            <p className="text-primary/60">Статьи не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {filtered.map((article, i) => {
              const cat = CATEGORIES.find(c => c.id === article.category);
              return (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <Link to={`/knowledge-base/${article.slug}`} className="block group">
                    <motion.div
                      whileHover={{ y: -2, boxShadow: 'var(--shadow-card-hover)' }}
                      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                      className="bg-surface rounded-2xl border border-primary/8 p-5"
                      style={{ boxShadow: 'var(--shadow-card)' }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{cat?.icon}</span>
                        <Badge variant="muted">{cat?.label}</Badge>
                        <span className="ml-auto text-xs text-primary/40">{article.readMinutes} мин</span>
                      </div>
                      <h3 className="font-semibold text-primary text-sm leading-snug line-clamp-2 group-hover:text-secondary transition-colors duration-150">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-3">
                        {article.tags?.slice(0, 2).map(tag => <Badge key={tag} variant="muted">{tag}</Badge>)}
                        <span className="ml-auto text-xs text-primary/40">{formatDateShort(article.publishedAt)}</span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">Часто задаваемые вопросы</h2>
          <div className="bg-surface rounded-2xl border border-primary/8 px-6" style={{ boxShadow: 'var(--shadow-card)' }}>
            {MOCK_FAQ.map(item => <FAQItem key={item.id} item={item} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
