// AfricaHome Utilities — Gestion Pro des numéros africains

// ===================================================
// BASE DE DONNÉES COMPLÈTE DES PAYS AFRICAINS
// ===================================================
export const AFRICAN_COUNTRIES = {
  'Cameroun':         { code: '237', flag: '🇨🇲', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['Orange CM', 'MTN CM'] },
  'Sénégal':          { code: '221', flag: '🇸🇳', minLen: 9,  maxLen: 9,  format: 'XX XXX XX XX',  operators: ['Orange SN', 'Free SN', 'Expresso'] },
  "Côte d'Ivoire":    { code: '225', flag: '🇨🇮', minLen: 10, maxLen: 10, format: 'XX XX XX XX XX', operators: ['Orange CI', 'MTN CI', 'Moov Africa'] },
  'RD Congo':         { code: '243', flag: '🇨🇩', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['Vodacom', 'Airtel', 'Orange CDG'] },
  'Gabon':            { code: '241', flag: '🇬🇦', minLen: 7,  maxLen: 8,  format: 'X XX XX XX',   operators: ['Airtel Gabon', 'Moov Gabon'] },
  'Congo':            { code: '242', flag: '🇨🇬', minLen: 9,  maxLen: 9,  format: 'XX XXX XXXX',  operators: ['Airtel Congo', 'MTN Congo'] },
  'Mali':             { code: '223', flag: '🇲🇱', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Orange Mali', 'Moov Mali'] },
  'Burkina Faso':     { code: '226', flag: '🇧🇫', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Orange BF', 'Moov Africa'] },
  'Guinée':           { code: '224', flag: '🇬🇳', minLen: 9,  maxLen: 9,  format: 'XXX XX XX XX', operators: ['Orange GN', 'MTN GN'] },
  'Bénin':            { code: '229', flag: '🇧🇯', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Moov Africa', 'MTN Bénin'] },
  'Togo':             { code: '228', flag: '🇹🇬', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Togocel', 'Moov Africa'] },
  'Niger':            { code: '227', flag: '🇳🇪', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Airtel Niger', 'Moov Niger'] },
  'Tchad':            { code: '235', flag: '🇹🇩', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Airtel Tchad', 'Moov Tchad'] },
  'Madagascar':       { code: '261', flag: '🇲🇬', minLen: 9,  maxLen: 9,  format: 'XX XX XXX XX', operators: ['Telma', 'Airtel MG', 'Orange MG'] },
  'Maroc':            { code: '212', flag: '🇲🇦', minLen: 9,  maxLen: 9,  format: 'X XX XX XX XX', operators: ['Maroc Telecom', 'Orange MA', 'Inwi'] },
  'Algérie':          { code: '213', flag: '🇩🇿', minLen: 9,  maxLen: 9,  format: 'XXX XX XX XX', operators: ['Djezzy', 'Ooredoo', 'Mobilis'] },
  'Tunisie':          { code: '216', flag: '🇹🇳', minLen: 8,  maxLen: 8,  format: 'XX XXX XXX',   operators: ['Ooredoo TN', 'Orange TN', 'Tunisie Telecom'] },
  'Ghana':            { code: '233', flag: '🇬🇭', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['MTN Ghana', 'AirtelTigo', 'Vodafone GH'] },
  'Nigeria':          { code: '234', flag: '🇳🇬', minLen: 10, maxLen: 10, format: 'XXX XXX XXXX', operators: ['MTN NG', 'Airtel NG', 'Glo', '9mobile'] },
  'Kenya':            { code: '254', flag: '🇰🇪', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['Safaricom', 'Airtel KE', 'Telkom KE'] },
  'Rwanda':           { code: '250', flag: '🇷🇼', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['MTN RW', 'Airtel RW'] },
  'Tanzanie':         { code: '255', flag: '🇹🇿', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['Vodacom TZ', 'Airtel TZ', 'Tigo TZ'] },
  'Angola':           { code: '244', flag: '🇦🇴', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['Unitel', 'Movicel'] },
  'Mozambique':       { code: '258', flag: '🇲🇿', minLen: 9,  maxLen: 9,  format: 'XX XXX XXXX',  operators: ['Vodacom MZ', 'Movitel'] },
  'Éthiopie':         { code: '251', flag: '🇪🇹', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['Ethio Telecom', 'Safaricom ET'] },
  'Ouganda':          { code: '256', flag: '🇺🇬', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['MTN UG', 'Airtel UG'] },
  'Zambie':           { code: '260', flag: '🇿🇲', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['MTN ZM', 'Airtel ZM', 'Zamtel'] },
  'Zimbabwe':         { code: '263', flag: '🇿🇼', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['Econet', 'NetOne', 'Telecel'] },
  'Guinée Équatoriale': { code: '240', flag: '🇬🇶', minLen: 9, maxLen: 9, format: 'XXX XXX XXX', operators: ['Movistar GQ', 'HiTs GQ'] },
  'Guinée-Bissau':    { code: '245', flag: '🇬🇼', minLen: 7,  maxLen: 9,  format: 'XXX XXXX',    operators: ['Orange GW', 'MTN GW'] },
  'Mauritanie':       { code: '222', flag: '🇲🇷', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Mauritel', 'Mattel', 'Chinguitel'] },
  'Cap-Vert':         { code: '238', flag: '🇨🇻', minLen: 7,  maxLen: 7,  format: 'XXX XXXX',    operators: ['CV Móvel', 'T+ Telecom'] },
  'Comores':          { code: '269', flag: '🇰🇲', minLen: 7,  maxLen: 7,  format: 'XXX XXXX',    operators: ['Comores Telecom', 'Telma Comores'] },
  'Djibouti':         { code: '253', flag: '🇩🇯', minLen: 8,  maxLen: 8,  format: 'XX XX XX XX',  operators: ['Evatis', 'Djibouti Telecom'] },
  'Érythrée':         { code: '291', flag: '🇪🇷', minLen: 7,  maxLen: 7,  format: 'X XXX XXX',   operators: ['Eri-Tel'] },
  'Libéria':          { code: '231', flag: '🇱🇷', minLen: 8,  maxLen: 8,  format: 'XXX XXXXX',   operators: ['MTN LR', 'Lonestar Cell MTN'] },
  'Sierra Leone':     { code: '232', flag: '🇸🇱', minLen: 8,  maxLen: 8,  format: 'XX XXXXXX',   operators: ['Orange SL', 'Africell SL'] },
  'Gambie':           { code: '220', flag: '🇬🇲', minLen: 7,  maxLen: 7,  format: 'XXX XXXX',    operators: ['Africell GM', 'QCell GM'] },
  'Afrique du Sud':   { code: '27',  flag: '🇿🇦', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXXX', operators: ['Vodacom ZA', 'MTN ZA', 'Cell C', 'Telkom Mobile'] },
  'Soudan':           { code: '249', flag: '🇸🇩', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXXX', operators: ['Zain SD', 'MTN SD', 'Sudatel'] },
  'Somalie':          { code: '252', flag: '🇸🇴', minLen: 8,  maxLen: 8,  format: 'XXX XXXXX',   operators: ['Hormuud', 'Somalia Internet', 'Golis'] },
  'Namibie':          { code: '264', flag: '🇳🇦', minLen: 9,  maxLen: 9,  format: 'XXX XXX XXX',  operators: ['MTC Namibia', 'TN Mobile'] },
  'Botswana':         { code: '267', flag: '🇧🇼', minLen: 8,  maxLen: 8,  format: 'XX XXX XXX',   operators: ['Mascom', 'Orange BW', 'BTC Mobile'] },
  'Malawi':           { code: '265', flag: '🇲🇼', minLen: 9,  maxLen: 9,  format: 'X XXXX XXXX',  operators: ['TNM', 'Airtel MW'] },
  'Lesotho':          { code: '266', flag: '🇱🇸', minLen: 8,  maxLen: 8,  format: 'XX XX XXXX',   operators: ['Vodacom LS', 'Econet LS'] },
  'Swaziland':        { code: '268', flag: '🇸🇿', minLen: 8,  maxLen: 8,  format: 'XX XX XXXX',   operators: ['MTN SZ', 'Swazi MTN'] },
  'Libye':            { code: '218', flag: '🇱🇾', minLen: 9,  maxLen: 9,  format: 'XXX XXXXXX',   operators: ['Libyana', 'Madar'] },
  'Égypte':           { code: '20',  flag: '🇪🇬', minLen: 10, maxLen: 10, format: 'XXX XXX XXXX', operators: ['Vodafone EG', 'Orange EG', 'Etisalat EG'] },
};

// ===================================================
// GET COUNTRY INFO
// ===================================================
export function getCountryInfo(country) {
  return AFRICAN_COUNTRIES[country] || AFRICAN_COUNTRIES['Cameroun'];
}

export function getCountryCode(country) {
  return (AFRICAN_COUNTRIES[country] || AFRICAN_COUNTRIES['Cameroun']).code;
}

export function getCountryFlag(country) {
  return (AFRICAN_COUNTRIES[country] || AFRICAN_COUNTRIES['Cameroun']).flag;
}

// ===================================================
// PHONE VALIDATION
// ===================================================
/**
 * Validate and clean a phone number for a given country.
 * Returns { valid: bool, error: string|null, digits: string, formatted: string, e164: string }
 */
export function validatePhone(rawPhone, country) {
  const info = getCountryInfo(country);
  // Strip everything except digits
  let digits = (rawPhone || '').replace(/\D/g, '');

  // If user typed the international prefix, strip it
  if (digits.startsWith(info.code)) {
    digits = digits.slice(info.code.length);
  }
  // Also handle leading 00
  if (digits.startsWith('00' + info.code)) {
    digits = digits.slice(2 + info.code.length);
  }

  if (!digits) {
    return { valid: false, error: 'Numéro requis', digits: '', formatted: '', e164: '' };
  }
  if (digits.length < info.minLen) {
    return {
      valid: false,
      error: `Numéro trop court (${digits.length}/${info.minLen} chiffres min. pour ${country})`,
      digits, formatted: '', e164: ''
    };
  }
  if (digits.length > info.maxLen) {
    return {
      valid: false,
      error: `Numéro trop long (${digits.length}/${info.maxLen} chiffres max. pour ${country})`,
      digits, formatted: '', e164: ''
    };
  }

  const e164 = `+${info.code}${digits}`;
  const formatted = formatPhoneDisplay(digits, country);
  return { valid: true, error: null, digits, formatted, e164 };
}

// ===================================================
// PHONE FORMATTING
// ===================================================
/**
 * Format digits into a readable display string based on country format template
 * e.g. "651810270" + "Cameroun" → "6 51 81 02 70"
 */
export function formatPhoneDisplay(rawPhone, country) {
  const info = getCountryInfo(country);
  let digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.startsWith(info.code)) digits = digits.slice(info.code.length);

  // Apply format template: 'X XX XX XX' — each X = one digit
  const template = info.format || 'XXX XXX XXX';
  let result = '';
  let dIdx = 0;
  for (let i = 0; i < template.length && dIdx < digits.length; i++) {
    if (template[i] === 'X') {
      result += digits[dIdx++];
    } else {
      if (dIdx > 0) result += template[i];
    }
  }
  // Append remaining digits if template is exhausted
  if (dIdx < digits.length) result += digits.slice(dIdx);
  return `+${info.code} ${result}`.trim();
}

/**
 * Normalize phone: strip leading country code if already present, return bare digits
 */
export function normalizePhone(rawPhone, country) {
  const info = getCountryInfo(country);
  let digits = (rawPhone || '').replace(/\D/g, '');
  if (digits.startsWith(info.code)) digits = digits.slice(info.code.length);
  if (digits.startsWith('00' + info.code)) digits = digits.slice(2 + info.code.length);
  return digits;
}

// ===================================================
// LINK BUILDERS
// ===================================================
/**
 * Build WhatsApp URL with correct country code.
 * Handles numbers already containing the country code.
 */
export function waLink(phone, country) {
  const code = getCountryCode(country);
  const digits = normalizePhone(phone, country);
  if (!digits) return '#';
  return `https://wa.me/${code}${digits}`;
}

/**
 * Build tel: link with correct country code
 */
export function telLink(phone, country) {
  const code = getCountryCode(country);
  const digits = normalizePhone(phone, country);
  if (!digits) return 'tel:';
  return `tel:+${code}${digits}`;
}

// ===================================================
// COUNTRY SORTED LIST (for dropdowns)
// ===================================================
/**
 * Returns array of { name, code, flag, ... } sorted: common African countries first
 */
export const PRIORITY_COUNTRIES = [
  'Cameroun', 'Sénégal', "Côte d'Ivoire", 'RD Congo', 'Gabon',
  'Congo', 'Mali', 'Burkina Faso', 'Guinée', 'Bénin', 'Togo',
  'Niger', 'Tchad', 'Madagascar', 'Maroc', 'Algérie', 'Tunisie',
  'Ghana', 'Nigeria', 'Kenya', 'Rwanda', 'Tanzanie', 'Angola', 'Mozambique', 'Éthiopie',
];

export const ALL_COUNTRY_NAMES = [
  ...PRIORITY_COUNTRIES,
  ...Object.keys(AFRICAN_COUNTRIES).filter(c => !PRIORITY_COUNTRIES.includes(c)).sort()
];

// ===================================================
// HTML HELPERS
// ===================================================
/**
 * Renders the <option> elements for a country <select>
 * @param {string} selected - currently selected country name
 * @param {boolean} includeBlank - prepend a blank option
 */
export function renderCountryOptions(selected = 'Cameroun', includeBlank = false) {
  let html = includeBlank ? '<option value="">Sélectionner un pays</option>' : '';
  for (const name of ALL_COUNTRY_NAMES) {
    const { flag, code } = AFRICAN_COUNTRIES[name];
    const sel = name === selected ? 'selected' : '';
    html += `<option value="${name}" ${sel}>${flag} ${name} (+${code})</option>`;
  }
  return html;
}

// ===================================================
// ESCAPE HTML (XSS prevention)
// ===================================================
export function escapeHtml(str) {
  if (!str) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
