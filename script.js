// script.js

// Debounce helper
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// DOM helper
function el(id) {
  return document.getElementById(id);
}

// ------------ Persistence & Draft ------------

const lastSavedEl   = el('last-saved');
const saveDraftBtn  = el('save-draft');
const clearDraftBtn = el('clear-draft');

function persist(id, val) {
  localStorage.setItem(`siggen:${id}`, val);
  lastSavedEl.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
}
function restore(id) {
  const v = localStorage.getItem(`siggen:${id}`);
  if (v !== null) el(id).value = v;
}
function clearAllPersistence() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('siggen:'))
    .forEach(k => localStorage.removeItem(k));
}

// ------------ URL Deep-Linking for QR ------------

function buildDeepLink() {
  const params = new URLSearchParams();
  [
    'name','credentials','title',
    'department','school','division',
    'room','street','city-state','zip',
    'email','pronouns'
  ].forEach(id => {
    const fld = el(id);
    if (fld && fld.value) params.set(id, fld.value);
  });
  params.set('phoneOffice', el('phone-office-enable').checked);
  params.set('phoneMobile', el('phone-mobile-enable').checked);
  params.set('version',
    el('btn-standard').classList.contains('active') ? 'standard' : 'abbr'
  );
  return `${location.origin}${location.pathname}?${params.toString()}`;
}

function restoreFromQuery() {
  const params = new URLSearchParams(location.search);
  [
    'name','credentials','title',
    'department','school','division',
    'room','street','city-state','zip',
    'email','pronouns'
  ].forEach(id => {
    if (params.has(id)) el(id).value = params.get(id);
  });
  el('phone-office-enable').checked = params.get('phoneOffice') === 'true';
  el('phone-mobile-enable').checked = params.get('phoneMobile') === 'true';
  if (params.get('version') === 'abbr') {
    el('btn-standard').classList.remove('active');
    el('btn-abbreviated').classList.add('active');
  }
}

// ------------ Formatting & Generation ------------

function formatPhoneNumber(num) {
  const d = (num || '').replace(/\D/g, '');
  if (d.length === 7) return `205.${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return num;
}

function decodedHTML() {
  return el('signature-preview').innerHTML.replace(/&amp;/g, '&');
}

async function generateRTFContent() {
  const raw = decodedHTML();
  const lines = raw.split('<br>').map(l => l.trim()).filter(Boolean);

  const p1 = '\\line ';
  const body = lines.slice(0,-1).map(line =>
    line
      .replace(/<strong.*?>(.*?)<\/strong>/, '{\\b\\cf1 $1}')
      .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/,
               '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
      .replace(/<\/?[^>]+>/g, '')
  ).join('\\line ');
  const p2 = body + '\\line ';
  const urlLine = lines.slice(-1)[0]
    .replace(/<a href="(.*?)".*?>(.*?)<\/a>/,
             '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $2}}')
    .replace(/<\/?[^>]+>/g, '');
  const p3 = '\\line ' + urlLine;

  return [
    '{\\rtf1\\ansi\\deff0',
    '{\\colortbl ;\\red26\\green86\\blue50;}',
    '{\\fonttbl{\\f0 Arial;}}',
    '\\fs24',
    p1, p2, p3,
    '}'
  ].join('\n');
}

function generateHTMLSignature() {
  return `<!DOCTYPE html>
<html><body style="font-family:Arial, sans-serif; font-size:12px;">
${decodedHTML()}
</body></html>`;
}

// ------------ Feedback, Copy & Download ------------

function giveFeedback(btn) {
  btn.classList.add('loading');
  setTimeout(() => btn.classList.remove('loading'), 1500);
}

async function copyToClipboard() {
  const btn = el('copy-button');
  const tmp = document.createElement('div');
  tmp.innerHTML = decodedHTML();
  document.body.appendChild(tmp);

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html':  new Blob([tmp.innerHTML], { type: 'text/html' }),
        'text/plain': new Blob([tmp.textContent], { type: 'text/plain' })
      })
    ]);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(tmp);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
  }

  document.body.removeChild(tmp);
  giveFeedback(btn);
}

function copyHTML() {
  const btn = el('copy-html-button');
  navigator.clipboard.writeText(decodedHTML())
    .catch(() => alert('Copy HTML failed.'));
  giveFeedback(btn);
}

async function downloadRTF() {
  const btn = el('download-button');
  giveFeedback(btn);
  try {
    const rtf = await generateRTFContent();
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'signature.rtf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch {
    alert('RTF download failed.');
  }
}

async function downloadOFTTemplate() {
  const btn = el('download-oft-button');
  giveFeedback(btn);
  try {
    const rtf = await generateRTFContent();
    const blob = new Blob([rtf], { type: 'application/vnd.ms-outlook' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'signature.oft';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch {
    alert('OFT download failed.');
  }
}

function downloadHTMLTemplate() {
  const btn = el('download-html-button');
  giveFeedback(btn);
  const blob = new Blob([generateHTMLSignature()], { type: 'text/html' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = 'signature.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

let html2canvasPromise = null;
function loadHtml2canvas() {
  if (!html2canvasPromise) {
    html2canvasPromise = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = () => res(window.html2canvas);
      s.onerror = rej;
      document.body.appendChild(s);
    });
  }
  return html2canvasPromise;
}

async function downloadPNG() {
  const btn = el('download-png-button');
  giveFeedback(btn);
  try {
    const html2canvas = await loadHtml2canvas();
    const canvas = await html2canvas(el('signature-preview'), { backgroundColor: null });
    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href     = URL.createObjectURL(blob);
      a.download = 'signature.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    });
  } catch {
    alert('PNG download failed.');
  }
}

// ------------ QR Code Modal ------------

function showQRCode() {
  const qrModal = el('qr-modal');
  const img     = qrModal.querySelector('img');
  const link    = buildDeepLink();
  // use QuickChart to generate the QR
  img.src = `https://quickchart.io/qr?size=200&text=${encodeURIComponent(link)}`;
  qrModal.classList.add('active');
}

