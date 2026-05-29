/**
 * AfricaHome Phone Input Widget
 * Reusable international phone input with African country selector.
 *
 * Usage:
 *   renderPhoneInput({ id, defaultCountry, defaultPhone, required, label, syncWithCountrySelect })
 *   getPhoneInputValue(id)   → { digits, country, code, e164, valid, error }
 *   setPhoneInputCountry(id, countryName)
 */
import { AFRICAN_COUNTRIES, ALL_COUNTRY_NAMES, validatePhone, normalizePhone } from '../utils.js';

// ===================================================
// RENDER
// ===================================================
/**
 * @param {object} opts
 *   id                    : unique base id (e.g. 'reg-phone' → creates 'reg-phone-country', 'reg-phone-number')
 *   label                 : string label text (default: 'Numéro de téléphone *')
 *   defaultCountry        : initial country name (default: 'Cameroun')
 *   defaultPhone          : initial number digits (without country code)
 *   required              : boolean
 *   syncWithCountrySelect : id of a <select> whose changes auto-update this widget's country
 *   showOperators         : bool – show operator hint (default: true)
 *   placeholder           : override the placeholder text
 */
export function renderPhoneInput({
  id = 'phone',
  label = 'Numéro de téléphone (WhatsApp + Appel) *',
  defaultCountry = 'Cameroun',
  defaultPhone = '',
  required = true,
  syncWithCountrySelect = null,
  showOperators = true,
  placeholder = null
} = {}) {
  const info = AFRICAN_COUNTRIES[defaultCountry] || AFRICAN_COUNTRIES['Cameroun'];
  const phLabel = placeholder || `Ex: ${_exampleFor(defaultCountry)}`;
  const reqAttr = required ? 'required' : '';

  const countryOpts = ALL_COUNTRY_NAMES.map(name => {
    const c = AFRICAN_COUNTRIES[name];
    const sel = name === defaultCountry ? 'selected' : '';
    return `<option value="${name}" ${sel}>${c.flag} +${c.code}</option>`;
  }).join('');

  const operatorsHtml = showOperators
    ? `<div id="${id}-operators" style="font-size:.72rem;color:var(--gray);margin-top:4px;display:flex;align-items:center;gap:4px">
         <i class="fas fa-signal" style="color:var(--orange);font-size:.6rem"></i>
         <span>${info.operators.join(' · ')}</span>
       </div>`
    : '';

  return `
  <div class="form-group phone-input-widget" id="${id}-widget">
    <label>${label}</label>
    <div style="display:flex;gap:0;border:1.5px solid #e0e0e0;border-radius:var(--radius-sm);background:#f9f9f9;overflow:hidden;transition:border-color 0.2s" id="${id}-wrap">
      <select
        id="${id}-country"
        style="border:none;background:transparent;padding:10px 4px 10px 10px;font-size:.85rem;cursor:pointer;outline:none;min-width:90px;color:#1a1a2e;font-weight:600;flex-shrink:0"
        onchange="window._phoneWidgetCountryChange('${id}')"
        aria-label="Indicatif pays"
      >${countryOpts}</select>
      <div style="width:1px;background:#e0e0e0;align-self:stretch;margin:8px 0"></div>
      <input
        type="tel"
        id="${id}-number"
        placeholder="${phLabel}"
        value="${defaultPhone}"
        ${reqAttr}
        inputmode="numeric"
        autocomplete="tel"
        style="flex:1;border:none;background:transparent;padding:10px 12px;font-size:.9rem;outline:none;color:#1a1a2e;min-width:0"
        oninput="window._phoneWidgetValidate('${id}')"
        onfocus="document.getElementById('${id}-wrap').style.borderColor='var(--orange)'"
        onblur="document.getElementById('${id}-wrap').style.borderColor='#e0e0e0';window._phoneWidgetValidate('${id}')"
      />
    </div>
    ${operatorsHtml}
    <div id="${id}-hint" style="font-size:.72rem;margin-top:3px;display:none"></div>
    ${syncWithCountrySelect ? `<script>
      window._phoneWidgetSync = window._phoneWidgetSync || {};
      if (!window._phoneWidgetSync['${syncWithCountrySelect}']) {
        window._phoneWidgetSync['${syncWithCountrySelect}'] = '${id}';
      } else if (typeof window._phoneWidgetSync['${syncWithCountrySelect}'] === 'string') {
        window._phoneWidgetSync['${syncWithCountrySelect}'] = [window._phoneWidgetSync['${syncWithCountrySelect}'], '${id}'];
      } else {
        window._phoneWidgetSync['${syncWithCountrySelect}'].push('${id}');
      }
    </script>` : ''}
  </div>`;
}

