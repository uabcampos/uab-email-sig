// validation.js

// Clear any existing error message and invalid styling
function clearError(field) {
  const err = document.getElementById(`${field.id}-error`);
  if (err) {
    err.textContent = '';
    err.style.display = 'none';
  }
  field.classList.remove('invalid');
}

// Show an error message and mark field invalid
function displayError(field, message) {
  const err = document.getElementById(`${field.id}-error`);
  if (err) {
    err.textContent = message;
    err.style.display = 'block';
  }
  field.classList.add('invalid');
}

// Validate City, State in "City, ST" format
function validateCityState(field) {
  const re = /^[a-zA-Z\s]+,\s*[A-Z]{2}$/;
  if (!re.test(field.value.trim())) {
    displayError(field, 'Enter a valid City, ST (e.g., Birmingham, AL).');
    return false;
  }
  return true;
}

// Validate ZIP as 5 or 5+4 digits
function validateZipCode(field) {
  const re = /^\d{5}(-\d{4})?$/;
  if (!re.test(field.value.trim())) {
    displayError(field, 'Enter a valid ZIP code (35294 or 35294-4410).');
    return false;
  }
  return true;
}

// Validate email must be @uab.edu or @uabmc.edu
function validateEmail(field) {
  const re = /^[A-Za-z0-9._%+-]+@(uab\.edu|uabmc\.edu)$/;
  if (!re.test(field.value.trim())) {
    displayError(field, 'Enter a valid UAB or UABMC email address.');
    return false;
  }
  return true;
}

// Validate phone as 7 or 10 digits
function validatePhoneNumber(field) {
  const digits = field.value.replace(/\D/g, '');
  if (!(digits.length === 7 || digits.length === 10)) {
    displayError(field, 'Enter a valid 7- or 10-digit phone number.');
    return false;
  }
  return true;
}

// Validate a single field and show/hide its error
// Returns true if valid, false otherwise
function validateField(field) {
  clearError(field);

  // Required check
  if (field.hasAttribute('required') && !field.value.trim()) {
    displayError(field, 'This field is required.');
    return false;
  }

  // Field-specific validations
  switch (field.id) {
    case 'city-state':
      return validateCityState(field);
    case 'zip':
      return validateZipCode(field);
    case 'email':
      return validateEmail(field);
    case 'phone-office':
    case 'phone-mobile':
      return validatePhoneNumber(field);
    default:
      return true;
  }
}

// Validate all required and enabled phone fields;
// Returns overall validity
function validateAllRequiredFields() {
  let allValid = true;

  // Required fields
  document.querySelectorAll('[required]').forEach(field => {
    if (!validateField(field)) allValid = false;
  });

  // Phone fields only if their checkbox is enabled
  ['phone-office', 'phone-mobile'].forEach(id => {
    const field = document.getElementById(id);
    const box   = document.getElementById(`${id}-enable`);
    if (box && box.checked) {
      if (!validatePhoneNumber(field)) allValid = false;
    } else if (field) {
      clearError(field);
    }
  });

  return allValid;
}

// Attach blur listeners for inline validation on all inputs
// Also run a full validation pass on page load to highlight empty/invalid fields immediately
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
  });

  // Immediately highlight any missing/invalid fields on load
  validateAllRequiredFields();
});