function hideQRCode() {
  el('qr-modal').classList.remove('active');
}

// ------------ Reset & Preview ------------

function resetToDefaults() {
  clearAllPersistence();
  [
    'name','credentials','title',
    'department','school','division',
    'room','street','city-state','zip',
    'email','pronouns'
  ].forEach(id => {
    const fld = el(id);
    if (fld) fld.value = '';
  });
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id).checked = false);
  el('btn-standard').classList.add('active');
  el('btn-abbreviated').classList.remove('active');
  updateSignaturePreview();
}

function updateSignaturePreview() {
  [
    'name','credentials','title',
    'department','school','division',
    'room','street','city-state','zip',
    'email','pronouns'
  ].forEach(id => persist(id, (el(id)?.value || '').trim()));

  const name      = el('name').value.trim() || 'John Doe';
  const creds     = el('credentials').value.trim() ? `, ${el('credentials').value.trim()}` : '';
  const title     = el('title').value.trim() || 'Program Director II';
  const dept      = el('department').value.trim() || 'Department of Medicine';
  const school    = el('school').value.trim() || 'Heersink School of Medicine';
  const division  = el('division').value.trim() || 'Division of General Internal Medicine & Population Science';
  const room      = el('room').value.trim() || 'MT634';
  const street    = el('street').value.trim() || '1717 11th Avenue South';
  const cityState = el('city-state').value.trim() || 'Birmingham, AL';
  const zip       = el('zip').value.trim() || '35294-4410';
  const email     = el('email').value.trim() || 'you@uabmc.edu';
  const pronouns  = el('pronouns').value.trim() ? `<br>Pronouns: ${el('pronouns').value.trim()}` : '';

  const phones = [];
  if (el('phone-office-enable').checked)
    phones.push(`O: ${formatPhoneNumber(el('phone-office').value)}`);
  if (el('phone-mobile-enable').checked)
    phones.push(`M: ${formatPhoneNumber(el('phone-mobile').value)}`);
  const phoneLine = phones.join(', ');

  const isStd = el('btn-standard').classList.contains('active');
  const url   = 'uab.edu/medicine/gimaps';

  let html = `<strong style="color:#1A5632;">${name}${creds} | ${title}</strong><br>`;
  if (isStd) {
    html += `${dept} | ${school}<br>${division}<br>`;
    html += `UAB | The University of Alabama at Birmingham<br>`;
    html += `${room} | ${street} | ${cityState} ${zip}<br>`;
  } else {
    html += `UAB | The University of Alabama at Birmingham<br>`;
  }
  if (phoneLine) html += `${phoneLine} | `;
  html += `<a href="mailto:${email}">${email}</a>${pronouns}<br><br>`;
  html += `<a href="https://${url}" target="_blank">${url}</a>`;

  el('signature-preview').innerHTML = html;
  el('mobile-preview').innerHTML    = html;
}

