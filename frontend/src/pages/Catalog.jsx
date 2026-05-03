import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useServicesStore } from '../store/servicesStore';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import SearchBar from '../components/shared/SearchBar';
import ServiceCard from '../components/shared/ServiceCard';
import FilterPanel from '../components/shared/FilterPanel';

const PER_PAGE = 12;

export default function Catalog() {
  const { services, loading, filters, fetchServices, setFilter, resetFilters } = useServicesStore();
  const [page, setPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchCat  = filters.category.length === 0 || filters.category.includes(s.category);
      const matchType = filters.type === 'all' || s.type === filters.type;
      const matchQ    = !filters.query ||
        s.title.toLowerCase().includes(filters.query.toLowerCase()) ||
        s.tags?.some(t => t.toLowerCase().includes(filters.query.toLowerCase()));
      return matchCat && matchType && matchQ;
    });
  }, [services, filters]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleCategoryToggle = (id) => {
    const next = filters.category.includes(id)
      ? filters.category.filter(c => c !== id)
      : [...filters.category, id];
    setFilter('category', next);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог услуг' }]} />

      <div className="mt-4 mb-6">
        <h1 className="text-3xl font-bold text-primary">Каталог услуг</h1>
        <p className="text-primary/55 mt-1">Все меры государственной поддержки бизнеса</p>
      </div>

      <div className="flex gap-8">
        <div className="hidden lg:block">
          <FilterPanel
            selectedCategories={filters.category}
            onCategoryToggle={handleCategoryToggle}
            selectedType={filters.type}
            onTypeChange={(v) => { setFilter('type', v); setPage(1); }}
            onReset={() => { resetFilters(); setPage(1); }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-6">
            <SearchBar
              size="compact"
              placeholder="Поиск по названию или тегу..."
              value={filters.query}
              onChange={(v) => { setFilter('query', v); setPage(1); }}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="md"
              className="lg:hidden flex-shrink-0"
              onClick={() => setFilterDrawerOpen(true)}
            >
              Фильтры
              {(filters.category.length > 0 || filters.type !== 'all') && (
                <span className="ml-1 w-5 h-5 rounded-full bg-accent text-primary text-xs flex items-center justify-center">
                  {filters.category.length + (filters.type !== 'all' ? 1 : 0)}
                </span>
              )}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search size={44} className="text-primary/20 mx-auto mb-4" />
              <p className="text-primary/60 font-medium">Ничего не найдено</p>
              <p className="text-primary/40 text-sm mt-1">Попробуйте изменить параметры поиска</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={() => { resetFilters(); setPage(1); }}>
                Сбросить фильтры
              </Button>
            </div>
          ) : (
            <>
              <p className="text-sm text-primary/45 mb-5">
                Найдено: <span className="font-medium text-primary/70">{filtered.length}</span> услуг
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paged.map((service, i) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <ServiceCard service={service} />
                  </motion.div>
                ))}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-primary/50 backdrop-blur-sm" onClick={() => setFilterDrawerOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="absolute inset-y-0 left-0 w-80 bg-surface p-6 overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-modal)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-primary">Фильтры</h2>
              <button onClick={() => setFilterDrawerOpen(false)} className="p-1.5 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/8 transition-colors duration-150">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4.5 4.5l9 9M13.5 4.5l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <FilterPanel
              selectedCategories={filters.category}
              onCategoryToggle={handleCategoryToggle}
              selectedType={filters.type}
              onTypeChange={(v) => { setFilter('type', v); setPage(1); }}
              onReset={() => { resetFilters(); setPage(1); }}
              className="w-full"
            />
            <Button className="w-full mt-6" onClick={() => setFilterDrawerOpen(false)}>Применить</Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
