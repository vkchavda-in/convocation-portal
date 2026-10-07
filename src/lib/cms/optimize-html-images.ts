/**
 * Utility function to parse a raw HTML string (e.g. from rich-text editor body)
 * and replace standard <img> tags pointing to local assets/uploads/files with optimized
 * responsive <picture> elements with WebP and AVIF fallbacks.
 */
export function optimizeHtmlImages(html: string): string {
  if (!html) return html;

  // Match all img tags
  const imgRegex = /<img\b([^>]*)\/?>/gi;

  return html.replace(imgRegex, (imgTag) => {
    // Extract src pointing to local uploads, cdn, media, assets, or tokenized files
    const srcMatch = imgTag.match(/src=["'](\/(?:uploads|cdn|media|assets\/images)\/[^"']+\.(?:png|jpg|jpeg|webp)|\/files\/[a-f0-9]{32,64}(?:-[a-z0-9]+)?(?:\.[a-z0-9]+)?)["']/i);
    if (!srcMatch) return imgTag; // Non-local or unsupported image, render as-is

    const src = srcMatch[1];

    // Resolve base path without extension
    let basePath = src;
    const lastDotIdx = src.lastIndexOf('.');
    if (lastDotIdx !== -1 && lastDotIdx > src.lastIndexOf('/')) {
      basePath = src.slice(0, lastDotIdx);
    }

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
      .replace(/^\s*<\s*img\s*/i, '')
      .replace(/\s*\/?\>\s*$/i, '')
      .trim();

    return `<picture class="block overflow-hidden ${className}" ${style ? `style="${style}"` : ''}>
      <source srcset="${basePath}.avif" type="image/avif" />
      <source srcset="${basePath}.webp" type="image/webp" />
      <img src="${src}" class="${className} block" ${style ? `style="${style}"` : ''} ${cleanImgTag} loading="lazy" decoding="async" />
    </picture>`;
  });
}
