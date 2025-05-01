// script.js

// Debounce helper
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// DOM helper
function el(id) { return document.getElementById(id); }

// Persist & restore fields
function persist(id, val) {
  localStorage.setItem(`siggen:${id}`, val);
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

// Format phone number
function formatPhoneNumber(num) {
  const d = (num||'').replace(/\D/g, '');
  if (d.length === 7) return `205.${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return num;
}

// Generate RTF content
async function generateRTFContent() {
  const html  = el('signature-preview').innerHTML;
  const lines = html.split('<br>').map(l=>l.trim()).filter(Boolean);
  const p1    = '\\line ';
  const body  = lines.slice(0,-1).map(line =>
    line
      .replace(/<strong.*?>(.*?)<\/strong>/, '{\\b\\cf1 $1}')
      .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/,
               '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
      .replace(/<\/?[^>]+>/g,'')
  ).join('\\line ');
  const p2    = body + '\\line ';
  const urlLine = lines[lines.length-1]
    .replace(/<a href="(.*?)".*?>(.*?)<\/a>/,
             '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $2}}')
    .replace(/<\/?[^>]+>/g,'');
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

// Transient status message
function showMsg(id) {
  const msg = el(id);
  msg.style.display = 'inline';
  setTimeout(() => msg.style.display = 'none', 2000);
}

// Copy rich HTML+text to clipboard
async function copyToClipboard() {
  const html = el('signature-preview').innerHTML;
  const tmp  = document.createElement('div');
  tmp.style.color = '#1E6B52';
  tmp.innerHTML   = html;
  document.body.appendChild(tmp);

  if (navigator.clipboard && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html':  new Blob([tmp.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([tmp.textContent],  { type: 'text/plain' })
        })
      ]);
      showMsg('copy-success');
      document.body.removeChild(tmp);
      return;
    } catch {}
  }

  const range = document.createRange();
  range.selectNodeContents(tmp);
  const sel   = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  try {
    document.execCommand('copy');
    showMsg('copy-success');
  } catch {
    alert('Copy failed—please copy manually.');
  }
  sel.removeAllRanges();
  document.body.removeChild(tmp);
}

// Copy raw HTML
function copyHTML() {
  navigator.clipboard.writeText(el('signature-preview').innerHTML)
    .then(() => showMsg('copy-html-success'))
    .catch(() => alert('Copy HTML failed.'));
}

// Download RTF
async function downloadRTF() {
  try {
    const blob = new Blob([await generateRTFContent()], { type: 'application/rtf' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'signature.rtf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    alert('Download failed.');
  }
}

// Lazy‐load html2canvas & export PNG
let html2canvasPromise = null;
function loadHtml2canvas() {
  if (!html2canvasPromise) {
    html2canvasPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      s.onload = () => resolve(window.html2canvas || window.html2canvas);
      s.onerror = reject;
      document.body.appendChild(s);
    });
  }
  return html2canvasPromise;
}
async function downloadPNG() {
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
    alert('PNG export failed.');
  }
}

// Reset form to defaults
function resetToDefaults() {
  clearAllPersistence();
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => (el(id).value = ''));
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => (el(id).checked = false));
  el('btn-standard').classList.add('active');
  el('btn-abbreviated').classList.remove('active');
  updateSignaturePreview();
}

// Build live preview (desktop + mobile)
function updateSignaturePreview() {
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => persist(id, el(id).value.trim()));

  const name      = el('name').value.trim()        || 'John Doe';
  const creds     = el('credentials').value.trim() ? `, ${el('credentials').value.trim()}` : '';
  const title     = el('title').value.trim()       || 'Program Director II';
  const room      = el('room').value.trim()        || 'MT634';
  const street    = el('street').value.trim()      || '1717 11th Avenue South';
  const cityState = el('city-state').value.trim()  || 'Birmingham, AL';
  const zip       = el('zip').value.trim()         || '35294-4410';
  const email     = el('email').value.trim()       || 'johndoe@uabmc.edu';
  const pronouns  = el('pronouns').value.trim()    ? `<br>Pronouns: ${el('pronouns').value.trim()}` : '';

  const phones = [];
  if (el('phone-office-enable').checked)
    phones.push(`O: ${formatPhoneNumber(el('phone-office').value)}`);
  if (el('phone-mobile-enable').checked)
    phones.push(`M: ${formatPhoneNumber(el('phone-mobile').value)}`);
  const phoneLine = phones.join(', ');

  const isStd  = el('btn-standard').classList.contains('active');
  const urlStr = 'uab.edu/medicine/gimaps';

  let html = `<strong style="color:#1E6B52;">${name}${creds} | ${title}</strong><br>`;
  if (isStd) {
    html +=
      `Department of Medicine | Heersink School of Medicine<br>` +
      `Division of General Internal Medicine & Population Science<br>` +
      `UAB | The University of Alabama at Birmingham<br>` +
      `${room} | ${street} | ${cityState} ${zip}<br>`;
  } else {
    html += `UAB | The University of Alabama at Birmingham<br>`;
  }
  if (phoneLine) html += `${phoneLine} | `;
  html += `<a href="mailto:${email}">${email}</a>${pronouns}<br><br>` +
          `<a href="https://${urlStr}" target="_blank">${urlStr}</a>`;

  el('signature-preview').innerHTML = html;
  el('mobile-preview').innerHTML    = html;
}

// Contrast helpers for accessibility check
function luminance(r,g,b) {
  const a = [r,g,b].map(v=>{
    v /= 255;
    return v <= 0.03928 ? v/12.92 : ((v+0.055)/1.055)**2.4;
  });
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2];
}
function contrast(hex1,hex2) {
  const c1 = hex1.match(/\w\w/g).map(h=>parseInt(h,16));
  const c2 = hex2.match(/\w\w/g).map(h=>parseInt(h,16));
  const L1 = luminance(...c1), L2 = luminance(...c2);
  return (Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
}

// Accessibility check
function runAccessibilityCheck() {
  const reportEl = el('accessibility-report');
  reportEl.textContent = '';
  const nodes = el('signature-preview').querySelectorAll('*');
  const issues = [];
  nodes.forEach(node => {
    const cs = getComputedStyle(node);
    const fg = cs.color.match(/\d+/g).slice(0,3).map(n=>+n);
    const bg = cs.backgroundColor.match(/\d+/g)?.slice(0,3).map(n=>+n) || [255,255,255];
    const fgHex = '#'+fg.map(c=>c.toString(16).padStart(2,'0')).join('');
    const bgHex = '#'+bg.map(c=>c.toString(16).padStart(2,'0')).join('');
    if (contrast(fgHex,bgHex) < 4.5) {
      issues.push(`Low contrast on “${node.textContent.trim()}”`);
    }
  });
  reportEl.textContent = issues.length
    ? 'Accessibility issues: ' + issues.join('; ')
    : 'All text passes 4.5:1 contrast ratio.';
}

// Toggle version
function toggleVersion(isStandard) {
  el('btn-standard').classList.toggle('active', isStandard);
  el('btn-abbreviated').classList.toggle('active', !isStandard);
  updateSignaturePreview();
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key === 's') {
    e.preventDefault(); copyToClipboard();
  }
  if ((e.ctrlKey||e.metaKey) && e.key === 'd') {
    e.preventDefault(); downloadRTF();
  }
  if (e.key === 'Escape') {
    e.preventDefault(); resetToDefaults();
  }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(restore);

  const debouncedUpdate = debounce(updateSignaturePreview, 300);

  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => {
      const f = el(id);
      if (!f) return;
      f.addEventListener('input', debouncedUpdate);
      f.addEventListener('blur', () => validateField(f));
    });

  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id)?.addEventListener('change', updateSignaturePreview));

  el('btn-standard')?.addEventListener('click', () => toggleVersion(true));
  el('btn-abbreviated')?.addEventListener('click', () => toggleVersion(false));

  el('copy-button')?.addEventListener('click', copyToClipboard);
  el('copy-html-button')?.addEventListener('click', copyHTML);
  el('download-button')?.addEventListener('click', downloadRTF);
  el('download-png-button')?.addEventListener('click', downloadPNG);
  el('accessibility-check-button')?.addEventListener('click', runAccessibilityCheck);
  el('reset-button')?.addEventListener('click', resetToDefaults);

  toggleVersion(true);
  updateSignaturePreview();
});
