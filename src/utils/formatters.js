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

export const formatCulturalName = (profile = {}) => {
  if (!profile) return '';
  const first = (profile.firstName || profile.name || '').trim();
  const middle = (profile.middleName || '').trim();
  const last = (profile.lastName || '').trim();

  if (!first) return last || '';

  const gender = (profile.gender || profile.basicDetails?.gender || '').toLowerCase();
  const profileFor = (profile.profileFor || profile.basicDetails?.profileFor || '').toLowerCase();
  const isFemale = gender === 'female' || profileFor === 'daughter' || profileFor === 'sister';
  const isMale = gender === 'male' || profileFor === 'son' || profileFor === 'brother';

  if (isFemale) {
    let formattedFirst = first;
    if (!/\bba\b/i.test(first) && !first.toLowerCase().endsWith('ba')) {
      formattedFirst = `${first} Ba`;
    }
    const parts = [formattedFirst, middle, last].filter(Boolean);
    return parts.join(' ');
  }

  if (isMale) {
    let formattedFirst = first;
    const hasSinh = /\b(sinh|singh)\b/i.test(`${first} ${middle} ${last}`);
    if (!hasSinh) {
      formattedFirst = `${first} Sinh`;
    }
    const parts = [formattedFirst, middle, last].filter(Boolean);
    return parts.join(' ');
  }

  const parts = [first, middle, last].filter(Boolean);
  return parts.join(' ');
};