// ===================================================
// GET VALUE
// ===================================================
/**
 * Returns the current value of the phone widget.
 * @returns {{ digits, country, code, e164, formatted, valid, error }}
 */
export function getPhoneInputValue(id) {
  const countryEl = document.getElementById(`${id}-country`);
  const numberEl = document.getElementById(`${id}-number`);
  if (!countryEl || !numberEl) return { valid: false, error: 'Widget non trouvé' };

  const country = countryEl.value;
  const raw = numberEl.value;
  return { country, ...validatePhone(raw, country) };
}

// ===================================================
// SET COUNTRY PROGRAMMATICALLY
// ===================================================
export function setPhoneInputCountry(id, countryName) {
  const countryEl = document.getElementById(`${id}-country`);
  if (!countryEl) return;
  // Try to find the matching option
  for (const opt of countryEl.options) {
    if (opt.value === countryName) {
      opt.selected = true;
      break;
    }
  }
  window._phoneWidgetCountryChange(id);
}

// ===================================================
// GLOBAL HANDLERS (called from inline HTML)
// ===================================================
window._phoneWidgetCountryChange = (id) => {
  const countryEl = document.getElementById(`${id}-country`);
  const hintEl = document.getElementById(`${id}-hint`);
  const opsEl = document.getElementById(`${id}-operators`);
  const numberEl = document.getElementById(`${id}-number`);
  if (!countryEl) return;

  const country = countryEl.value;
  const info = AFRICAN_COUNTRIES[country];
  if (!info) return;

  // Update placeholder
  if (numberEl) numberEl.placeholder = `Ex: ${_exampleFor(country)}`;

  // Update operators display
  if (opsEl) {
    opsEl.querySelector('span').textContent = info.operators.join(' · ');
  }

  // Validate current number with new country
  window._phoneWidgetValidate(id);
};

window._phoneWidgetValidate = (id) => {
  const countryEl = document.getElementById(`${id}-country`);
  const numberEl = document.getElementById(`${id}-number`);
  const hintEl = document.getElementById(`${id}-hint`);
  const wrapEl = document.getElementById(`${id}-wrap`);
  if (!countryEl || !numberEl || !hintEl) return;

  const country = countryEl.value;
  const raw = numberEl.value;
  if (!raw) { hintEl.style.display = 'none'; return; }

  const result = validatePhone(raw, country);
  hintEl.style.display = 'block';

  if (result.valid) {
    hintEl.style.color = '#2e7d32';
    hintEl.innerHTML = `<i class="fas fa-check-circle"></i> ${result.formatted}`;
    if (wrapEl) wrapEl.style.borderColor = '#2e7d32';
  } else {
    hintEl.style.color = '#c62828';
    hintEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${result.error}`;
    if (wrapEl) wrapEl.style.borderColor = '#e53935';
  }
};

// ===================================================
// COUNTRY → PHONE SYNC (auto-update widget when
// a separate country <select> changes)
// ===================================================
document.addEventListener('change', (e) => {
  const mapping = window._phoneWidgetSync || {};
  if (e.target.tagName === 'SELECT') {
    const targets = mapping[e.target.id];
    if (targets) {
      if (Array.isArray(targets)) {
        targets.forEach(t => setPhoneInputCountry(t, e.target.value));
      } else {
        setPhoneInputCountry(targets, e.target.value);
      }
    }
  }
});

// ===================================================
// EXAMPLES PER COUNTRY
// ===================================================
function _exampleFor(country) {
  const examples = {
    'Cameroun': '651 810 270',
    'Sénégal': '77 123 45 67',
    "Côte d'Ivoire": '07 12 34 56 78',
    'RD Congo': '097 123 4567',
    'Gabon': '06 12 34 56',
    'Congo': '06 123 4567',
    'Mali': '70 12 34 56',
    'Burkina Faso': '70 12 34 56',
    'Guinée': '622 12 34 56',
    'Bénin': '97 12 34 56',
    'Togo': '90 12 34 56',
    'Niger': '93 12 34 56',
    'Tchad': '63 12 34 56',
    'Madagascar': '32 12 345 67',
    'Maroc': '6 12 34 56 78',
    'Algérie': '551 234 567',
    'Tunisie': '20 123 456',
    'Ghana': '024 123 4567',
    'Nigeria': '080 1234 5678',
    'Kenya': '712 345 678',
    'Rwanda': '072 123 4567',
    'Tanzanie': '071 234 5678',
    'Angola': '923 456 789',
    'Mozambique': '84 123 4567',
    'Éthiopie': '091 234 5678',
  };
  return examples[country] || '6XX XXX XXX';
}
