// script.js

// Helper to get element by ID
function el(id) {
  return document.getElementById(id);
}

// Persist a field’s value to localStorage
function persistField(id, value) {
  localStorage.setItem(`siggen:${id}`, value);
}

// Restore a field’s value from localStorage, if present
function restoreField(id) {
  const v = localStorage.getItem(`siggen:${id}`);
  if (v !== null) el(id).value = v;
}

// Format phone numbers to ###.###.####
function formatPhoneNumber(number) {
  const digits = (number||'').replace(/\D/g, '');
  if (digits.length === 7) {
    return `205.${digits.slice(0,3)}.${digits.slice(3)}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0,3)}.${digits.slice(3,6)}.${digits.slice(6)}`;
  }
  return number;
}

// Build RTF content from preview HTML
async function generateRTFContent() {
  const html   = el('signature-preview').innerHTML;
  const lines  = html.split('<br>').map(l=>l.trim()).filter(Boolean);
  const part1  = '\\line ';
  const body   = lines.slice(0,-1).map(l=>
    l.replace(/<strong.*?>(.*?)<\/strong>/,'{\\b\\cf1 $1}')
     .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/,
              '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
     .replace(/<\/?[^>]+>/g,'')
  ).join('\\line ');
  const part2 = body + '\\line ';
  const urlLn = lines[lines.length-1]
    .replace(/<a href="(.*?)".*?>(.*?)<\/a>/,
             '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $2}}')
    .replace(/<\/?[^>]+>/g,'');
  const part3 = '\\line ' + urlLn;

  return [
    '{\\rtf1\\ansi\\deff0',
    '{\\colortbl ;\\red26\\green86\\blue50;}',
    '{\\fonttbl{\\f0 Arial;}}',
    '\\fs24',
    part1, part2, part3,
    '}'
  ].join('\n');
}

// Copy to clipboard
async function copyToClipboard() {
  const html = el('signature-preview').innerHTML;
  const container = document.createElement('div');
  container.style.color = '#1E6B52';
  container.innerHTML = html;
  document.body.appendChild(container);

  if (navigator.clipboard && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html':  new Blob([container.innerHTML], { type: 'text/html' }),
          'text/plain': new Blob([container.textContent], { type: 'text/plain' })
        })
      ]);
      showCopySuccess();
      document.body.removeChild(container);
      return;
    } catch {
      // fallback
    }
  }

  const range = document.createRange();
  range.selectNodeContents(container);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  try {
    document.execCommand('copy');
    showCopySuccess();
  } catch {
    alert('Copy failed—please copy manually.');
  }
  sel.removeAllRanges();
  document.body.removeChild(container);
}

function showCopySuccess() {
  const msg = el('copy-success');
  msg.style.display = 'inline';
  setTimeout(()=> msg.style.display='none', 2000);
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
    alert('Failed to download RTF.');
  }
}

// Validate a single field, show/hide error, highlight invalid
function validateField(field) {
  const valid = field.checkValidity();
  if (!valid) {
    field.classList.add('invalid');
  } else {
    field.classList.remove('invalid');
  }
  return valid;
}

// Validate all required/enabled fields; return overall result
function validateAllRequiredFields() {
  let allValid = true;
  // required inputs
  document.querySelectorAll('[required]').forEach(f => {
    if (!validateField(f)) allValid = false;
  });
  // phone if enabled
  [['phone-office','phone-office-enable'], ['phone-mobile','phone-mobile-enable']].forEach(([fld,cb])=>{
    const field = el(fld), box = el(cb);
    if (box.checked) {
      if (!validateField(field)) allValid = false;
    } else {
      field.classList.remove('invalid');
    }
  });
  return allValid;
}

// Live‐update the HTML preview
function updateSignaturePreview() {
  // Persist all fields
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => persistField(id, el(id).value.trim()));

  const name      = el('name').value.trim()        || 'John Doe';
  const creds     = el('credentials').value.trim() ? `, ${el('credentials').value}` : '';
  const title     = el('title').value.trim()       || 'Program Director II';
  const room      = el('room').value.trim()        || 'MT634';
  const street    = el('street').value.trim()      || '1717 11th Avenue South';
  const cityState = el('city-state').value.trim()  || 'Birmingham, AL';
  const zip       = el('zip').value.trim()         || '35294-4410';
  const email     = el('email').value.trim()       || 'johndoe@uabmc.edu';
  const pronouns  = el('pronouns').value.trim()    ? `<br>Pronouns: ${el('pronouns').value}` : '';

  const phones = [];
  if (el('phone-office-enable').checked) phones.push(`O: ${formatPhoneNumber(el('phone-office').value)}`);
  if (el('phone-mobile-enable').checked) phones.push(`M: ${formatPhoneNumber(el('phone-mobile').value)}`);
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

  // Gate buttons
  const ok = validateAllRequiredFields();
  el('copy-button').disabled     = !ok;
  el('download-button').disabled = !ok;
}

function toggleVersion(isStandard) {
  el('btn-standard').classList.toggle('active', isStandard);
  el('btn-abbreviated').classList.toggle('active', !isStandard);
  updateSignaturePreview();
}

document.addEventListener('DOMContentLoaded', ()=>{
  // Restore saved values
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(restoreField);

  // Bind inputs
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => {
      const f = el(id);
      if (!f) return;
      f.addEventListener('input', updateSignaturePreview);
      f.addEventListener('blur', () => validateField(f));
    });
  // Bind checkboxes
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id)?.addEventListener('change', updateSignaturePreview));

  // Version toggles
  el('btn-standard')?.addEventListener('click', ()=>toggleVersion(true));
  el('btn-abbreviated')?.addEventListener('click', ()=>toggleVersion(false));

  // Buttons
  el('copy-button')?.addEventListener('click', copyToClipboard);
  el('download-button')?.addEventListener('click', downloadRTF);

  // Initial
  toggleVersion(true);
  updateSignaturePreview();
});
