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
    validateField(this, 'city-state-error');
    updateAddress();
});

document.getElementById('zip').addEventListener('input', function() {
    validateField(this, 'zip-error');
    updateAddress();
});

document.getElementById('phone-office').addEventListener('input', function() {
    updatePhone();
});

document.getElementById('phone-office-enable').addEventListener('change', function() {
    updatePhone();
});

document.getElementById('phone-mobile').addEventListener('input', function() {
    updatePhone();
});

document.getElementById('phone-mobile-enable').addEventListener('change', function() {
    updatePhone();
});

document.getElementById('email').addEventListener('input', function() {
    validateField(this, 'email-error');
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
    } else if (version === 'abbreviated') {
        document.getElementById('btn-abbreviated').classList.add('selected');
        document.getElementById('btn-standard').classList.remove('selected');
        document.getElementById('standard-fields').style.display = 'none';
        document.getElementById('abbreviated-fields').style.display = 'block';
        document.getElementById('preview-standard').style.display = 'none';
        document.getElementById('preview-abbreviated').style.display = 'block';
    }
}

function updatePreview() {
    const name = document.getElementById('name').value || document.getElementById('abbr-name').value;
    const credentials = document.getElementById('credentials').value;
    const title = document.getElementById('title').value || document.getElementById('abbr-title').value;

    document.getElementById('preview-name').innerText = name;
    document.getElementById('preview-credentials').innerText = credentials ? ', ' + credentials : '';
    document.getElementById('preview-title').innerText = title;

    document.getElementById('preview-abbr-name').innerText = name;
    document.getElementById('preview-abbr-title').innerText = title;
}

function updateAddress() {
    const room = document.getElementById('room').value;
    const street = document.getElementById('street').value;
    const cityState = document.getElementById('city-state').value;
    const zip = document.getElementById('zip').value;

    const fullAddress = `${room} | ${street} | ${cityState} ${zip}`;
    document.getElementById('preview-address').innerText = fullAddress;
}

function updatePhone() {
    const phoneOfficeEnabled = document.getElementById('phone-office-enable').checked;
    const phoneMobileEnabled = document.getElementById('phone-mobile-enable').checked;

    const phoneOffice = document.getElementById('phone-office').value;
    const phoneMobile = document.getElementById('phone-mobile').value;
    const email = document.getElementById('email').value;

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
}

function updatePronouns() {
    const pronouns = document.getElementById('pronouns').value;
    const pronounsText = pronouns ? `Pronouns: ${pronouns}` : '';

    document.getElementById('preview-pronouns').innerText = pronounsText;
    document.getElementById('preview-abbr-pronouns').innerText = pronounsText;
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

function copyToClipboard() {
    const signature = document.getElementById('signature-preview').innerHTML;
    const tempElement = document.createElement('div');
    tempElement.innerHTML = signature;
    document.body.appendChild(tempElement);
    
    const range = document.createRange();
    range.selectNodeContents(tempElement);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    document.execCommand('copy');
    document.body.removeChild(tempElement);
    
    const copySuccess = document.getElementById('copy-success');
    copySuccess.innerText = 'Signature copied to clipboard!';
    copySuccess.style.display = 'block';

    setTimeout(() => {
        copySuccess.style.display = 'none';
    }, 3000);
}
