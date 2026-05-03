export const validateEmail    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const validatePhone    = (v) => /^[\+]?[0-9\s\-\(\)]{10,15}$/.test(v);
export const validateRequired = (v) => v !== null && v !== undefined && String(v).trim().length > 0;
export const validateMinLength = (v, min) => String(v).trim().length >= min;
