function validateCityState(field) {
    const errorMessage = document.getElementById('city-state-error');
    const cityStateRegex = /^[a-zA-Z\s]+,\s*[A-Z]{2}$/;

    if (!field.value) {
        errorMessage.innerText = 'City and state are required.';
        errorMessage.style.display = 'block';
    } else if (!cityStateRegex.test(field.value)) {
        errorMessage.innerText = 'Enter a valid City, ST format (e.g., Birmingham, AL).';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }
}

function validateZipCode(field) {
    const errorMessage = document.getElementById('zip-error');
    const zipCodeRegex = /^\d{5}(-\d{4})?$/;

    if (!zipCodeRegex.test(field.value)) {
        errorMessage.innerText = 'Enter a valid ZIP code (e.g., 35294 or 35294-4410).';
        errorMessage.style.display = 'block';
    } else {
        errorMessage.style.display = 'none';
    }

    if (field.value.length === 9 && !field.value.includes('-')) {
        field.value = field.value.replace(/(\d{5})(\d{4})/, '$1-$2');
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
