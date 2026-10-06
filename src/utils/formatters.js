export const getLocale = (
  language =
    document.documentElement
      .lang
) => {
  const localeMap = {
    en: 'en-IN',
    gu: 'gu-IN',
    hi: 'hi-IN'
  };

  const key = String(
    language
  ).split('-')[0];

  return (
    localeMap[key] ||
    'en-IN'
  );
};

export const formatDate = (
  value,
  language,
  options = {}
) => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    getLocale(language),
    options
  ).format(
    new Date(value)
  );
};

export const formatNumber = (
  value,
  language,
  options = {}
) => {
  return new Intl.NumberFormat(
    getLocale(language),
    options
  ).format(
    Number(value || 0)
  );
};

export const formatCurrency = (
  value,
  language
) => {
  return new Intl.NumberFormat(
    getLocale(language),
    {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }
  ).format(
    Number(value || 0)
  );
};