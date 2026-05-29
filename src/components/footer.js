export function renderFooter() {
  return `
  <footer class="footer">
    <div class="footer-grid">
      <div class="footer-col">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
          <img src="/logo.jpg" alt="AfricaHome" style="width:48px;height:48px;border-radius:50%;object-fit:cover" />
          <div>
            <h4 style="margin-bottom:2px">AfricaHome</h4>
            <span style="font-size:.75rem;color:var(--orange)">Société Immobilière</span>
          </div>
        </div>
        <p>La plateforme immobilière leader en Afrique. Trouvez votre logement idéal en toute simplicité.</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/share/18UdVuaHzP/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook-f"></i></a>
          <a href="https://youtu.be/Yz6PFgaE2Uo" target="_blank" rel="noopener noreferrer"><i class="fab fa-youtube"></i></a>
          <a href="https://wa.me/237651810270" target="_blank" rel="noopener noreferrer"><i class="fab fa-whatsapp"></i></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Navigation</h4>
        <a href="#/">Accueil</a>
        <a href="#/listings">Annonces</a>
        <a href="#/pricing">Tarifs</a>
        <a href="#/about">À Propos</a>
        <a href="#/contact">Contact</a>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="#/listings?category=location">Location</a>
        <a href="#/listings?category=vente">Vente Immobilière</a>
        <a href="#/listings?category=terrain">Terrains</a>
        <a href="#/listings?category=construction">Plans 3D</a>
        <a href="#/listings?category=construction">Construction</a>
        <a href="#/listings">Décoration</a>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <p><i class="fas fa-envelope" style="color:var(--orange);margin-right:8px"></i>Africahome2026@gmail.com</p>
        <p style="margin-top:8px"><i class="fas fa-phone" style="color:var(--orange);margin-right:8px"></i>+237 651 810 270</p>
        <p style="margin-top:8px"><i class="fab fa-whatsapp" style="color:var(--green);margin-right:8px"></i>WhatsApp: 651 810 270</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2026 AfricaHome - Société Immobilière. Tous droits réservés.</p>
    </div>
  </footer>`;
}
