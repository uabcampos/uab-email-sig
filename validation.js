// validation.js

// Validate a single field and show/hide error messages
function validateField(field) {
  clearError(field);

  // Required check
  if (field.hasAttribute('required') && !field.value.trim()) {
    displayError(field, 'This field is required.');
    return false;
  }

  // Field‐specific checks
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

// Clear an existing error message
function clearError(field) {
  const err = document.getElementById(`${field.id}-error`);
  if (err) {
    err.innerText = '';
    err.style.display = 'none';
  }
}

// Show an error message under a field
function displayError(field, message) {
  const err = document.getElementById(`${field.id}-error`);
  if (err) {
    err.innerText = message;
    err.style.display = 'block';
  }
}

// Validate "City, ST"
function validateCityState(field) {
  const re = /^[a-zA-Z\s]+,\s*[A-Z]{2}$/;
  if (!re.test(field.value.trim())) {
    displayError(field, 'Enter a valid City, ST (e.g., Birmingham, AL).');
    return false;
  }
  return true;
}

// Validate ZIP code
function validateZipCode(field) {
  const re = /^\d{5}(-\d{4})?$/;
  if (!re.test(field.value.trim())) {
    displayError(field, 'Enter a valid ZIP code (35294 or 35294-4410).');
    return false;
  }
  return true;
}

// Validate UAB/UABMC email
function validateEmail(field) {
  const re = /^[a-zA-Z0-9._%+-]+@(uab\.edu|uabmc\.edu)$/;
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

// Validate all required & enabled fields; return overall validity
function validateAllRequiredFields() {
  let allValid = true;

  // Required inputs
  const requiredFields = document.querySelectorAll('[required]');
  requiredFields.forEach(f => {
    const ok = validateField(f);
    if (!ok) allValid = false;
  });

  // Phone fields only if enabled
  ['phone-office', 'phone-mobile'].forEach(id => {
    const cb = document.getElementById(`${id}-enable`);
    const fld = document.getElementById(id);
    if (cb && cb.checked) {
      const ok = validatePhoneNumber(fld);
      if (!ok) allValid = false;
    } else {
      clearError(fld);
    }
  });

  return allValid;
}

// Attach blur listeners to validate as the user types/leaves fields
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('blur', () => validateField(input));
  });
});
