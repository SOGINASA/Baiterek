import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MOCK_ARTICLES } from '../../constants/mockData';
import { CATEGORIES } from '../../constants/categories';
import { formatDateFull } from '../../utils/formatters';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Badge from '../../components/ui/Badge';

export default function KBArticle() {
  const { slug } = useParams();
  const article = useMemo(() => MOCK_ARTICLES.find(a => a.slug === slug), [slug]);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">📚</p>
        <h1 className="text-xl font-semibold text-primary mb-2">Статья не найдена</h1>
        <Link to="/knowledge-base" className="text-accent hover:underline text-sm">Вернуться в базу знаний</Link>
      </div>
    );
  }

  const cat = CATEGORIES.find(c => c.id === article.category);

  return (
    <div>
      <section className="bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={[
            { label: 'Главная', href: '/' },
            { label: 'База знаний', href: '/knowledge-base' },
            { label: article.title },
          ]} />
          <div className="mt-4 flex items-center gap-2 mb-3">
            <span className="text-xl">{cat?.icon}</span>
            <Badge variant="accent">{cat?.label}</Badge>
            <span className="text-white/45 text-xs ml-auto">{article.readMinutes} мин чтения</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">{article.title}</h1>
          <p className="text-white/50 text-sm mt-2">{formatDateFull(article.publishedAt)}</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          className="bg-surface rounded-2xl border border-primary/8 p-8"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-primary/70 leading-relaxed">
            {article.excerpt ?? 'Полный текст статьи доступен в системе управления контентом. Здесь отображается краткое описание материала для ознакомления с основными тезисами публикации.'}
          </p>
          <div className="mt-8 pt-8 border-t border-primary/8 flex flex-wrap gap-2">
            {article.tags?.map(tag => <Badge key={tag} variant="muted">{tag}</Badge>)}
          </div>
        </motion.div>
        <div className="mt-6 text-center">
          <Link to="/knowledge-base" className="text-accent hover:text-accent-light transition-colors duration-150 text-sm">
            ← Вернуться в базу знаний
          </Link>
        </div>
      </div>
    </div>
  );
}
