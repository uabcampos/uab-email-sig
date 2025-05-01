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
  const html  = el('signature-preview').innerHTML;
  const parts = html.split('<br>').map(p => p.trim()).filter(Boolean);

  const part1 = '\\line ';
  const body  = parts.slice(0,-1).map(line =>
    line
      .replace(/<strong.*?>(.*?)<\/strong>/, '{\\b\\cf1 $1}')
      .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/, '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
      .replace(/<\/?[^>]+>/g, '')
  ).join('\\line ');
  const part2 = body + '\\line ';

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
  alert('▶ copyToClipboard handler running');
  // … your real copy logic …
}

async function downloadRTF() {
  console.log('🔍 downloadRTF invoked');
  alert('▶ downloadRTF handler running');
  // … your real download logic …
}

async function updateSignaturePreview() {
  console.log('✏️ updateSignaturePreview');
  // simplified placeholder preview
  el('signature-preview').innerHTML = 
    '<strong style="color:#1E6B52;">John Doe, Ph.D. | Program Director II</strong><br>' +
    'Department of Medicine | Heersink School of Medicine<br>' +
    'UAB | The University of Alabama at Birmingham<br>' +
    'MT634 | 1717 11th Avenue South | Birmingham, AL 35294-4410<br>' +
    '<a href="mailto:johndoe@uabmc.edu">johndoe@uabmc.edu</a><br>' +
    '<a href="https://uab.edu/medicine/gimaps" target="_blank">uab.edu/medicine/gimaps</a>';
}

function toggleVersion(isStandard) {
  console.log(`🔀 toggleVersion(${isStandard})`);
  el('btn-standard').classList.toggle('active', isStandard);
  el('btn-abbreviated').classList.toggle('active', !isStandard);
  updateSignaturePreview();
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOMContentLoaded');

  // Monitor all clicks on body
  document.body.addEventListener('click', e => {
    console.log(`📋 body click at ${e.target.id || e.target.tagName}`);
  });

  // Bind version buttons
  ['btn-standard','btn-abbreviated'].forEach(id => {
    const btn = el(id);
    if (btn) {
      console.log(`📌 binding #${id}`);
      btn.addEventListener('click', () => toggleVersion(id==='btn-standard'));
      btn.onclick = () => toggleVersion(id==='btn-standard');
    }
  });

  // Bind copy & download
  const copyBtn = el('copy-button');
  const dlBtn   = el('download-button');
  if (copyBtn) {
    console.log('📌 binding #copy-button');
    copyBtn.addEventListener('click', copyToClipboard);
    copyBtn.onclick = copyToClipboard;
  }
  if (dlBtn) {
    console.log('📌 binding #download-button');
    dlBtn.addEventListener('click', downloadRTF);
    dlBtn.onclick = downloadRTF;
  }

  // Initial preview
  updateSignaturePreview();
});
