import { store } from '../store.js';
import { navigate } from '../router.js';
import { renderPhoneInput, getPhoneInputValue } from '../components/phone-input.js';
import { renderCountryOptions, getCountryCode } from '../utils.js';

export function renderPublish(editId) {
  const user = store.getCurrentUser();
  if (!user || user.type === 'locataire') return '<div class="auth-page"><div class="auth-card"><h2>Publication réservée</h2><p class="subtitle">Connectez-vous en tant que bailleur ou professionnel</p><a href="#/login" class="btn btn-primary btn-block">Se Connecter</a></div></div>';

  // Check subscription
  if (!user.subscription?.active) return '<div class="auth-page"><div class="auth-card"><h2>🔒 Abonnement requis</h2><p class="subtitle">Vous devez avoir un abonnement actif pour publier des annonces</p><a href="#/payment" class="btn btn-primary btn-block"><i class="fas fa-crown"></i> Activer mon abonnement</a><a href="#/pricing" class="btn btn-outline btn-block" style="margin-top:10px">Voir les tarifs</a></div></div>';

  // Edit mode: load existing listing data
  const isEdit = !!editId;
  const listing = isEdit ? store.getListing(editId) : null;
  if (isEdit && !listing) return '<div class="auth-page"><div class="auth-card"><h2>Annonce introuvable</h2><p class="subtitle">Cette annonce n\'existe pas ou a été supprimée.</p><a href="#/" class="btn btn-primary btn-block">Retour</a></div></div>';

  const pageTitle = isEdit ? '✏️ Modifier l\'Annonce' : '📝 Publier une Annonce';
  const pageSubtitle = isEdit ? 'Modifiez les informations de votre annonce' : 'Remplissez les informations de votre bien';
  const submitLabel = isEdit ? '<i class="fas fa-save"></i> Enregistrer les Modifications' : '<i class="fas fa-paper-plane"></i> Publier l\'Annonce';

  const contactPhoneVal = isEdit ? listing.contactPhone : user.phone || '';
  const contactPhoneCountry = isEdit ? listing.country : user.phoneCountry || user.country || 'Cameroun';
  const contactWhatsappVal = isEdit ? listing.contactWhatsapp : user.whatsapp || user.phone || '';
  const contactWhatsappCountry = isEdit ? listing.country : user.whatsappCountry || user.country || 'Cameroun';

  return `
  <div class="publish-page">
    <div class="container">
      ${isEdit ? '<a href="#" onclick="history.back();return false" style="display:inline-flex;align-items:center;gap:6px;color:var(--orange);font-size:.9rem;margin-bottom:16px"><i class="fas fa-arrow-left"></i> Retour</a>' : ''}
      <h1 style="font-size:1.6rem;color:#1a1a2e;margin-bottom:8px">${pageTitle}</h1>
      <p style="color:var(--gray);margin-bottom:30px">${pageSubtitle}</p>
      <div class="publish-form">
        <form onsubmit="window.handlePublish(event)" id="publish-form">
          <input type="hidden" id="pub-edit-id" value="${editId||''}" />
          <div class="detail-section">
            <h3>📸 Photos & Vidéos</h3>
            <div class="upload-zone" id="upload-zone" onclick="document.getElementById('pub-images').click()">
              <i class="fas fa-cloud-upload-alt" style="font-size:2.5rem;color:var(--orange);display:block"></i>
              <p style="color:var(--gray);font-size:.9rem;margin-top:8px">Cliquez ou glissez pour ajouter des photos et vidéos</p>
              <p style="color:#bbb;font-size:.75rem;margin-top:4px">JPG, PNG, MP4 · Max 10 fichiers</p>
              <input type="file" id="pub-images" accept="image/*,video/*" multiple style="display:none" onchange="window.handleMediaSelect(this)" />
            </div>
            <div class="upload-preview" id="media-preview">${isEdit && listing.images ? listing.images.map((img, i) => `
              <div class="upload-thumb" style="position:relative;width:100px;height:100px;border-radius:10px;overflow:hidden;border:2px solid #e0e0e0;flex-shrink:0">
                <img src="${img}" style="width:100%;height:100%;object-fit:cover" />
                <div style="position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(220,50,50,0.9);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:.65rem" onclick="window.removeExistingImage(${i},this)"><i class="fas fa-times"></i></div>
              </div>
            `).join('') : ''}</div>
          </div>
          <div class="detail-section">
            <h3>📋 Informations</h3>
            <div class="form-group"><label>Titre *</label><input type="text" id="pub-title" placeholder="Ex: Bel appartement 3 pièces" required value="${isEdit?listing.title:''}" /></div>
            <div class="form-group"><label>Description *</label><textarea id="pub-desc" rows="4" placeholder="Décrivez votre bien en détail..." required style="width:100%;padding:12px 16px;background:#f9f9f9;border:1.5px solid #e0e0e0;border-radius:var(--radius-sm);color:#333;font-size:.9rem;resize:vertical">${isEdit?listing.description:''}</textarea></div>
            <div class="form-row">
              <div class="form-group"><label>Catégorie *</label><select id="pub-category" required><option value="location" ${isEdit&&listing.category==='location'?'selected':''}>Location</option><option value="vente" ${isEdit&&listing.category==='vente'?'selected':''}>Vente</option><option value="terrain" ${isEdit&&listing.category==='terrain'?'selected':''}>Terrain</option><option value="construction" ${isEdit&&listing.category==='construction'?'selected':''}>Construction</option></select></div>
              <div class="form-group"><label>Type *</label><select id="pub-type" required><option value="chambre" ${isEdit&&listing.type==='chambre'?'selected':''}>Chambre</option><option value="studio" ${isEdit&&listing.type==='studio'?'selected':''}>Studio</option><option value="appartement" ${isEdit&&listing.type==='appartement'?'selected':''}>Appartement</option><option value="maison" ${isEdit&&listing.type==='maison'?'selected':''}>Maison</option><option value="terrain" ${isEdit&&listing.type==='terrain'?'selected':''}>Terrain</option><option value="plan3d" ${isEdit&&listing.type==='plan3d'?'selected':''}>Plan 3D</option></select></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Prix (FCFA) *</label><input type="number" id="pub-price" placeholder="85000" required value="${isEdit?listing.price:''}" /></div>
              <div class="form-group"><label>Pièces</label><input type="number" id="pub-rooms" placeholder="3" value="${isEdit&&listing.rooms?listing.rooms:''}" /></div>
            </div>
          </div>
          <div class="detail-section">
            <h3>📍 Localisation</h3>
            <div class="form-row">
              <div class="form-group">
                <label>Pays *</label>
                <select id="pub-country" required>
                  ${renderCountryOptions(isEdit ? listing.country : user.country || 'Cameroun', true)}
                </select>
              </div>
              <div class="form-group"><label>Ville *</label><input type="text" id="pub-city" placeholder="Ville" required value="${isEdit?listing.city:''}" /></div>
            </div>
            <div class="form-row">
              <div class="form-group"><label>Quartier</label><input type="text" id="pub-quarter" placeholder="Quartier" value="${isEdit?listing.quarter||'':''}" /></div>
              <div class="form-group"><label>Distance route</label><input type="text" id="pub-distance" placeholder="200m" value="${isEdit?listing.distanceRoute||'':''}" /></div>
            </div>
            <!-- GEOLOCATION -->
            <input type="hidden" id="pub-lat" value="${isEdit&&listing.lat?listing.lat:''}" />
            <input type="hidden" id="pub-lng" value="${isEdit&&listing.lng?listing.lng:''}" />
            <div class="geo-section">
              <div style="display:flex;gap:8px;flex-wrap:wrap">
                <button type="button" class="btn btn-outline" style="flex:1" id="geo-btn-address" onclick="window.geoLocateAddress()">
                  <i class="fas fa-search-location"></i> Localiser l'adresse saisie
                </button>
                <button type="button" class="btn btn-outline" style="flex:0 0 auto" id="geo-btn-gps" onclick="window.geoLocateGPS()" title="Utiliser ma position GPS actuelle">
                  <i class="fas fa-crosshairs"></i> Mon GPS
                </button>
              </div>
              <div id="geo-status" style="font-size:.82rem;color:var(--gray);margin-top:8px;text-align:center;display:none"></div>
              <div id="pub-map" style="height:280px;border-radius:var(--radius);margin-top:12px;border:2px solid var(--border);display:${isEdit&&listing.lat?'block':'none'}"></div>
              <p style="font-size:.75rem;color:var(--gray);margin-top:6px;text-align:center">
                <i class="fas fa-info-circle"></i> Cliquez sur la carte pour ajuster la position exacte du bien
              </p>
            </div>
          </div>
          <div class="detail-section">
            <h3>📞 Contact</h3>
            <div class="form-row">
              ${renderPhoneInput({
                id: 'pub-phone',
                label: 'Téléphone *',
                defaultCountry: contactPhoneCountry,
                defaultPhone: contactPhoneVal,
                required: true,
                syncWithCountrySelect: 'pub-country'
              })}
              ${renderPhoneInput({
                id: 'pub-whatsapp',
                label: 'WhatsApp *',
                defaultCountry: contactWhatsappCountry,
                defaultPhone: contactWhatsappVal,
                required: true,
                syncWithCountrySelect: 'pub-country'
              })}
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" id="pub-submit-btn">${submitLabel}</button>
        </form>
      </div>
    </div>
  </div>`;
}

