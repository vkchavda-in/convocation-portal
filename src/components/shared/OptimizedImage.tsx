// Server component — no 'use client' needed (no interactivity, pure HTML output)
import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedImage({ src, alt, className, priority, ...props }: OptimizedImageProps) {
  if (!src) return null;

  // Only optimize local uploads, cdn, media and assets (PNG/JPG/JPEG/WEBP)
  const isLocalImage = (
    src.startsWith('/uploads/') || 
    src.startsWith('/cdn/') || 
    src.startsWith('/media/') || 
    src.startsWith('/assets/images/')
  ) && /\.(png|jpg|jpeg|webp)$/i.test(src);

  if (!isLocalImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...(priority ? { fetchPriority: 'high' } : {})}
        {...props}
      />
    );
  }

  // Remove the file extension to get the base path
  const lastDotIdx = src.lastIndexOf('.');
  const basePath = src.slice(0, lastDotIdx);

  // We pass layout/containment classes to both picture and img to preserve flex/grid boundaries
  return (
    <picture className={`inline-block ${className || ''}`}>
      {/* FIX: was `max-w` (invalid), must be `max-width` for browser to match */}
      <source srcSet={`${basePath}-mobile.avif`} media="(max-width: 640px)" type="image/avif" />
      <source srcSet={`${basePath}-tablet.avif`} media="(max-width: 1024px)" type="image/avif" />
      <source srcSet={`${basePath}-desktop.avif`} type="image/avif" />
      <source srcSet={`${basePath}.webp`} type="image/webp" />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        {...(priority ? { fetchPriority: 'high' } : {})}
        {...props}
      />
    </picture>
  );
}

/**
 * Utility function to parse a raw HTML string (e.g. from rich-text editor body)
 * and replace standard <img> tags pointing to local assets/uploads with optimized
 * responsive <picture> elements.
 */
export function optimizeHtmlImages(html: string): string {
  if (!html) return html;

  // Match all img tags
  const imgRegex = /<img\b([^>]*)\/?>/gi;

  return html.replace(imgRegex, (imgTag) => {
    // Extract src pointing to local uploads, cdn, media or assets/images
    const srcMatch = imgTag.match(/src=["'](\/(?:uploads|cdn|media|assets\/images)\/[^"']+\.(?:png|jpg|jpeg|webp))["']/i);
    if (!srcMatch) return imgTag; // Non-local or unsupported image, render as-is

    const src = srcMatch[1];
    const lastDotIdx = src.lastIndexOf('.');
    const basePath = src.slice(0, lastDotIdx);

    // Extract class and style attributes
    const classMatch = imgTag.match(/class=["']([^"']*)["']/i);
    const styleMatch = imgTag.match(/style=["']([^"']*)["']/i);

    const className = classMatch ? classMatch[1] : '';
    const style = styleMatch ? styleMatch[1] : '';

    // Remove src, class, and style attributes from original string to prevent duplicates
    let cleanImgTag = imgTag
      .replace(/src=["'][^"']*["']/i, '')
      .replace(/class=["'][^"']*["']/i, '')
      .replace(/style=["'][^"']*["']/i, '')
      // Strip outer <img and > brackets
      .replace(/^\s*<\s*img\s*/i, '')
      .replace(/\s*\/?\>\s*$/i, '')
      .trim();

    return `<picture class="inline-block ${className}" ${style ? `style="${style}"` : ''}>
      <source srcset="${basePath}-mobile.avif" media="(max-width: 640px)" type="image/avif" />
      <source srcset="${basePath}-tablet.avif" media="(max-width: 1024px)" type="image/avif" />
      <source srcset="${basePath}-desktop.avif" type="image/avif" />
      <source srcset="${basePath}.webp" type="image/webp" />
      <img src="${src}" class="${className}" ${style ? `style="${style}"` : ''} ${cleanImgTag} loading="lazy" decoding="async" />
    </picture>`;
  });
}
