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

    document.getElementById('preview-phone').innerText = phoneText;
    document.getElementById('preview-abbr-phone').innerText = phoneAbbrText;

    if (phoneText || phoneAbbrText) {
        document.getElementById('preview-email-wrapper').innerText = `| ${email}`;
    } else {
        document.getElementById('preview-email-wrapper').innerText = email;
    }
}

function updatePronouns() {
    const pronouns = document.getElementById('pronouns').value;
    document.getElementById('preview-pronouns').innerText = pronouns ? `Pronouns: ${pronouns}` : '';
}