// Store selected media files
window._publishMedia = [];
// Track existing images to keep (for edit mode)
window._existingImages = null;

window.removeExistingImage = (idx, el) => {
  if (window._existingImages) {
    window._existingImages[idx] = null;
  }
  el.closest('.upload-thumb').remove();
};

window.handleMediaSelect = (input) => {
  const files = Array.from(input.files);
  const preview = document.getElementById('media-preview');
  
  files.forEach(file => {
    if (window._publishMedia.length >= 10) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const idx = window._publishMedia.length;
      window._publishMedia.push({ dataUrl, type: file.type, name: file.name });
      
      const isVideo = file.type.startsWith('video/');
      const thumb = document.createElement('div');
      thumb.className = 'upload-thumb';
      thumb.style.cssText = 'position:relative;width:100px;height:100px;border-radius:10px;overflow:hidden;border:2px solid #e0e0e0;flex-shrink:0';
      
      if (isVideo) {
        thumb.innerHTML = `
          <video src="${dataUrl}" style="width:100%;height:100%;object-fit:cover" muted></video>
          <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.3)">
            <i class="fas fa-play-circle" style="color:#fff;font-size:1.5rem"></i>
          </div>
          <div style="position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(220,50,50,0.9);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:.65rem" onclick="window.removeMedia(${idx},this)"><i class="fas fa-times"></i></div>
        `;
      } else {
        thumb.innerHTML = `
          <img src="${dataUrl}" style="width:100%;height:100%;object-fit:cover" />
          <div style="position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;background:rgba(220,50,50,0.9);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:.65rem" onclick="window.removeMedia(${idx},this)"><i class="fas fa-times"></i></div>
        `;
      }
      preview.appendChild(thumb);
    };
    reader.readAsDataURL(file);
  });
  
  // Update upload zone text
  setTimeout(() => {
    const count = window._publishMedia.length + files.length;
    const zone = document.getElementById('upload-zone');
    if (zone) {
      const p = zone.querySelector('p');
      if (p) p.textContent = `${count} fichier(s) sélectionné(s) · Cliquez pour en ajouter`;
    }
  }, 300);
};

