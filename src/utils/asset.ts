/**
 * Resolves a public-directory path against the deployment base.
 *
 * Asset paths live in the catalog and JSX as root-relative strings
 * (`/products/cam-v4.jpg`). Those are runtime values, not imports, so Vite
 * cannot rewrite them at build time — served from a subpath such as GitHub
 * Pages' `/wyze-bundle-builder/` they would all 404. Routing them through
 * `import.meta.env.BASE_URL` keeps one spelling working under both.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL;
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
