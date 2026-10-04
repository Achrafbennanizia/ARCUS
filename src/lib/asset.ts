/** Prefix public paths for GitHub Pages project site. */
export function asset(path: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (base && normalized.startsWith(`${base}/`)) return normalized;
  return `${base}${normalized}`;
}
