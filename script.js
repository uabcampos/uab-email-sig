// script.js

// Helper to get elements by id
function el(id) {
    return document.getElementById(id);
}

// Format phone numbers (7 or 10 digits)
function formatPhoneNumber(phoneNumber) {
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length === 7) {
        return `205.${digits.slice(0, 3)}.${digits.slice(3)}`; // assume 205 area code
    } else if (digits.length === 10) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }
    return phoneNumber;
}

// Fetch a banner image as a data-URL
function getImageHex(url) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result); // reader.result is a data: URL
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = reject;
        xhr.send();
    });
}

// Update the HTML preview; now async to await banner fetch
async function updateSignaturePreview() {
    // Validate all required/enabled fields first
    if (!validateAllRequiredFields()) return;

    // Gather form values, using placeholders if empty
    const name        = el('name').value.trim() || 'John Doe';
    const credentials = el('credentials').value.trim() ? `, ${el('credentials').value.trim()}` : '';
    const title       = el('title').value.trim() || 'Program Director II';
    const room        = el('room').value.trim() || 'MT634';
    const street      = el('street').value.trim() || '1717 11th Avenue South';
    const cityState   = el('city-state').value.trim() || 'Birmingham, AL';
    const zip         = el('zip').value.trim() || '35294-4410';
    const email       = el('email').value.trim() || 'johndoe@uabmc.edu';
    const pronouns    = el('pronouns').value.trim() ? `<br>Pronouns: ${el('pronouns').value.trim()}` : '';

    // Phones
    const phones = [];
    if (el('phone-office-enable').checked) {
        phones.push(`O: ${formatPhoneNumber(el('phone-office').value.trim() || '2059757908')}`);
    }
    if (el('phone-mobile-enable').checked) {
        phones.push(`M: ${formatPhoneNumber(el('phone-mobile').value.trim() || '2055551234')}`);
    }
    const phoneLine = phones.join(', ');

    // Banner (if checked)
    let bannerHtml = '';
    if (el('add-image-checkbox').checked) {
        // Replace with your actual banner URL
        const bannerUrl = 'https://www.uab.edu/medicine/images/banner.png';
        try {
            const dataUrl = await getImageHex(bannerUrl);
            bannerHtml = `<img src="${dataUrl}" alt="UAB Banner" style="max-width:100%; margin-bottom:0.5rem;">`;
        } catch (err) {
            console.error('Banner load failed', err);
        }
    }

    // Determine version
    const isStandard = el('btn-standard').classList.contains('active');
    const url = 'uab.edu/medicine/gimaps';

    // Build signature HTML
    let html = bannerHtml +
               `<strong style="color:#1E6B52;">${name}${credentials} | ${title}</strong><br>`;

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
            `<a href="https://${url}" target="_blank">${url}</a>`;

    el('signature-preview').innerHTML = html;
}

// Copy preview to clipboard (preserves styling color)
function copyToClipboard() {
    const wrapper = el('signature-preview');
    const container = document.createElement('div');
    container.style.color = '#1E6B52';
    container.innerHTML = wrapper.innerHTML;
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    try {
        document.execCommand('copy');
        el('copy-success').style.display = 'block';
        setTimeout(() => { el('copy-success').style.display = 'none'; }, 2000);
    } catch (err) {
        console.error('Copy failed', err);
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

// Initialize event listeners and preview on load
window.addEventListener('DOMContentLoaded', () => {
    // Version label
    const ver = document.documentElement.getAttribute('data-version');
    el('signature-version').textContent = `Version ${ver}`;

    // Live-preview & validate on input/blur
    ['name','credentials','title','room','street','city-state','zip','email','pronouns','phone-office','phone-mobile']
        .forEach(id => {
            const input = el(id);
            if (!input) return;
            input.addEventListener('blur', () => { validateField(input); updateSignaturePreview(); });
            input.addEventListener('input', () => updateSignaturePreview());
        });

    // Enable checkboxes
    el('phone-office-enable').addEventListener('change', updateSignaturePreview);
    el('phone-mobile-enable').addEventListener('change', updateSignaturePreview);
    el('add-image-checkbox').addEventListener('change', updateSignaturePreview);

    // Version buttons
    el('btn-standard').addEventListener('click', () => toggleVersion(true));
    el('btn-abbreviated').addEventListener('click', () => toggleVersion(false));

    // Copy & Download
    el('copy-button').addEventListener('click', copyToClipboard);
    el('download-button').addEventListener('click', downloadRTF);

    // Default state
    toggleVersion(true);
    updateSignaturePreview();
});
