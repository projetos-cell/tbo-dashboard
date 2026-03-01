/**
 * Basic HTML sanitizer to prevent XSS attacks.
 * Strips dangerous tags and attributes from HTML strings.
 */

const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'em', 'strong', 'u', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
  'span', 'div', 'hr', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'img', 'figure', 'figcaption', 'mark', 'sub', 'sup', 'del', 'ins',
]);

const ALLOWED_ATTRS = new Set([
  'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
  'width', 'height', 'style',
]);

const DANGEROUS_PATTERNS = [
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /data\s*:/gi,
  /vbscript\s*:/gi,
  /<script[\s>]/gi,
  /<\/script>/gi,
  /<iframe[\s>]/gi,
  /<object[\s>]/gi,
  /<embed[\s>]/gi,
  /<form[\s>]/gi,
];

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // Remove dangerous patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Strip event handlers (onerror, onclick, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*\S+/gi, '');

  return sanitized;
}
