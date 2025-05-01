// validation.js

function validateField(field) {
    clearError(field);

    if (field.hasAttribute('required') && !field.value.trim()) {
        displayError(field, 'This field is required.');
    } else {
        switch (field.id) {
            case 'city-state': validateCityState(field); break;
            case 'zip':        validateZipCode(field);  break;
            case 'email':      validateEmail(field);    break;
            case 'phone-office':
            case 'phone-mobile':
                validatePhoneNumber(field);
                break;
            default:
                break;
        }
    }

    const label = document.querySelector(`label[for="${field.id}"]`);
    if (field.classList.contains('invalid')) {
        field.classList.remove('valid');
        label && label.classList.remove('valid');
    } else {
        field.classList.add('valid');
        label && label.classList.add('valid');
    }
}

function clearError(field) {
    const err = document.getElementById(`${field.id}-error`);
    if (err) {
        err.textContent = '';
        err.style.display = 'none';
    }
    field.classList.remove('invalid');
}

function displayError(field, msg) {
    const err = document.getElementById(`${field.id}-error`);
    if (err) {
        err.textContent = msg;
        err.style.display = 'block';
    }
    field.classList.add('invalid');
}

function validateCityState(field) {
    const re = /^[A-Za-z\s]+,\s*[A-Z]{2}$/;
    if (!re.test(field.value.trim())) {
        displayError(field, 'Enter City, ST (e.g., Birmingham, AL).');
    }
}

function validateZipCode(field) {
    const re = /^\d{5}(-\d{4})?$/;
    if (!re.test(field.value.trim())) {
        displayError(field, 'Enter a valid ZIP code.');
    }
}

function validateEmail(field) {
    const re = /^[A-Za-z0-9._%+-]+@(uab\.edu|uabmc\.edu)$/;
    if (!re.test(field.value.trim())) {
        displayError(field, 'Enter a valid UAB or UABMC email.');
    }
}

function validatePhoneNumber(field) {
    const digits = field.value.replace(/\D/g, '');
    if (!(digits.length === 7 || digits.length === 10)) {
        displayError(field, 'Enter a valid 7 or 10 digit phone number.');
    }
}

function validateAllRequiredFields() {
    document.querySelectorAll('[required]').forEach(f => validateField(f));
}

window.validateField = validateField;
