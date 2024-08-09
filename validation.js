function validateField(field) {
    // Clear any previous error messages
    clearError(field);

    // Check if the field is required and is empty
    if (field.hasAttribute('required') && !field.value) {
        displayError(field, 'This field is required.');
        return;
    }

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
        default:
            break;
    }
}

function validateCityState(field) {
    const cityStateRegex = /^[a-zA-Z\s]+,\s*[A-Z]{2}$/;
    if (!cityStateRegex.test(field.value)) {
        displayError(field, 'Enter a valid City, ST format (e.g., Birmingham, AL).');
    }
}

function validateZipCode(field) {
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(field.value)) {
        displayError(field, 'Enter a valid ZIP code (e.g., 35294 or 35294-4410).');
    }
}

function validateEmail(field) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@(uab\.edu|uabmc\.edu)$/;
    if (!emailRegex.test(field.value)) {
        displayError(field, 'Enter a valid UAB or UABMC email address.');
    }
}

function displayError(field, message) {
    const errorElement = document.getElementById(`${field.id}-error`);
    errorElement.innerText = message;
    errorElement.style.display = 'block';
}

function clearError(field) {
    const errorElement = document.getElementById(`${field.id}-error`);
    errorElement.style.display = 'none';
}
