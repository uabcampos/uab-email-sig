// validation.js

// Function to validate individual fields
function validateField(field) {
    clearError(field);

    // Required check
    if (field.hasAttribute('required') && !field.value.trim()) {
        displayError(field, 'This field is required.');
        field.classList.add('invalid');
        return;
    }

    // Specific format checks
    switch (field.id) {
        case 'city-state':
            validateCityState(field);
            break;
        case 'zip':
            validateZipCode(field);
            break;
        case 'email':
            validateEmail(field);
            break;
        case 'phone-office':
        case 'phone-mobile':
            validatePhoneNumber(field);
            break;
        default:
            break;
    }

    if (!field.classList.contains('invalid')) {
        field.classList.remove('invalid');
    }
}

// Clear previous error
function clearError(field) {
    const err = document.getElementById(`${field.id}-error`);
    if (err) {
        err.innerText = '';
        err.style.display = 'none';
    }
    field.classList.remove('invalid');
}

// Display error
function displayError(field, msg) {
    const err = document.getElementById(`${field.id}-error`);
    if (err) {
        err.innerText = msg;
        err.style.display = 'block';
    }
    field.classList.add('invalid');
}

// City, State format: "City, ST"
function validateCityState(field) {
    const re = /^[A-Za-z\s]+,\s*[A-Z]{2}$/;
    if (!re.test(field.value.trim())) {
        displayError(field, 'Enter City, ST (e.g., Birmingham, AL).');
    }
}

// ZIP: 5 or 5-4
function validateZipCode(field) {
    const re = /^\d{5}(-\d{4})?$/;
    if (!re.test(field.value.trim())) {
        displayError(field, 'Enter a valid ZIP code.');
    }
}

// Email: uab.edu or uabmc.edu
function validateEmail(field) {
    const re = /^[A-Za-z0-9._%+-]+@(uab\.edu|uabmc\.edu)$/;
    if (!re.test(field.value.trim())) {
        displayError(field, 'Enter a valid UAB or UABMC email.');
    }
}

// Phone: 7 or 10 digits
function validatePhoneNumber(field) {
    const digits = field.value.replace(/\D/g, '');
    if (!(/^\d{7}$/.test(digits) || /^\d{10}$/.test(digits))) {
        displayError(field, 'Enter a valid 7 or 10 digit phone number.');
    }
}

// Validate all required on load
function validateAllRequiredFields() {
    document.querySelectorAll('[required]').forEach(f => validateField(f));
}
