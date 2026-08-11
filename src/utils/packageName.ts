/**
 * Utility to sanitize raw string into a strictly valid Android Package Name.
 * Android package name rules:
 * - Must contain at least two segments separated by a dot (e.g. com.example.app).
 * - Must start with a lowercase letter.
 * - Each segment must contain only lowercase ASCII letters, digits, or underscores.
 * - No hyphens, spaces, uppercase letters, or special symbols.
 */
export function sanitizePackageName(rawPkg?: string): string {
  if (!rawPkg || typeof rawPkg !== 'string') return 'com.jooexe.app';

  // Convert to lowercase and trim
  let pkg = rawPkg.toLowerCase().trim();

  // Replace spaces, hyphens, and illegal characters with underscores
  pkg = pkg.replace(/[^a-z0-9._]/g, '_');

  // Split into dot-separated segments
  let segments = pkg.split('.').filter(Boolean);

  // Android package name must have at least 2 segments
  if (segments.length < 2) {
    if (segments.length === 1) {
      segments = ['com', 'jooexe', segments[0]];
    } else {
      segments = ['com', 'jooexe', 'app'];
    }
  }

  // Ensure each segment starts with a letter and is valid
  const cleanSegments = segments.map((seg, idx) => {
    let s = seg.replace(/^[^a-z]+/, '');
    if (!s) s = idx === 0 ? 'com' : 'app';
    return s;
  });

  let result = cleanSegments.join('.');

  // Final regex check
  if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(result)) {
    return 'com.jooexe.app';
  }

  return result;
}
