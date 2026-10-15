import {
  BRAND_NAME,
  brandAssets
} from '../config/brandAssets';

export default function BrandLogo({
  variant = 'whiteHorizontal',
  className = '',
  alt = BRAND_NAME,
  loading = 'eager',
  decoding = 'async'
}) {
  const src =
    brandAssets[variant] ||
    brandAssets.whiteHorizontal;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      draggable="false"
    />
  );
}