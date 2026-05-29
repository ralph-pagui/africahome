export function renderContact() {
  return `
  <div class="page-header"><h1>📞 Contactez-Nous</h1><p>Nous sommes là pour vous aider</p></div>
  <div class="contact-grid container">
    <div class="contact-info-card">
      <h3 style="color:#1a1a2e;margin-bottom:20px">Nos Coordonnées</h3>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(230,81,0,0.1);display:flex;align-items:center;justify-content:center;color:var(--orange);flex-shrink:0"><i class="fas fa-envelope"></i></div>
          <div><div style="font-size:.8rem;color:var(--gray)">Email</div><div style="color:#1a1a2e;font-size:.9rem">Africahome2026@gmail.com</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(46,125,50,0.1);display:flex;align-items:center;justify-content:center;color:var(--green);flex-shrink:0"><i class="fas fa-phone"></i></div>
          <div><div style="font-size:.8rem;color:var(--gray)">Téléphone</div><div style="color:#1a1a2e;font-size:.9rem">+237 651 810 270</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(37,211,102,0.1);display:flex;align-items:center;justify-content:center;color:#25D366;flex-shrink:0"><i class="fab fa-whatsapp"></i></div>
          <div><div style="font-size:.8rem;color:var(--gray)">WhatsApp</div><div style="color:#1a1a2e;font-size:.9rem">651 810 270</div></div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(59,89,152,0.1);display:flex;align-items:center;justify-content:center;color:#3b5998;flex-shrink:0"><i class="fab fa-facebook"></i></div>
          <div><div style="font-size:.8rem;color:var(--gray)">Facebook</div><a href="https://www.facebook.com/share/18UdVuaHzP/" target="_blank" style="color:var(--orange);font-size:.9rem">Page AfricaHome</a></div>
        </div>
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,0,0,0.1);display:flex;align-items:center;justify-content:center;color:#FF0000;flex-shrink:0"><i class="fab fa-youtube"></i></div>
          <div><div style="font-size:.8rem;color:var(--gray)">YouTube</div><a href="https://youtu.be/Yz6PFgaE2Uo" target="_blank" style="color:var(--orange);font-size:.9rem">Chaîne AfricaHome</a></div>
        </div>
      </div>
    </div>
    <div class="contact-info-card">
      <h3 style="color:#1a1a2e;margin-bottom:20px">Envoyez-nous un Message</h3>
      <form onsubmit="event.preventDefault();window.showToast('Message envoyé !','success')">
        <div class="form-group"><label>Nom complet</label><input type="text" placeholder="Votre nom" required /></div>
        <div class="form-group"><label>Email</label><input type="email" placeholder="votre@email.com" required /></div>
        <div class="form-group"><label>Sujet</label><input type="text" placeholder="Sujet du message" required /></div>
        <div class="form-group"><label>Message</label><textarea rows="4" placeholder="Votre message..." required style="width:100%;padding:12px 16px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:var(--radius-sm);color:#333;font-size:.9rem;resize:vertical"></textarea></div>
        <button type="submit" class="btn btn-primary btn-block"><i class="fas fa-paper-plane"></i> Envoyer</button>
      </form>
    </div>
  </div>`;
}
