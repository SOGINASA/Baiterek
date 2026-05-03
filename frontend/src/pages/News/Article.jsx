import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { useNewsStore } from '../../store/newsStore';
import { formatDateFull } from '../../utils/formatters';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import Badge from '../../components/ui/Badge';
import { SkeletonText } from '../../components/ui/Skeleton';

const CATEGORY_LABELS = {
  press_release: 'Пресс-релиз',
  announcement:  'Анонс',
  event:         'Мероприятие',
};

export default function NewsArticle() {
  const { slug } = useParams();
  const { article, loading, fetchBySlug } = useNewsStore();

  useEffect(() => { fetchBySlug(slug); }, [slug, fetchBySlug]);

  if (loading) {
    return (
      <div>
        <section className="bg-primary">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-6" />
            <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse mb-3" />
            <div className="h-4 w-40 bg-white/10 rounded animate-pulse" />
          </div>
        </section>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-surface rounded-2xl border border-primary/8 p-8">
            <SkeletonText lines={6} />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Newspaper size={48} className="text-primary/20 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-primary mb-2">Новость не найдена</h1>
        <Link to="/news" className="text-accent hover:underline text-sm">Вернуться к новостям</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={[
            { label: 'Главная', href: '/' },
            { label: 'Новости', href: '/news' },
            { label: article.title },
          ]} />
          <div className="mt-4 flex items-center gap-2 mb-3">
            <Badge variant="accent">{CATEGORY_LABELS[article.category] ?? article.category}</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-snug">{article.title}</h1>
          <p className="text-white/50 text-sm mt-2">
            {formatDateFull(article.published_at ?? article.publishedAt ?? article.date)}
          </p>
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
          <p className="text-primary/70 leading-relaxed text-sm">
            {article.content ?? article.excerpt}
          </p>
          {article.tags?.length > 0 && (
            <div className="mt-8 pt-8 border-t border-primary/8 flex flex-wrap gap-2">
              {article.tags.map(tag => (
                <Badge key={typeof tag === 'string' ? tag : tag.name} variant="muted">
                  {typeof tag === 'string' ? tag : tag.name}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>
        <div className="mt-6 text-center">
          <Link to="/news" className="text-accent hover:text-accent-light transition-colors duration-150 text-sm">
            ← Вернуться к новостям
          </Link>
        </div>
      </div>
    </div>
  );
}
