import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, ClipboardList } from 'lucide-react';
import { SUBSIDIARIES } from '../constants/categories';
import { subsidiariesAPI } from '../api/subsidiaries';
import { MOCK_SERVICES } from '../constants/mockData';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Badge from '../components/ui/Badge';
import ServiceCard from '../components/shared/ServiceCard';
import { SkeletonCard } from '../components/ui/Skeleton';

export default function Subsidiary() {
  const { id } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const org = SUBSIDIARIES.find(s => s.id === id);

  useEffect(() => {
    if (!org) { setLoading(false); return; }
    setLoading(true);
    subsidiariesAPI.getServices(id)
      .then(data => setServices(Array.isArray(data) ? data : []))
      .catch(() => {
        const fallback = MOCK_SERVICES.filter(s => s.subsidiaryId === id);
        setServices(fallback);
      })
      .finally(() => setLoading(false));
  }, [id, org]);

  if (!org) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Building2 size={48} className="text-primary/20 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-primary mb-2">Организация не найдена</h1>
        <Link to="/" className="text-accent hover:underline text-sm">На главную</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumbs items={[
            { label: 'Главная', href: '/' },
            { label: org.name },
          ]} />
          <div className="mt-4 flex items-center gap-3">
            <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: org.color }} />
            <h1 className="text-2xl md:text-3xl font-bold text-white">{org.nameFull}</h1>
          </div>
          <p className="text-white/55 mt-2 text-sm">Дочерняя организация холдинга «Байтерек»</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-surface rounded-2xl border border-primary/8 p-6 mb-8" style={{ boxShadow: 'var(--shadow-card)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-primary/45 text-xs mb-1">Телефон</p>
              <a href="tel:+77172555001" className="text-accent hover:text-accent-light transition-colors duration-150">
                +7 (7172) 55-50-01
              </a>
            </div>
            <div>
              <p className="text-primary/45 text-xs mb-1">Email</p>
              <a href={`mailto:info@${org.id}.kz`} className="text-accent hover:text-accent-light transition-colors duration-150">
                info@{org.id}.kz
              </a>
            </div>
            <div>
              <p className="text-primary/45 text-xs mb-1">Сайт</p>
              <span className="text-primary/70">{org.id}.kz</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : services.length > 0 ? (
          <div>
            <h2 className="text-xl font-bold text-primary mb-5">
              Услуги <Badge variant="muted">{services.length}</Badge>
            </h2>
            <div className="space-y-1">
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                >
                  <ServiceCard service={service} compact />
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ClipboardList size={40} className="text-primary/20 mx-auto mb-3" />
            <p className="text-primary/60">Услуги не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}
