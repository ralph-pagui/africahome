// Simple hash-based SPA Router with query param support
class Router {
  constructor() {
    this.routes = {};
    this.current = null;
    window.addEventListener('hashchange', () => this.resolve());
  }
  on(path, handler) { this.routes[path] = handler; return this; }
  resolve() {
    const fullHash = window.location.hash.slice(1) || '/';
    // Split hash from query string: /listings?country=X → path=/listings, query=country=X
    const [hashPath] = fullHash.split('?');
    const [path, ...paramParts] = hashPath.split('/').filter(Boolean);
    const route = '/' + (path || '');
    const param = paramParts.join('/');
    const handler = this.routes[route] || this.routes['/404'] || this.routes['/'];
    this.current = route;
    if (handler) handler(param);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  navigate(path) { window.location.hash = path; }
  start() { this.resolve(); }
}

export const router = new Router();
export function navigate(path) { router.navigate(path); }
