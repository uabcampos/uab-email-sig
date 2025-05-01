// script.js

// Simple helper
function el(id) {
  return document.getElementById(id);
}

// Always show a preview (using placeholders if empty)
function updateSignaturePreview() {
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
  if (el('phone-office-enable').checked) phones.push(`O: ${el('phone-office').value.trim() || '205.975.7908'}`);
  if (el('phone-mobile-enable').checked) phones.push(`M: ${el('phone-mobile').value.trim() || '205.555.1234'}`);
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

// Stub alert for copy
function copyToClipboard() {
  alert('✅ Copy handler fired');
}

// Stub alert for download
function downloadRTF() {
  alert('✅ Download handler fired');
}

// Toggle versions
function toggleVersion(isStd) {
  el('btn-standard').classList.toggle('active', isStd);
  el('btn-abbreviated').classList.toggle('active', !isStd);
  updateSignaturePreview();
}

// On load, bind everything
document.addEventListener('DOMContentLoaded', () => {
  // Bind inputs for live preview
  [
    'name','credentials','title','room','street','city-state',
    'zip','email','pronouns','phone-office','phone-mobile'
  ].forEach(id => {
    const inp = el(id);
    if (!inp) return;
    inp.addEventListener('input', updateSignaturePreview);
  });

  // Bind checkboxes
  ['phone-office-enable','phone-mobile-enable']
    .forEach(id => el(id)?.addEventListener('change', updateSignaturePreview));

  // Version buttons
  el('btn-standard')?.addEventListener('click', () => toggleVersion(true));
  el('btn-abbreviated')?.addEventListener('click', () => toggleVersion(false));

  // Copy & Download
  el('copy-button')?.addEventListener('click', copyToClipboard);
  el('download-button')?.addEventListener('click', downloadRTF);

  // Initial preview
  toggleVersion(true);
  updateSignaturePreview();
});
