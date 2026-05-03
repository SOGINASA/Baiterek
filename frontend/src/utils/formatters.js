export const formatAmount = (amount, currency = 'тенге') => {
  if (!amount || amount === 0) return 'Бесплатно';
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} млрд ${currency}`;
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(0)} млн ${currency}`;
  if (amount >= 1_000)         return `${(amount / 1_000).toFixed(0)} тыс ${currency}`;
  return `${amount} ${currency}`;
};

export const formatDate = (dateStr, locale = 'ru-RU') =>
  new Date(dateStr).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });

export const formatDateShort = (dateStr, locale = 'ru-RU') =>
  new Date(dateStr).toLocaleDateString(locale, { day: 'numeric', month: 'short' });

export const formatDateFull = (dateStr, locale = 'ru-RU') =>
  new Date(dateStr).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
