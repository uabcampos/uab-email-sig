document.addEventListener('DOMContentLoaded', function() {
    addEventListeners();
    selectVersion('standard'); // Default to the standard version on load
});

function addEventListeners() {
    const elements = [
        'name', 'credentials', 'title', 'room', 'street', 
        'city-state', 'zip', 'phone-office', 'phone-mobile', 
        'email', 'pronouns'
    ];

    elements.forEach(id => {
        document.getElementById(id).addEventListener('input', updatePreview);
    });

    document.getElementById('phone-office-enable').addEventListener('change', updatePreview);
    document.getElementById('phone-mobile-enable').addEventListener('change', updatePreview);
    document.getElementById('btn-standard').addEventListener('click', () => selectVersion('standard'));
    document.getElementById('btn-abbreviated').addEventListener('click', () => selectVersion('abbreviated'));
    document.getElementById('copy-button').addEventListener('click', copyToClipboard);
}

let currentVersion = 'standard';

function selectVersion(version) {
    currentVersion = version;
    const standardButton = document.getElementById('btn-standard');
    const abbreviatedButton = document.getElementById('btn-abbreviated');

    if (version === 'standard') {
        standardButton.classList.add('active');
        abbreviatedButton.classList.remove('active');
    } else {
        abbreviatedButton.classList.add('active');
        standardButton.classList.remove('active');
    }

    updatePreview(); // Update the preview immediately after selecting the version
}

function updatePreview() {
    const name = document.getElementById('name').value || 'John Doe';
    const credentials = document.getElementById('credentials').value ? `, ${document.getElementById('credentials').value}` : '';
    const title = document.getElementById('title').value || 'Program Director II';
    const room = document.getElementById('room').value || 'MT634';
    const street = document.getElementById('street').value || '1717 11th Avenue South';
    const cityState = document.getElementById('city-state').value || 'Birmingham, AL';
    const zip = document.getElementById('zip').value || '35294-4410';
    const fullAddress = `${room} | ${street} | ${cityState} ${zip}`;

    const phoneOfficeEnabled = document.getElementById('phone-office-enable').checked;
    const phoneMobileEnabled = document.getElementById('phone-mobile-enable').checked;

    const phoneOffice = phoneOfficeEnabled ? formatPhoneNumber(document.getElementById('phone-office').value) : '';
    const phoneMobile = phoneMobileEnabled ? formatPhoneNumber(document.getElementById('phone-mobile').value) : '';
    const email = document.getElementById('email').value || 'johndoe@uabmc.edu';
    const pronouns = document.getElementById('pronouns').value ? `Pronouns: ${document.getElementById('pronouns').value}` : '';

    const contactInfo = generateContactInfo(phoneOffice, phoneMobile, email);

    let previewContent;

    if (currentVersion === 'standard') {
        previewContent = `
            <strong>${name}${credentials} | ${title}</strong><br>
            Department of Medicine | Heersink School of Medicine<br>
            Division of Preventive Medicine<br>
            UAB | The University of Alabama at Birmingham<br>
            ${fullAddress}<br>
            ${contactInfo}<br>
            ${pronouns}<br>
            <br><a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>
        `;
    } else {
        previewContent = `
            <strong>${name}${credentials} | ${title}</strong><br>
            ${contactInfo}<br>
            ${pronouns}<br>
            <br><a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>
        `;
    }

    document.getElementById('signature-preview').innerHTML = cleanUpHtml(previewContent);
}

function generateContactInfo(phoneOffice, phoneMobile, email) {
    let contactInfo = '';

    if (phoneOffice && phoneMobile) {
        contactInfo = `O: ${phoneOffice}, M: ${phoneMobile} | <a href="mailto:${email}">${email}</a>`;
    } else if (phoneOffice) {
        contactInfo = `O: ${phoneOffice} | <a href="mailto:${email}">${email}</a>`;
    } else if (phoneMobile) {
        contactInfo = `M: ${phoneMobile} | <a href="mailto:${email}">${email}</a>`;
    } else {
        contactInfo = `<a href="mailto:${email}">${email}</a>`;
    }

    return contactInfo;
}

function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    phoneNumber = phoneNumber.replace(/\D/g, '');
    if (phoneNumber.length === 7) {
        phoneNumber = '205' + phoneNumber;
    }
    if (phoneNumber.length === 10) {
        return `${phoneNumber.substring(0, 3)}.${phoneNumber.substring(3, 6)}.${phoneNumber.substring(6)}`;
    }
    return phoneNumber;
}

function cleanUpHtml(htmlContent) {
    return htmlContent.replace(/(<br>\s*){2,}/g, '<br>').trim();
}

function validateField(field, errorElementId) {
    const errorMessage = document.getElementById(errorElementId);
    if (field.validity.valueMissing) {
        errorMessage.innerText = 'This field is required.';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}

function validateForm() {
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        validateField(field, `${field.id}-error`);
    });
}

function copyToClipboard() {
    const signature = document.getElementById('signature-preview');
    const range = document.createRange();
    range.selectNodeContents(signature);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');
        const copySuccess = document.getElementById('copy-success');
        copySuccess.innerText = 'Signature copied to clipboard!';
        copySuccess.style.display = 'block';

        setTimeout(() => {
            copySuccess.style.display = 'none';
        }, 3000);
    } catch (err) {
        console.error('Failed to copy signature: ', err);
    }

    selection.removeAllRanges();
}

addEventListeners();
