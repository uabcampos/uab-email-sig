// script.js

console.log('▶ script.js loaded');

function el(id) {
  const node = document.getElementById(id);
  if (!node) console.warn(`⚠️ Element #${id} not found`);
  return node;
}

function formatPhoneNumber(number) {
  const digits = (number || '').replace(/\D/g, '');
  if (digits.length === 7) {
    return `205.${digits.slice(0,3)}.${digits.slice(3)}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
  }
  return number;
}

async function generateRTFContent() {
  const html   = el('signature-preview').innerHTML;
  const parts  = html.split('<br>').map(p => p.trim()).filter(Boolean);
  const part1  = '\\line ';
  const body   = parts.slice(0,-1).map(line =>
    line
      .replace(/<strong.*?>(.*?)<\/strong>/, '{\\b\\cf1 $1}')
      .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/, '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
      .replace(/<\/?[^>]+>/g, '')
  ).join('\\line ');
  const part2  = body + '\\line ';
  const urlLine = parts[parts.length-1]
    .replace(/<a href="(.*?)".*?>(.*?)<\/a>/, '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $2}}')
    .replace(/<\/?[^>]+>/g, '');
  const part3 = '\\line ' + urlLine;

  return [
    '{\\rtf1\\ansi\\deff0',
    '{\\colortbl ;\\red26\\green86\\blue50;}',
    '{\\fonttbl{\\f0 Arial;}}',
    '\\fs24',
    part1, part2, part3,
    '}'
  ].join('\n');
}

async function copyToClipboard() {
  console.log('🔍 copyToClipboard invoked');
  const html = el('signature-preview').innerHTML;
  const container = document.createElement('div');
  container.style.color = '#1E6B52';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Try Clipboard API
  if (navigator.clipboard && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([container.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([container.textContent], { type: 'text/plain' })
        })
      ]);
      el('copy-success').style.display = 'inline';
      setTimeout(() => el('copy-success').style.display = 'none', 2000);
      document.body.removeChild(container);
      return;
    } catch (e) {
      console.warn('Clipboard API failed, falling back to execCommand', e);
    }
  }

  // Fallback execCommand
  const range = document.createRange();
  range.selectNodeContents(container);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  try {
    document.execCommand('copy');
    el('copy-success').style.display = 'inline';
    setTimeout(() => el('copy-success').style.display = 'none', 2000);
  } catch (err) {
    alert('Copy failed—please copy manually.');
    console.error('execCommand copy failed', err);
  }

  sel.removeAllRanges();
  document.body.removeChild(container);
}

async function downloadRTF() {
  console.log('🔍 downloadRTF invoked');
  try {
    const rtf  = await generateRTFContent();
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'signature.rtf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('Failed to download RTF.');
    console.error('RTF download error', err);
  }
}

async function updateSignaturePreview() {
  console.log('✏️ updateSignaturePreview');
  const valid = validateAllRequiredFields();
  el('copy-button').disabled     = !valid;
  el('download-button').disabled = !valid;

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

  const isStandard = el('btn-standard').classList.contains('active');
  const baseUrl    = 'uab.edu/medicine/gimaps';

  let html = `<strong style="color:#1E6B52;">${name}${creds} | ${title}</strong><br>`;
  if (isStandard) {
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
          `<a href="https://${baseUrl}" target="_blank">${baseUrl}</a>`;

  el('signature-preview').innerHTML = html;
}

function toggleVersion(isStandard) {
  console.log(`🔀 toggleVersion(${isStandard})`);
  el('btn-standard').classList.toggle('active', isStandard);
  el('btn-abbreviated').classList.toggle('active', !isStandard);
  updateSignaturePreview();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOMContentLoaded');

  // Live preview & validation
  [
    'name','credentials','title','room','street','city-state',
    'zip','email','pronouns','phone-office','phone-mobile'
  ].forEach(id => {
    const inp = el(id);
    if (inp) {
      console.log(`📌 binding input #${id}`);
      inp.addEventListener('input',  updateSignaturePreview);
      inp.addEventListener('blur',   () => { console.log(`🛑 blur #${id}`); validateField(inp); });
    }
  });

  // Checkboxes
  ['phone-office-enable','phone-mobile-enable'].forEach(id => {
    const cb = el(id);
    if (cb) {
      console.log(`📌 binding change #${id}`);
      cb.addEventListener('change', updateSignaturePreview);
    }
  });

  // Version buttons
  const bs = el('btn-standard'),
        ba = el('btn-abbreviated');
  if (bs) { console.log('📌 binding #btn-standard'); bs.addEventListener('click', () => toggleVersion(true)); }
  if (ba) { console.log('📌 binding #btn-abbreviated'); ba.addEventListener('click', () => toggleVersion(false)); }

  // Copy & download
  const cb = el('copy-button'),
        db = el('download-button');
  if (cb) { console.log('📌 binding #copy-button'); cb.addEventListener('click', copyToClipboard); }
  if (db) { console.log('📌 binding #download-button'); db.addEventListener('click', downloadRTF); }

  // Initial render
  updateSignaturePreview();
});
