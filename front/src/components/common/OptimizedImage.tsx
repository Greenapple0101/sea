import React, { ImgHTMLAttributes } from 'react';

type OptimizedImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
};

export function OptimizedImage({ src, alt, loading = 'lazy', decoding = 'async', style, ...rest }: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding={decoding as any}
      style={{ width: '100%', height: 'auto', ...style }}
      {...rest}
    />
  );
}


