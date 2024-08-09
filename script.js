document.addEventListener('DOMContentLoaded', function() {
    // Initialize validation and preview on page load
    updatePreview();
    validateForm();
});

document.getElementById('name').addEventListener('input', function() {
    validateField(this, 'name-error');
    updatePreview();
});

document.getElementById('credentials').addEventListener('input', function() {
    updatePreview();
});

document.getElementById('title').addEventListener('input', function() {
    validateField(this, 'title-error');
    updatePreview();
});

document.getElementById('room').addEventListener('input', function() {
    validateField(this, 'room-error');
    updateAddress();
});

document.getElementById('street').addEventListener('input', function() {
    validateField(this, 'street-error');
    updateAddress();
});

document.getElementById('city-state').addEventListener('input', function() {
    validateCityState(this);
    updateAddress();
});

document.getElementById('zip').addEventListener('input', function() {
    validateZipCode(this);
    updateAddress();
});

document.getElementById('phone-office').addEventListener('input', function() {
    validatePhoneNumber(this);
    updatePhone();
});

document.getElementById('phone-office-enable').addEventListener('change', function() {
    updatePhone();
});

document.getElementById('phone-mobile').addEventListener('input', function() {
    validatePhoneNumber(this);
    updatePhone();
});

document.getElementById('phone-mobile-enable').addEventListener('change', function() {
    updatePhone();
});

document.getElementById('email').addEventListener('input', function() {
    validateEmail(this);
    updatePhone();
});

document.getElementById('pronouns').addEventListener('input', function() {
    updatePronouns();
});

function selectVersion(version) {
    if (version === 'standard') {
        document.getElementById('btn-standard').classList.add('selected');
        document.getElementById('btn-abbreviated').classList.remove('selected');
        document.getElementById('standard-fields').style.display = 'block';
        document.getElementById('abbreviated-fields').style.display = 'none';
        document.getElementById('preview-standard').style.display = 'block';
        document.getElementById('preview-abbreviated').style.display = 'none';
        updatePreview(); // Update preview for the standard version
    } else if (version === 'abbreviated') {
        document.getElementById('btn-abbreviated').classList.add('selected');
        document.getElementById('btn-standard').classList.remove('selected');
        document.getElementById('standard-fields').style.display = 'none';
        document.getElementById('abbreviated-fields').style.display = 'block';
        document.getElementById('preview-standard').style.display = 'none';
        document.getElementById('preview-abbreviated').style.display = 'block';
        updateAbbreviatedPreview(); // Update preview for the abbreviated version
    }
}

function updatePreview() {
    const name = document.getElementById('name').value || 'John Doe';
    const credentials = document.getElementById('credentials').value || 'Ph.D., MPH';
    const title = document.getElementById('title').value || 'Program Director II';

    const phoneContent = document.getElementById('preview-phone').innerHTML.trim();
    const pronounsContent = document.getElementById('preview-pronouns').innerHTML.trim();

    let previewContent = `<strong>${name}${credentials ? ', ' + credentials : ''} | ${title}</strong><br>
        Department of Medicine | Heersink School of Medicine<br>
        Division of Preventive Medicine<br>
        UAB | The University of Alabama at Birmingham<br>
        <span id="preview-address">MT 509H | 1717 11th Avenue South | Birmingham, AL 35294-4410</span>`;

    if (phoneContent || pronounsContent) {
        previewContent += `<br>${phoneContent}<br>${pronounsContent}`;
    }

    previewContent += `<br><a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>`;

    document.getElementById('signature-preview').innerHTML = previewContent;

    cleanUpPreview();
}

function updateAbbreviatedPreview() {
    const name = document.getElementById('name').value || 'John Doe';
    const credentials = document.getElementById('credentials').value || 'Ph.D., MPH';
    const title = document.getElementById('title').value || 'Program Director II';

    const phoneContent = document.getElementById('preview-abbr-phone').innerHTML.trim();
    const pronounsContent = document.getElementById('preview-abbr-pronouns').innerHTML.trim();

    let previewContent = `<strong>${name}${credentials ? ', ' + credentials : ''} | ${title}</strong><br>`;

    if (phoneContent || pronounsContent) {
        previewContent += `${phoneContent}<br>${pronounsContent}<br>`;
    }

    previewContent += `<a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>`;

    document.getElementById('preview-abbreviated').innerHTML = previewContent;

    cleanUpPreview();
}

