export const CATEGORIES = [
  { id: 'financing',      slug: 'financing',      label: 'Финансирование',          icon: 'DollarSign',    color: '#0068B4', description: 'Кредиты, займы и субсидированное финансирование для бизнеса' },
  { id: 'guarantees',     slug: 'guarantees',     label: 'Гарантии',                icon: 'Shield',        color: '#E3001B', description: 'Государственные гарантии по банковским кредитам' },
  { id: 'export',         slug: 'export',         label: 'Поддержка экспорта',      icon: 'Globe',         color: '#00539B', description: 'Страхование экспортных сделок, гарантии для экспортёров' },
  { id: 'leasing',        slug: 'leasing',        label: 'Лизинг',                  icon: 'Briefcase',     color: '#0057A8', description: 'Финансовый и операционный лизинг оборудования' },
  { id: 'venture',        slug: 'venture',        label: 'Венчурное финансирование', icon: 'TrendingUp',    color: '#005AA7', description: 'Инвестиции в стартапы и инновационные компании' },
  { id: 'consulting',     slug: 'consulting',     label: 'Консультации',            icon: 'Users',         color: '#C9A84C', description: 'Бесплатные консультации по мерам господдержки' },
  { id: 'grants',         slug: 'grants',         label: 'Гранты',                  icon: 'Gift',          color: '#1B3A6B', description: 'Безвозвратные субсидии для МСБ' },
  { id: 'infrastructure', slug: 'infrastructure', label: 'Инфраструктура',           icon: 'Building',      color: '#0A1628', description: 'Индустриальные зоны, технопарки, СЭЗ' },
];

export const SUBSIDIARIES = [
  { id: 'damu',   name: 'Даму',         nameFull: 'АО «Фонд развития предпринимательства «Даму»',                  color: '#0068B4', focus: ['financing', 'guarantees', 'grants'] },
  { id: 'kaznex', name: 'KazNex Invest',nameFull: 'АО «KazNex Invest»',                                            color: '#E3001B', focus: ['export'] },
  { id: 'kazyna', name: 'Казына Капитал',nameFull: 'АО «Казына Капитал Менеджмент»',                               color: '#00539B', focus: ['venture', 'financing'] },
  { id: 'dbk',    name: 'БРК',          nameFull: 'АО «Банк Развития Казахстана»',                                  color: '#0057A8', focus: ['financing', 'infrastructure'] },
  { id: 'kif',    name: 'КИФ',          nameFull: 'АО «Казахстанский инвестиционный фонд»',                         color: '#005AA7', focus: ['venture'] },
  { id: 'esil',   name: 'Есіл',         nameFull: 'АО «Компания по страхованию экспортных кредитов «Есіл»',         color: '#C9A84C', focus: ['export', 'guarantees'] },
  { id: 'kzh',    name: 'КЖ Холдинг',   nameFull: 'АО «КЖ Холдинг»',                                               color: '#1B3A6B', focus: ['leasing', 'infrastructure'] },
];

export const SERVICE_TYPES = [
  { value: 'all',        label: 'Все типы' },
  { value: 'loan',       label: 'Кредит' },
  { value: 'grant',      label: 'Грант' },
  { value: 'guarantee',  label: 'Гарантия' },
  { value: 'subsidy',    label: 'Субсидия' },
  { value: 'leasing',    label: 'Лизинг' },
  { value: 'investment', label: 'Инвестиция' },
];
