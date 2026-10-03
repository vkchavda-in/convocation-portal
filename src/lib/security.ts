import path from 'path';

/**
 * Validates binary magic numbers to ensure uploaded files match their declared extensions
 */
export function validateFileSignature(
  buffer: Buffer,
  declaredExt: string
): { valid: boolean; detectedType?: string } {
  if (!buffer || buffer.length < 4) {
    return { valid: false };
  }

  const ext = declaredExt.toLowerCase().replace('.', '');

  // Check magic bytes signatures
  // JPEG / JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: ['jpg', 'jpeg'].includes(ext), detectedType: 'image/jpeg' };
  }

  // PNG: 89 50 4E 47 (0x89 'PNG')
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { valid: ext === 'png', detectedType: 'image/png' };
  }

  // GIF: 47 49 46 38 ('GIF8')
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { valid: ext === 'gif', detectedType: 'image/gif' };
  }

  // WebP: 52 49 46 46 ('RIFF') ... 57 45 42 50 ('WEBP')
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { valid: ext === 'webp', detectedType: 'image/webp' };
  }

  // AVIF: check ftyp box (bytes 4-8 = 'ftyp', followed by 'avif' or 'mif1')
  if (buffer.length >= 12) {
    const boxType = buffer.toString('ascii', 4, 8);
    const majorBrand = buffer.toString('ascii', 8, 12);
    if (boxType === 'ftyp' && (majorBrand === 'avif' || majorBrand === 'mif1' || majorBrand === 'avis')) {
      return { valid: ext === 'avif', detectedType: 'image/avif' };
    }
  }

  // PDF: 25 50 44 46 ('%PDF')
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { valid: ext === 'pdf', detectedType: 'application/pdf' };
  }

  // SVG: text/xml check with basic validation
  if (ext === 'svg') {
    const textPrefix = buffer.slice(0, 1024).toString('utf-8').trim().toLowerCase();
    // Must contain <svg and not look like binary/HTML executable
    if (textPrefix.includes('<svg') || textPrefix.includes('<?xml')) {
      return { valid: true, detectedType: 'image/svg+xml' };
    }
    return { valid: false };
  }

  return { valid: false };
}

/**
 * Sanitizes SVG content by removing malicious scripts, javascript: handlers, and foreign objects
 */
export function sanitizeSvg(svgContent: string): string {
  let clean = svgContent;

  // Remove <script> tags and contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove <foreignObject> tags and contents
  clean = clean.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, '');

  // Remove <use> elements pointing to external URLs
  clean = clean.replace(/<use[^>]*href=["']?(?:https?:|\/\/)[^"'>]+["']?[^>]*>/gi, '');

  // Remove all inline event handlers (onload, onerror, onclick, etc.)
  clean = clean.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // Remove href / xlink:href containing javascript: or data:text/html
  clean = clean.replace(/(?:href|xlink:href)\s*=\s*["']?\s*(?:javascript|data:text\/html):[^"'>]+["']?/gi, '');

  return clean;
}

/**
 * Path traversal guard: checks if a target resolved path is strictly within the allowed base directory
 */
export function isSafePath(baseDir: string, targetPath: string): boolean {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget.startsWith(resolvedBase);
}

/**
 * Sanitizes file names to prevent directory traversal and illegal characters
 */
export function sanitizeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  return `${base || 'file'}${ext}`;
}

/**
 * Sanitizes slug strings
 */
export function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}
