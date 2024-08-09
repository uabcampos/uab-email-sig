document.addEventListener('DOMContentLoaded', function() {
    // Initialize preview and validation on page load
    updatePreview();
    validateForm();
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
}

function selectVersion(version) {
    const standardFields = document.getElementById('standard-fields');
    const abbreviatedFields = document.getElementById('abbreviated-fields');
    const standardPreview = document.getElementById('preview-standard');
    const abbreviatedPreview = document.getElementById('preview-abbreviated');

    if (version === 'standard') {
        standardFields.style.display = 'block';
        abbreviatedFields.style.display = 'none';
        standardPreview.style.display = 'block';
        abbreviatedPreview.style.display = 'none';
    } else {
        standardFields.style.display = 'none';
        abbreviatedFields.style.display = 'block';
        standardPreview.style.display = 'none';
        abbreviatedPreview.style.display = 'block';
    }

    updatePreview();
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

    const standardPreviewContent = `
        <strong>${name}${credentials} | ${title}</strong><br>
        Department of Medicine | Heersink School of Medicine<br>
        Division of Preventive Medicine<br>
        UAB | The University of Alabama at Birmingham<br>
        <span id="preview-address">${fullAddress}</span><br>
        ${contactInfo}<br>
        ${pronouns}<br>
        <br><a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>
    `.trim();

    const abbreviatedPreviewContent = `
        <strong>${name}${credentials} | ${title}</strong><br>
        ${contactInfo}<br>
        ${pronouns}<br>
        <br><a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>
    `.trim();

    document.getElementById('preview-standard').innerHTML = cleanUpHtml(standardPreviewContent);
    document.getElementById('preview-abbreviated').innerHTML = cleanUpHtml(abbreviatedPreviewContent);
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
    // Trigger validation for all fields
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        validateField(field, `${field.id}-error`);
    });
}

function validateCityState(field) {
    const errorMessage = document.getElementById('city-state-error');
    const cityStateRegex = /^[a-zA-Z]+(?:[\s-][a-zA-Z]+)*,\s*[A-Z]{2}$/;
    if (!cityStateRegex.test(field.value)) {
        errorMessage.innerText = 'Enter a valid City, ST format.';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}

function validateZipCode(field) {
    const errorMessage = document.getElementById('zip-error');
    const zipCodeRegex = /^\d{5}(?:-\d{4})?$/;
    if (!zipCodeRegex.test(field.value)) {
        errorMessage.innerText = 'Enter a valid ZIP code.';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}

function validateEmail(field) {
    const errorMessage = document.getElementById('email-error');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(uab\.edu|uabmc\.edu)$/;
    if (!emailRegex.test(field.value)) {
        errorMessage.innerText = 'Enter a valid UAB or UABMC email address.';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
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

    // Clear the selection after copying
    selection.removeAllRanges();
}

addEventListeners();
