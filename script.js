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

// ------------ Formatting & Generation ------------

function formatPhoneNumber(num) {
  const d = (num || '').replace(/\D/g, '');
  if (d.length === 7) return `205.${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return num;
}

async function generateRTFContent() {
  const html = el('signature-preview').innerHTML;
  const lines = html.split('<br>').map(l => l.trim()).filter(Boolean);

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
  const sig = el('signature-preview').innerHTML;
  return `<!DOCTYPE html>
<html><body style="font-family:Arial, sans-serif; font-size:12px;">
${sig}
</body></html>`;
}

// ------------ Feedback, Copy & Download ------------

function giveFeedback(btn) {
  btn.classList.add('feedback');
  setTimeout(() => btn.classList.remove('feedback'), 2000);
}

async function copyToClipboard() {
  const btn = el('copy-button');
  const tmp = document.createElement('div');
  tmp.style.color = '#1E6B52';
  tmp.innerHTML = el('signature-preview').innerHTML;
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
  navigator.clipboard.writeText(el('signature-preview').innerHTML)
    .catch(() => alert('Copy HTML failed.'));
  giveFeedback(btn);
}

async function downloadRTF() {
  const btn = el('download-button');
  btn.classList.add('loading');
  try {
    const rtf = await generateRTFContent();
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'signature.rtf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    alert('RTF download failed.');
  }
  btn.classList.remove('loading');
}

function downloadHTMLTemplate() {
  const btn = el('download-html-button');
  btn.classList.add('loading');
  const blob = new Blob([generateHTMLSignature()], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'signature.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  btn.classList.remove('loading');
}

async function downloadOFTTemplate() {
  const btn = el('download-oft-button');
  btn.classList.add('loading');
  try {
    const rtf = await generateRTFContent();
    const blob = new Blob([rtf], { type: 'application/vnd.ms-outlook' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'signature.oft';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch {
    alert('OFT download failed.');
  }
  btn.classList.remove('loading');
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
  btn.classList.add('loading');
  try {
    await loadHtml2canvas();
    const frame = el('signature-preview');
    const canvas = await html2canvas(frame, { backgroundColor: null });
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href    = url;
      a.download= 'signature.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  } catch {
    alert('PNG download failed.');
  }
  btn.classList.remove('loading');
}

function showQRCode() {
  const m = el('qr-modal');
  const img = m.querySelector('img');
  img.src = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(generateHTMLSignature())}`;
  m.classList.add('active');
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
  ].forEach(id => el(id).value = '');
  ['phone-office-enable','phone-mobile-enable'].forEach(id => el(id).checked = false);
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
  ].forEach(id => persist(id, el(id).value.trim()));

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
  const email     = el('email').value.trim() || 'johndoe@uabmc.edu';
  const pronouns  = el('pronouns').value.trim() ? `<br>Pronouns: ${el('pronouns').value.trim()}` : '';

  const phones = [];
  if (el('phone-office-enable').checked) phones.push(`O: ${formatPhoneNumber(el('phone-office').value)}`);
  if (el('phone-mobile-enable').checked) phones.push(`M: ${formatPhoneNumber(el('phone-mobile').value)}`);
  const phoneLine = phones.join(', ');

  const isStd = el('btn-standard').classList.contains('active');
  const url   = 'uab.edu/medicine/gimaps';

  let html = `<strong style="color:#1E6B52;">${name}${creds} | ${title}</strong><br>`;
  if (isStd) {
    html += `${dept} | ${school}<br>`;
    html += `${division}<br>`;
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

// ------------ Version Toggle & Init ------------

function toggleVersion(isStd) {
  el('btn-standard').classList.toggle('active', isStd);
  el('btn-abbreviated').classList.toggle('active', !isStd);
  updateSignaturePreview();
}

document.addEventListener('DOMContentLoaded', () => {
  // Restore fields
  [
    'name','credentials','title',
    'department','school','division',
    'room','street','city-state','zip',
    'email','pronouns'
  ].forEach(restore);

  // Initial preview
  updateSignaturePreview();

  // Bind inputs
  const debounced = debounce(updateSignaturePreview);
  [
    'name','credentials','title','department','school','division',
    'room','street','city-state','zip','email','pronouns'
  ].forEach(id => {
    const f = el(id);
    if (!f) return;
    f.addEventListener('input', () => {
      validateField(f);
      debounced();
    });
  });

  // Checkboxes
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id)?.addEventListener('change', updateSignaturePreview));

  // Version buttons
  el('btn-standard').addEventListener('click', () => toggleVersion(true));
  el('btn-abbreviated').addEventListener('click', () => toggleVersion(false));

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

  // More-options toggle
  el('more-options-toggle').addEventListener('click', () => {
    const mo = el('more-options');
    const collapsed = mo.classList.toggle('collapsed');
    el('more-options-toggle').textContent = collapsed ? 'More options ▼' : 'Less options ▲';
  });

  // Insert preview titles if not already present
  // (HTML now includes them)

  // Primary actions
  el('copy-button').addEventListener('click', copyToClipboard);
  el('download-button').addEventListener('click', downloadRTF);

  // More Actions panel
  const primaryRow = el('copy-button').parentNode;
  const toggle = document.getElementById('toggle-actions');
  const extra = document.getElementById('extra-actions');

  // Bind secondary actions
  el('copy-html-button').addEventListener('click', copyHTML);
  el('download-png-button').addEventListener('click', downloadPNG);
  el('download-html-button').addEventListener('click', downloadHTMLTemplate);
  el('download-oft-button').addEventListener('click', downloadOFTTemplate);
  el('show-qr-button').addEventListener('click', showQRCode);
  el('reset-button').addEventListener('click', resetToDefaults);

  // Toggle behavior for extra-actions
  toggle.addEventListener('click', () => {
    const expanded = extra.classList.toggle('expanded');
    toggle.querySelector('svg').innerHTML = expanded
      ? '<polyline points="4,10 8,6 12,10" stroke="currentColor" fill="none" stroke-width="2"/>'
      : '<polyline points="4,6 8,10 12,6" stroke="currentColor" fill="none" stroke-width="2"/>';
    toggle.childNodes[1].nodeValue = expanded ? ' Fewer actions' : ' More actions';
  });

  // QR modal
  document.body.insertAdjacentHTML('beforeend', `
    <div id="qr-modal" class="qr-modal" onclick="hideQRCode()">
      <div class="qr-content"><img alt="QR code for signature"/></div>
    </div>
  `);

  // Onboarding tour (unchanged)

  // Final init
  toggleVersion(true);
  updateSignaturePreview();
});
