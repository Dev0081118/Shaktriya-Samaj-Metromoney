export const getLocale = (language = document.documentElement.lang) => ({ en: 'en-IN', gu: 'gu-IN', hi: 'hi-IN' }[String(language).split('-')[0]] || 'en-IN');
export const formatDate = (value, language, options = {}) => value ? new Intl.DateTimeFormat(getLocale(language), options).format(new Date(value)) : '—';
export const formatNumber = (value, language, options = {}) => new Intl.NumberFormat(getLocale(language), options).format(Number(value || 0));
export const formatCurrency = (value, language) => new Intl.NumberFormat(getLocale(language), { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));