window.removeMedia = (idx, el) => {
  window._publishMedia[idx] = null;
  el.closest('.upload-thumb').remove();
};

window.handlePublish = (e) => {
  e.preventDefault();
  const user = store.getCurrentUser();
  const editId = document.getElementById('pub-edit-id')?.value;
  const isEdit = !!editId;
  
  const phoneVal = getPhoneInputValue('pub-phone');
  const whatsappVal = getPhoneInputValue('pub-whatsapp');
  
  if (!phoneVal.valid) {
    window.showToast(`Téléphone : ${phoneVal.error}`, 'error');
    return;
  }
  if (!whatsappVal.valid) {
    window.showToast(`WhatsApp : ${whatsappVal.error}`, 'error');
    return;
  }
  
  // Collect media (filter nulls from removed items)
  const media = window._publishMedia.filter(Boolean);
  const newImages = media.filter(m => m.type.startsWith('image/')).map(m => m.dataUrl);
  const videos = media.filter(m => m.type.startsWith('video/')).map(m => m.dataUrl);
  
  // In edit mode, keep existing images that weren't removed
  let images;
  if (isEdit && window._existingImages) {
    const kept = window._existingImages.filter(Boolean);
    images = [...kept, ...newImages];
  } else {
    images = newImages;
  }
  
  // Use default image if none
  if (images.length === 0 && videos.length === 0) {
    images.push('/images/apartment.png');
  }
  
  const listingData = {
    type: document.getElementById('pub-type').value,
    category: document.getElementById('pub-category').value,
    title: document.getElementById('pub-title').value,
    description: document.getElementById('pub-desc').value,
    price: parseInt(document.getElementById('pub-price').value),
    currency: 'FCFA',
    country: document.getElementById('pub-country').value,
    city: document.getElementById('pub-city').value,
    quarter: document.getElementById('pub-quarter').value,
    distanceRoute: document.getElementById('pub-distance').value,
    rooms: parseInt(document.getElementById('pub-rooms').value) || 0,
    images,
    videos,
    available: true,
    contactPhone: phoneVal.digits,
    contactWhatsapp: whatsappVal.digits,
    lat: parseFloat(document.getElementById('pub-lat').value) || null,
    lng: parseFloat(document.getElementById('pub-lng').value) || null
  };

  if (isEdit) {
    store.updateListing(editId, listingData);
    window.showToast('Annonce modifiée avec succès ! ✅', 'success');
  } else {
    listingData.userId = user.id;
    store.addListing(listingData);
    window.showToast('Annonce publiée avec succès ! 🎉', 'success');
  }
  
  window._publishMedia = [];
  window._existingImages = null;
  navigate(user.type === 'professionnel' ? '/dashboard-pro' : '/dashboard-bailleur');
};

