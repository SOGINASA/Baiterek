export const ROUTES = {
  HOME:           '/',
  CATALOG:        '/catalog',
  SERVICE:        '/catalog/:slug',
  KNOWLEDGE_BASE: '/knowledge-base',
  KB_ARTICLE:     '/knowledge-base/:slug',
  NEWS:           '/news',
  NEWS_ARTICLE:   '/news/:slug',
  CORPORATE:      '/corporate',
  CONTACTS:       '/contacts',
  SUBSIDIARY:     '/subsidiary/:id',
  AUTH:           '/auth',
  CABINET:        '/cabinet',
};

export const route = (pattern, params = {}) =>
  Object.entries(params).reduce(
    (acc, [k, v]) => acc.replace(`:${k}`, v),
    pattern
  );
