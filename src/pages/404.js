export function render404() {
  return `
  <div style="min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px">
    <div style="font-size:6rem;margin-bottom:10px;line-height:1">🏠</div>
    <h1 style="font-family:var(--font-display);font-size:3rem;font-weight:800;color:var(--orange);margin-bottom:8px">404</h1>
    <h2 style="font-size:1.4rem;color:#1a1a2e;margin-bottom:12px">Page introuvable</h2>
    <p style="color:var(--gray);font-size:.95rem;max-width:400px;margin-bottom:24px">
      La page que vous recherchez n'existe pas ou a été déplacée.
    </p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
      <a href="#/" class="btn btn-primary"><i class="fas fa-home"></i> Accueil</a>
      <a href="#/listings" class="btn btn-outline"><i class="fas fa-search"></i> Annonces</a>
    </div>
  </div>`;
}