function updateAddress() {
    const room = document.getElementById('room').value || 'MT634';
    const street = document.getElementById('street').value || '1717 11th Avenue South';
    const cityState = document.getElementById('city-state').value || 'Birmingham, AL';
    const zip = document.getElementById('zip').value || '35294-4410';

    const fullAddress = `${room} | ${street} | ${cityState} ${zip}`;
    document.getElementById('preview-address').innerText = fullAddress;

    cleanUpPreview();
}

function updatePhone() {
    const phoneOfficeEnabled = document.getElementById('phone-office-enable').checked;
    const phoneMobileEnabled = document.getElementById('phone-mobile-enable').checked;

    let phoneOffice = document.getElementById('phone-office').value;
    let phoneMobile = document.getElementById('phone-mobile').value;
    const email = document.getElementById('email').value || 'johndoe@uabmc.edu';

    phoneOffice = formatPhoneNumber(phoneOffice);
    phoneMobile = formatPhoneNumber(phoneMobile);

    let phoneText = '';
    let phoneAbbrText = '';
    let emailText = `<a href="mailto:${email}">${email}</a>`;

    if (phoneOfficeEnabled && phoneOffice) {
        phoneText = `O: ${phoneOffice}`;
        phoneAbbrText = `O: ${phoneOffice}`;
    }

    if (phoneMobileEnabled && phoneMobile) {
        if (phoneText) {
            phoneText += `, M: ${phoneMobile}`;
        } else {
            phoneText = `M: ${phoneMobile}`;
        }

        if (phoneAbbrText) {
            phoneAbbrText += `, M: ${phoneMobile}`;
        } else {
            phoneAbbrText = `M: ${phoneMobile}`;
        }
    }

    if (phoneText) {
        document.getElementById('preview-phone').innerHTML = `${phoneText} | ${emailText}`;
    } else {
        document.getElementById('preview-phone').innerHTML = emailText;
    }

    if (phoneAbbrText) {
        document.getElementById('preview-abbr-phone').innerHTML = `${phoneAbbrText} | ${emailText}`;
    } else {
        document.getElementById('preview-abbr-phone').innerHTML = emailText;
    }

    cleanUpPreview();
}

function updatePronouns() {
    const pronouns = document.getElementById('pronouns').value;
    const pronounsText = pronouns ? `Pronouns: ${pronouns}` : '';

    document.getElementById('preview-pronouns').innerText = pronounsText;
    document.getElementById('preview-abbr-pronouns').innerText = pronounsText;

    cleanUpPreview();
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

function validatePhoneNumber(field) {
    let phoneNumber = field.value.replace(/\D/g, '');
    if (phoneNumber.length === 7) {
        phoneNumber = '205' + phoneNumber;
    }
    if (phoneNumber.length === 10) {
        field.value = formatPhoneNumber(phoneNumber);
    }
}

function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    phoneNumber = phoneNumber.replace(/\D/g, '');
    if (phoneNumber.length === 10) {
        return `${phoneNumber.substring(0, 3)}.${phoneNumber.substring(3, 6)}.${phoneNumber.substring(6)}`;
    }
    return phoneNumber;
}

function validateEmail(field) {
    const errorMessage = document.getElementBy

Id('email-error');
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

// Remove unnecessary blank lines before the URL
function cleanUpPreview() {
    const previewElement = document.getElementById('signature-preview');
    const previewHtml = previewElement.innerHTML;

    // Remove any extra <br> tags if there are multiple in a row
    const cleanedHtml = previewHtml.replace(/(<br>\s*){2,}/g, '<br>');

    previewElement.innerHTML = cleanedHtml;
}