// Initialize existing images tracking when page loads in edit mode
window.addEventListener('hashchange', () => {
  const hash = window.location.hash;
  if (hash.startsWith('#/publish/')) {
    const editId = hash.split('/')[2];
    if (editId) {
      const listing = store.getListing(editId);
      if (listing && listing.images) {
        window._existingImages = [...listing.images];
      }
      // Init map if listing has coords
      if (listing && listing.lat && listing.lng) {
        setTimeout(() => window.initPublishMap(listing.lat, listing.lng), 300);
      }
    }
  } else {
    window._publishMedia = [];
    window._existingImages = null;
  }
});

// ============= GEOLOCATION =============

window._pubMap = null;
window._pubMarker = null;

// PRIMARY: Geocode the address the user typed (city + quarter)
window.geoLocateAddress = async () => {
  const city = document.getElementById('pub-city')?.value?.trim();
  const quarter = document.getElementById('pub-quarter')?.value?.trim();
  const country = document.getElementById('pub-country')?.value?.trim();
  const status = document.getElementById('geo-status');
  const btn = document.getElementById('geo-btn-address');
  status.style.display = 'block';
  
  if (!city) {
    status.innerHTML = '<span style="color:#c62828"><i class="fas fa-exclamation-triangle"></i> Remplissez d\'abord le champ Ville ci-dessus</span>';
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche...';
  const query = [quarter, city, country].filter(Boolean).join(', ');
  status.innerHTML = `<i class="fas fa-search"></i> Recherche de : <strong>${query}</strong>...`;
  
  try {
    const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`, {
      headers: { 'Accept-Language': 'fr' }
    });
    const results = await resp.json();
    
    if (results.length > 0) {
      const { lat, lon, display_name } = results[0];
      document.getElementById('pub-lat').value = lat;
      document.getElementById('pub-lng').value = lon;
      
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle" style="color:var(--green)"></i> Adresse localisée !';
      status.innerHTML = `<span style="color:var(--green)"><i class="fas fa-map-marker-alt"></i> ${display_name}</span>`;
      
      window.initPublishMap(parseFloat(lat), parseFloat(lon));
    } else {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-search-location"></i> Réessayer';
      status.innerHTML = `<span style="color:#c62828"><i class="fas fa-exclamation-triangle"></i> Adresse non trouvée. Essayez "Mon GPS" ou cliquez sur la carte.</span>`;
      // Show map centered on country as fallback
      const fallback = { 'Cameroun': [5.95, 10.15], 'Sénégal': [14.69, -17.44], "Côte d'Ivoire": [5.35, -4.0], 'RD Congo': [-4.32, 15.31] };
      const center = fallback[country] || [5.95, 10.15];
      window.initPublishMap(center[0], center[1]);
    }
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search-location"></i> Réessayer';
    status.innerHTML = '<span style="color:#c62828"><i class="fas fa-wifi"></i> Erreur réseau. Vérifiez votre connexion.</span>';
  }
};

// SECONDARY: Use browser GPS (user's current position)
window.geoLocateGPS = () => {
  const status = document.getElementById('geo-status');
  const btn = document.getElementById('geo-btn-gps');
  status.style.display = 'block';
  
  if (!navigator.geolocation) {
    status.innerHTML = '<span style="color:#c62828"><i class="fas fa-exclamation-triangle"></i> Géolocalisation non supportée</span>';
    return;
  }
  
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  status.innerHTML = '<i class="fas fa-satellite-dish"></i> Recherche GPS en cours...';
  
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      document.getElementById('pub-lat').value = lat;
      document.getElementById('pub-lng').value = lng;
      
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-check-circle" style="color:var(--green)"></i>';
      status.innerHTML = `<span style="color:var(--green)"><i class="fas fa-map-marker-alt"></i> Position GPS : ${lat.toFixed(6)}, ${lng.toFixed(6)}</span><br><span style="font-size:.75rem;color:var(--gray)">⚠️ C'est votre position actuelle. Ajustez le marqueur si le bien est ailleurs.</span>`;
      
      window.initPublishMap(lat, lng);
    },
    (err) => {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-crosshairs"></i> GPS';
      const messages = { 1: 'Accès GPS refusé.', 2: 'Position introuvable.', 3: 'Délai dépassé.' };
      status.innerHTML = `<span style="color:#c62828"><i class="fas fa-exclamation-triangle"></i> ${messages[err.code] || 'Erreur'}</span>`;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
};

window.initPublishMap = (lat, lng) => {
  const mapEl = document.getElementById('pub-map');
  if (!mapEl) return;
  mapEl.style.display = 'block';
  
  // Destroy old map if exists
  if (window._pubMap) {
    window._pubMap.remove();
    window._pubMap = null;
  }
  
  const map = L.map('pub-map').setView([lat, lng], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  
  const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
  marker.bindPopup('📍 Position du bien').openPopup();
  
  // Update coords when marker is dragged
  marker.on('dragend', () => {
    const pos = marker.getLatLng();
    document.getElementById('pub-lat').value = pos.lat;
    document.getElementById('pub-lng').value = pos.lng;
    document.getElementById('geo-status').innerHTML = `<span style="color:var(--green)"><i class="fas fa-map-marker-alt"></i> Coordonnées : ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}</span>`;
  });
  
  // Click map to reposition marker
  map.on('click', (e) => {
    marker.setLatLng(e.latlng);
    document.getElementById('pub-lat').value = e.latlng.lat;
    document.getElementById('pub-lng').value = e.latlng.lng;
    document.getElementById('geo-status').innerHTML = `<span style="color:var(--green)"><i class="fas fa-map-marker-alt"></i> Coordonnées : ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}</span>`;
  });
  
  window._pubMap = map;
  window._pubMarker = marker;
  
  // Fix rendering issue with hidden containers
  setTimeout(() => map.invalidateSize(), 100);
};
