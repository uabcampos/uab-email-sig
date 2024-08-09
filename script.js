document.getElementById('name').addEventListener('input', function() {
    updatePreview();
});

document.getElementById('credentials').addEventListener('input', function() {
    updatePreview();
});

document.getElementById('title').addEventListener('input', function() {
    updatePreview();
});

document.getElementById('room').addEventListener('input', function() {
    updateAddress();
});

document.getElementById('street').addEventListener('input', function() {
    updateAddress();
});

document.getElementById('city-state').addEventListener('input', function() {
    updateAddress();
});

document.getElementById('zip').addEventListener('input', function() {
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
    document.getElementById('preview-email').innerText = this.value;
    document.getElementById('preview-email').href = 'mailto:' + this.value;
});

document.getElementById('pronouns').addEventListener('input', function() {
    document.getElementById('preview-pronouns').innerText = this.value ? 'Pronouns: ' + this.value : '';
});

function updatePreview() {
    const name = document.getElementById('name').value;
    const credentials = document.getElementById('credentials').value;
    const title = document.getElementById('title').value;

    document.getElementById('preview-name').innerText = name;
    document.getElementById('preview-credentials').innerText = credentials ? ', ' + credentials : '';
    document.getElementById('preview-title').innerText = title;
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

    let phoneText = '';

    if (phoneOfficeEnabled && phoneOffice) {
        phoneText = `O: ${phoneOffice}`;
    }

    if (phoneMobileEnabled && phoneMobile) {
        if (phoneText) {
            phoneText += `, M: ${phoneMobile}`;
        } else {
            phoneText = `M: ${phoneMobile}`;
        }
    }

    document.getElementById('preview-phone').innerText = phoneText;
}