// ------------ Init on DOMContentLoaded ------------

document.addEventListener('DOMContentLoaded', () => {
  // Feather icons
  if (window.feather) {
    feather.replace({ 'stroke-width': 2, width: 20, height: 20 });
  }

  // Restore from URL query (for deep‐link mobile handoff)
  restoreFromQuery();

  // QR modal injection & events
  document.body.insertAdjacentHTML('beforeend', `
    <div id="qr-modal" class="qr-modal">
      <div class="qr-content"><img alt="QR code for signature"/></div>
    </div>
  `);
  const qrModal   = el('qr-modal');
  const qrContent = qrModal.querySelector('.qr-content');
  qrModal.addEventListener('click', hideQRCode);
  qrContent.addEventListener('click', e => e.stopPropagation());

  // Restore persisted fields
  [
    'name','credentials','title',
    'department','school','division',
    'room','street','city-state','zip',
    'email','pronouns'
  ].forEach(restore);

  // Initial render
  updateSignaturePreview();

  // Input listeners
  const deb = debounce(updateSignaturePreview);
  [
    'name','credentials','title','department','school','division',
    'room','street','city-state','zip','email','pronouns'
  ].forEach(id => {
    const f = el(id);
    if (f) f.addEventListener('input', () => {
      validateField(f);
      deb();
    });
  });

  // Phone toggles
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id)?.addEventListener('change', updateSignaturePreview));

  // Version toggles
  el('btn-standard').addEventListener('click', () => {
    el('btn-standard').classList.add('active');
    el('btn-abbreviated').classList.remove('active');
    updateSignaturePreview();
  });
  el('btn-abbreviated').addEventListener('click', () => {
    el('btn-abbreviated').classList.add('active');
    el('btn-standard').classList.remove('active');
    updateSignaturePreview();
  });

  // Draft controls
  saveDraftBtn.addEventListener('click', () => {
    [
      'name','credentials','title','department','school','division',
      'room','street','city-state','zip','email','pronouns'
    ].forEach(id => persist(id, el(id).value.trim()));
  });
  clearDraftBtn.addEventListener('click', () => {
    clearAllPersistence();
    resetToDefaults();
    lastSavedEl.textContent = 'Last saved: never';
  });

  // More options toggle
  el('more-options-toggle').addEventListener('click', () => {
    const panel = el('more-options');
    const btn   = el('more-options-toggle');
    const collapsed = panel.classList.toggle('collapsed');
    const ico = btn.querySelector('i[data-feather]');
    ico.dataset.feather = collapsed ? 'chevron-down' : 'chevron-up';
    feather.replace();
  });

  // Primary actions
  el('copy-button').addEventListener('click', copyToClipboard);
  el('download-button').addEventListener('click', downloadRTF);

  // More actions toggle
  const moreToggle = el('toggle-actions');
  const extraPanel = el('extra-actions');
  extraPanel.classList.add('collapsed');
  moreToggle.addEventListener('click', () => {
    const collapsed = extraPanel.classList.toggle('collapsed');
    const ico = moreToggle.querySelector('i[data-feather]');
    ico.dataset.feather = collapsed ? 'chevron-down' : 'chevron-up';
    feather.replace();
  });

  // Secondary actions
  el('copy-html-button').addEventListener('click', copyHTML);
  el('download-png-button').addEventListener('click', downloadPNG);
  el('download-html-button').addEventListener('click', downloadHTMLTemplate);
  el('download-oft-button').addEventListener('click', downloadOFTTemplate);
  el('show-qr-button').addEventListener('click', showQRCode);
  el('reset-button').addEventListener('click', resetToDefaults);
});
