// script.js

// Helper to get element by ID
function el(id) {
  return document.getElementById(id);
}

// Format phone numbers: 7 or 10 digits
function formatPhoneNumber(number) {
  const digits = (number || '').replace(/\D/g, '');
  if (digits.length === 7) {
    return `205.${digits.slice(0, 3)}.${digits.slice(3)}`;
  } else if (digits.length === 10) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return number;
}

// Fetch an image URL and return a data-URL
function getImageHex(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.send();
  });
}

// Generate RTF content for download
async function generateRTFContent() {
  const html = el('signature-preview').innerHTML;
  const lines = html.split('<br>').map(l => l.trim()).filter(Boolean);

  // Part 1: blank line
  const part1 = '\\line ';

  // Part 2: lines except last (URL)
  const sigLines = lines.slice(0, -1).map(line =>
    line
      .replace(/<strong.*?>(.*?)<\/strong>/, '{\\b\\cf1 $1}')
      .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/, '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
      .replace(/<\/?[^>]+>/g, '')
  ).join('\\line ');

  const part2 = sigLines + '\\line ';

  // Part 3: last line
  const urlLine = lines[lines.length - 1]
    .replace(/<a href="(.*?)".*?>(.*?)<\/a>/, '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $2}}')
    .replace(/<\/?[^>]+>/g, '');

  const part3 = '\\line ' + urlLine;

  return `{\n` +
    `\\rtf1\\ansi\\deff0\n` +
    `{\\colortbl ;\\red26\\green86\\blue50;}\n` +
    `{\\fonttbl{\\f0 Arial;}}\n` +
    `\\fs24\n` +
    part1 + part2 + part3 +
    `\n}`;
}

// Download RTF wrapper
async function downloadRTF() {
  try {
    const rtf = await generateRTFContent();
    const blob = new Blob([rtf], { type: 'application/rtf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'signature.rtf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('RTF generation failed:', err);
  }
}

// Copy preview HTML to clipboard, preserving color
function copyToClipboard() {
  const preview = el('signature-preview').innerHTML;
  const container = document.createElement('div');
  container.style.color = '#1E6B52';
  container.innerHTML = preview;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  try {
    document.execCommand('copy');
    el('copy-success').style.display = 'inline';
    setTimeout(() => {
      el('copy-success').style.display = 'none';
    }, 2000);
  } catch (err) {
    console.error('Copy failed:', err);
  }

  sel.removeAllRanges();
  document.body.removeChild(container);
}

// Toggle between standard and abbreviated versions
function toggleVersion(isStandard) {
  el('btn-standard').classList.toggle('active', isStandard);
  el('btn-abbreviated').classList.toggle('active', !isStandard);
  updateSignaturePreview();
}

// Update the signature preview (always show placeholders; disable buttons if invalid)
async function updateSignaturePreview() {
  // Check validity
  const valid = validateAllRequiredFields();
  el('copy-button').disabled = !valid;
  el('download-button').disabled = !valid;

  // Gather values or placeholders
  const name        = el('name').value.trim()        || 'John Doe';
  const creds       = el('credentials').value.trim() ? `, ${el('credentials').value.trim()}` : '';
  const title       = el('title').value.trim()       || 'Program Director II';
  const room        = el('room').value.trim()        || 'MT634';
  const street      = el('street').value.trim()      || '1717 11th Avenue South';
  const cityState   = el('city-state').value.trim()  || 'Birmingham, AL';
  const zip         = el('zip').value.trim()         || '35294-4410';
  const email       = el('email').value.trim()       || 'johndoe@uabmc.edu';
  const pronouns    = el('pronouns').value.trim()    ? `<br>Pronouns: ${el('pronouns').value.trim()}` : '';

  // Phones
  const phones = [];
  if (el('phone-office-enable').checked) {
    phones.push(`O: ${formatPhoneNumber(el('phone-office').value.trim() || '')}`);
  }
  if (el('phone-mobile-enable').checked) {
    phones.push(`M: ${formatPhoneNumber(el('phone-mobile').value.trim() || '')}`);
  }
  const phoneLine = phones.join(', ');

  // Banner image
  let bannerHtml = '';
  if (el('add-image-checkbox').checked) {
    try {
      const url = 'https://www.uab.edu/medicine/images/banner.png';
      const dataUrl = await getImageHex(url);
      bannerHtml = `<img src="${dataUrl}" alt="UAB Banner" style="max-width:100%; margin-bottom:0.5rem;">`;
    } catch (e) {
      console.error('Banner load failed:', e);
    }
  }

  // Determine version
  const isStandard = el('btn-standard').classList.contains('active');
  const baseUrl = 'uab.edu/medicine/gimaps';

  // Build HTML
  let html = bannerHtml +
    `<strong style="color:#1E6B52;">${name}${creds} | ${title}</strong><br>`;

  if (isStandard) {
    html +=
      `Department of Medicine | Heersink School of Medicine<br>` +
      `Division of General Internal Medicine & Population Science<br>` +
      `UAB | The University of Alabama at Birmingham<br>` +
      `${room} | ${street} | ${cityState} ${zip}<br>`;
  } else {
    html += `UAB | The University of Alabama at Birmingham<br>`;
  }

  if (phoneLine) {
    html += `${phoneLine} | `;
  }

  html += `<a href="mailto:${email}">${email}</a>${pronouns}<br><br>` +
    `<a href="https://${baseUrl}" target="_blank">${baseUrl}</a>`;

  el('signature-preview').innerHTML = html;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Wire up version buttons
  el('btn-standard').addEventListener('click', () => toggleVersion(true));
  el('btn-abbreviated').addEventListener('click', () => toggleVersion(false));

  // Live-update listeners
  ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
    .forEach(id => {
      const inp = el(id);
      if (!inp) return;
      inp.addEventListener('input', updateSignaturePreview);
      inp.addEventListener('blur', () => validateField(inp));
    });
  ['phone-office-enable','phone-mobile-enable','add-image-checkbox']
    .forEach(id => el(id).addEventListener('change', updateSignaturePreview));

  // Copy & Download
  el('copy-button').addEventListener('click', copyToClipboard);
  el('download-button').addEventListener('click', downloadRTF);

  // Initial render
  updateSignaturePreview();
});
