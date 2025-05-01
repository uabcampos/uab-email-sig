// script.js

// Helper to get element
function el(id) {
  return document.getElementById(id);
}

// Persist & restore
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

// Phone formatting
function formatPhoneNumber(num) {
  const d = (num||'').replace(/\D/g, '');
  if (d.length === 7) return `205.${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return num;
}

// Build RTF
async function generateRTFContent() {
  const html  = el('signature-preview').innerHTML;
  const lines = html.split('<br>').map(l => l.trim()).filter(Boolean);
  const p1    = '\\line ';
  const body  = lines.slice(0,-1).map(line =>
    line
      .replace(/<strong.*?>(.*?)<\/strong>/, '{\\b\\cf1 $1}')
      .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/,
               '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
      .replace(/<\/?[^>]+>/g, '')
  ).join('\\line ');
  const p2 = body + '\\line ';
  const urlLine = lines[lines.length-1]
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

// Transient message
function showMsg(id) {
  const m = el(id);
  m.style.display = 'inline';
  setTimeout(() => m.style.display='none', 2000);
}

// Copy rich signature
async function copyToClipboard() {
  const html = el('signature-preview').innerHTML;
  const tmp  = document.createElement('div');
  tmp.style.color = '#1E6B52'; tmp.innerHTML = html;
  document.body.appendChild(tmp);

  if (navigator.clipboard && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html':  new Blob([tmp.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([tmp.textContent], { type: 'text/plain' })
        })
      ]);
      showMsg('copy-success'); document.body.removeChild(tmp); return;
    } catch {}
  }

  const range = document.createRange(); range.selectNodeContents(tmp);
  const sel   = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
  try { document.execCommand('copy'); showMsg('copy-success'); }
  catch { alert('Copy failed—please copy manually.'); }
  sel.removeAllRanges(); document.body.removeChild(tmp);
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
    a.href     = url; a.download = 'signature.rtf';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch { alert('Download failed.'); }
}

// Reset form
function resetToDefaults() {
  clearAllPersistence();
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => el(id).value = '');
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id).checked = false);
  el('btn-standard').classList.add('active');
  el('btn-abbreviated').classList.remove('active');
  updateSignaturePreview();
}

// Live preview
function updateSignaturePreview() {
  // persist
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
  if (el('phone-office-enable').checked) phones.push(`O: ${formatPhoneNumber(el('phone-office').value)}`);
  if (el('phone-mobile-enable').checked) phones.push(`M: ${formatPhoneNumber(el('phone-mobile').value)}`);
  const phoneLine = phones.join(', ');

  const isStd = el('btn-standard').classList.contains('active');
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
}

// Toggle version
function toggleVersion(isStandard) {
  el('btn-standard').classList.toggle('active', isStandard);
  el('btn-abbreviated').classList.toggle('active', !isStandard);
  updateSignaturePreview();
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    copyToClipboard();
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
    e.preventDefault();
    downloadRTF();
  }
  if (e.key === 'Escape') {
    e.preventDefault();
    resetToDefaults();
  }
});

// On load, bind everything
document.addEventListener('DOMContentLoaded', () => {
  // Restore
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(restore);

  // Inputs
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => {
      const f = el(id);
      if (!f) return;
      f.addEventListener('input', updateSignaturePreview);
    });

  // Checkboxes
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id)?.addEventListener('change', updateSignaturePreview));

  // Version
  el('btn-standard')?.addEventListener('click', () => toggleVersion(true));
  el('btn-abbreviated')?.addEventListener('click', () => toggleVersion(false));

  // Buttons
  el('copy-button')?.addEventListener('click', copyToClipboard);
  el('copy-html-button')?.addEventListener('click', copyHTML);
  el('download-button')?.addEventListener('click', downloadRTF);
  el('reset-button')?.addEventListener('click', resetToDefaults);

  // Initial
  toggleVersion(true);
  updateSignaturePreview();
});
