import Select from '../ui/Select';
import Button from '../ui/Button';
import { CATEGORIES, SERVICE_TYPES } from '../../constants/categories';

export default function FilterPanel({
  selectedCategories = [],
  onCategoryToggle,
  selectedType = 'all',
  onTypeChange,
  onReset,
  className = '',
}) {
  const hasFilters = selectedCategories.length > 0 || selectedType !== 'all';

  return (
    <aside className={`w-64 flex-shrink-0 space-y-6 ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Фильтры</h3>
          {hasFilters && (
            <button
              onClick={onReset}
              className="text-xs text-accent hover:text-accent-light transition-colors duration-150"
            >
              Сбросить
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-primary/50 uppercase tracking-wide mb-2">Категории</p>
          {CATEGORIES.map(cat => {
            const checked = selectedCategories.includes(cat.id);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-primary/4 transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onCategoryToggle(cat.id)}
                  className="w-4 h-4 rounded border-primary/30 accent-accent cursor-pointer"
                />
                <span className="text-sm text-primary/80">{cat.icon} {cat.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Type */}
      <Select
        label="Тип услуги"
        options={SERVICE_TYPES}
        value={selectedType}
        onChange={onTypeChange}
      />

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="w-full">
          Сбросить все фильтры
        </Button>
      )}
    </aside>
  );
}
