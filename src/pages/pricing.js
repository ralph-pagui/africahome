import { store } from '../store.js';

export function renderPricing() {
  const user = store.getCurrentUser();
  const isLogged = !!user;

  return `
  <div class="page-header"><h1>💳 Nos Tarifs</h1><p>Des plans adaptés à tous les profils · Paiement sécurisé via KPay</p></div>
  <section class="section">
    <div class="container">
      <div class="pricing-grid">
        <!-- LOCATAIRE -->
        <div class="pricing-card">
          <div class="icon">🔍</div>
          <h3>Locataire</h3>
          <div class="subtitle">Accès aux annonces</div>
          <div class="price">1 500 <span>FCFA</span></div>
          <div class="period">Paiement unique</div>
          <ul class="pricing-features">
            <li><i class="fas fa-check"></i>Accès à toutes les annonces</li>
            <li><i class="fas fa-check"></i>Photos et vidéos HD</li>
            <li><i class="fas fa-check"></i>Contact direct bailleur</li>
            <li><i class="fas fa-check"></i>Filtres de recherche avancés</li>
            <li><i class="fas fa-check"></i>Favoris illimités</li>
            <li><i class="fas fa-check"></i>Géolocalisation des biens</li>
          </ul>
          ${isLogged && user.type === 'locataire'
            ? `<a href="#/payment" class="btn btn-outline btn-block">${user.subscription?.active ? '✅ Actif' : '<i class="fas fa-lock"></i> Payer 1 500 FCFA'}</a>`
            : `<a href="#/register" class="btn btn-outline btn-block">S'inscrire</a>`}
        </div>
        
        <!-- BAILLEUR -->
        <div class="pricing-card featured">
          <div class="icon">🏠</div>
          <h3>Bailleur</h3>
          <div class="subtitle">Publiez vos biens</div>
          <div class="price">2 500 <span>FCFA</span></div>
          <div class="period">/ mois — ou 15 000 FCFA/an</div>
          <ul class="pricing-features">
            <li><i class="fas fa-check"></i>Publier des annonces illimitées</li>
            <li><i class="fas fa-check"></i>Images et vidéos HD</li>
            <li><i class="fas fa-check"></i>Gestion des annonces</li>
            <li><i class="fas fa-check"></i>Statistiques de vues détaillées</li>
            <li><i class="fas fa-check"></i>Contact WhatsApp direct</li>
            <li><i class="fas fa-check"></i>Support prioritaire</li>
          </ul>
          ${isLogged && user.type === 'bailleur'
            ? `<a href="#/payment" class="btn btn-primary btn-block">${user.subscription?.active ? '✅ Abonnement Actif' : '<i class="fas fa-lock"></i> S\'abonner'}</a>`
            : `<a href="#/register" class="btn btn-primary btn-block">S'inscrire</a>`}
        </div>
        
        <!-- PROFESSIONNEL -->
        <div class="pricing-card">
          <div class="icon">🏢</div>
          <h3>Professionnel</h3>
          <div class="subtitle">Agences & Entreprises</div>
          <div class="price">15 000 <span>FCFA</span></div>
          <div class="period">/ mois — ou 120 000 FCFA/an</div>
          <ul class="pricing-features">
            <li><i class="fas fa-check"></i>Tout le plan Bailleur</li>
            <li><i class="fas fa-check"></i>Badge Vérifié ✅</li>
            <li><i class="fas fa-check"></i>Maisons, Terrains, Plans 3D</li>
            <li><i class="fas fa-check"></i>Services Construction & BTP</li>
            <li><i class="fas fa-check"></i>Électroménager & Décoration</li>
            <li><i class="fas fa-check"></i>Visibilité prioritaire</li>
          </ul>
          ${isLogged && user.type === 'professionnel'
            ? `<a href="#/payment" class="btn btn-green btn-block">${user.subscription?.active ? '✅ Abonnement Actif' : '<i class="fas fa-lock"></i> S\'abonner'}</a>`
            : `<a href="#/register" class="btn btn-green btn-block">S'inscrire</a>`}
        </div>
      </div>
      
      <!-- COMPARISON TABLE -->
      <div style="margin-top:48px">
        <h2 style="text-align:center;margin-bottom:24px;font-size:1.3rem;color:#1a1a2e"><i class="fas fa-table" style="color:var(--orange);margin-right:8px"></i>Comparaison des Plans</h2>
        <div class="admin-table-wrapper" style="max-width:750px;margin:0 auto">
          <table class="admin-table" style="font-size:.85rem">
            <thead><tr><th>Fonctionnalité</th><th style="text-align:center">🔍 Locataire</th><th style="text-align:center">🏠 Bailleur</th><th style="text-align:center">🏢 Pro</th></tr></thead>
            <tbody>
              <tr><td>Prix</td><td style="text-align:center;font-weight:600;color:var(--orange)">1 500 F</td><td style="text-align:center;font-weight:600;color:var(--orange)">2 500 F/mois</td><td style="text-align:center;font-weight:600;color:var(--orange)">15 000 F/mois</td></tr>
              <tr><td>Voir les annonces</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td></tr>
              <tr><td>Publier des annonces</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td></tr>
              <tr><td>Photos & vidéos</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td></tr>
              <tr><td>Contact direct</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td></tr>
              <tr><td>WhatsApp</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td></tr>
              <tr><td>Statistiques vues</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td><td style="text-align:center">✅</td></tr>
              <tr><td>Badge Vérifié</td><td style="text-align:center">❌</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td></tr>
              <tr><td>Services BTP</td><td style="text-align:center">❌</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td></tr>
              <tr><td>Visibilité prioritaire</td><td style="text-align:center">❌</td><td style="text-align:center">❌</td><td style="text-align:center">✅</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PAYMENT METHODS -->
      <div style="text-align:center;margin-top:48px">
        <div class="detail-section" style="max-width:600px;margin:0 auto">
          <h3><i class="fas fa-shield-alt" style="color:var(--green);margin-right:8px"></i>Paiement Sécurisé via KPay</h3>
          <p style="font-size:.85rem;color:var(--gray);margin:12px 0 20px">Tous les paiements sont traités de manière sécurisée par KPay</p>
          <div style="display:flex;justify-content:center;gap:24px;flex-wrap:wrap">
            <div style="text-align:center"><div style="font-size:2rem">🟠</div><div style="font-size:.85rem;color:var(--text);margin-top:4px">Orange Money</div></div>
            <div style="text-align:center"><div style="font-size:2rem">🟡</div><div style="font-size:.85rem;color:var(--text);margin-top:4px">MTN MoMo</div></div>
            <div style="text-align:center"><div style="font-size:2rem">🔵</div><div style="font-size:.85rem;color:var(--text);margin-top:4px">Moov Money</div></div>
            <div style="text-align:center"><div style="font-size:2rem">💳</div><div style="font-size:.85rem;color:var(--text);margin-top:4px">Visa / Mastercard</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}
