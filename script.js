document.addEventListener('DOMContentLoaded', function() {
    addEventListeners();
    validateAllRequiredFields(); // Validate all required fields on page load
    selectVersion('standard'); // Default to the standard version on load
    displayVersion(); // Display the version number in the footer
});

// Function to add event listeners to form elements
function addEventListeners() {
    const elements = [
        'name', 'credentials', 'title', 'room', 'street', 
        'city-state', 'zip', 'phone-office', 'phone-mobile', 
        'email', 'pronouns'
    ];

    // Attach input event listeners to all form elements
    elements.forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('input', () => {
            validateField(element); // Validate the field as the user types
            updatePreview(); // Update the preview as the user types
        });
    });

    // Attach change event listeners for enabling/disabling phone numbers
    document.getElementById('phone-office-enable').addEventListener('change', updatePreview);
    document.getElementById('phone-office').addEventListener('input', updatePreview);

    document.getElementById('phone-mobile-enable').addEventListener('change', updatePreview);
    document.getElementById('phone-mobile').addEventListener('input', updatePreview);

    // Event listeners for switching between Standard and Abbreviated versions
    document.getElementById('btn-standard').addEventListener('click', () => selectVersion('standard'));
    document.getElementById('btn-abbreviated').addEventListener('click', () => selectVersion('abbreviated'));

    // Event listener for copying the signature to the clipboard
    document.getElementById('copy-button').addEventListener('click', copyToClipboard);
}

let currentVersion = 'standard';

// Function to validate all required fields on the page
function validateAllRequiredFields() {
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        validateField(field); // Validate each required field
    });
}

// Function to handle the version selection (standard/abbreviated)
function selectVersion(version) {
    currentVersion = version;
    const standardButton = document.getElementById('btn-standard');
    const abbreviatedButton = document.getElementById('btn-abbreviated');

    if (version === 'standard') {
        standardButton.classList.add('active');
        abbreviatedButton.classList.remove('active');
    } else {
        abbreviatedButton.classList.add('active');
        standardButton.classList.remove('active');
    }

    updatePreview(); // Update the preview immediately after selecting the version
}

// Function to update the signature preview based on form input
function updatePreview() {
    // Collect input values from all fields or use placeholders if empty
    const name = document.getElementById('name').value || document.getElementById('name').placeholder;
    const credentials = document.getElementById('credentials').value ? `, ${document.getElementById('credentials').value}` : '';
    const title = document.getElementById('title').value || document.getElementById('title').placeholder;
    const room = document.getElementById('room').value || document.getElementById('room').placeholder;
    const street = document.getElementById('street').value || document.getElementById('street').placeholder;
    const cityState = document.getElementById('city-state').value || document.getElementById('city-state').placeholder;
    const zip = document.getElementById('zip').value || document.getElementById('zip').placeholder;
    const fullAddress = `${room} | ${street} | ${cityState} ${zip}`;

    // Check if phone numbers are enabled and collect their values
    const phoneOfficeEnabled = document.getElementById('phone-office-enable').checked;
    const phoneMobileEnabled = document.getElementById('phone-mobile-enable').checked;

    const phoneOffice = phoneOfficeEnabled ? formatPhoneNumber(document.getElementById('phone-office').value) : '';
    const phoneMobile = phoneMobileEnabled ? formatPhoneNumber(document.getElementById('phone-mobile').value) : '';
    const email = document.getElementById('email').value || document.getElementById('email').placeholder;
    const pronouns = document.getElementById('pronouns').value ? `Pronouns: ${document.getElementById('pronouns').value}` : '';

    const contactInfo = generateContactInfo(phoneOffice, phoneMobile, email);

    let previewContent;

    // Build the signature preview content based on the selected version
    if (currentVersion === 'standard') {
        previewContent = `
            <div style="line-height: 1.5;">
                <strong style="color: #002c17;">${name}${credentials} | ${title}</strong><br>
                Department of Medicine | Heersink School of Medicine<br>
                Division of Preventive Medicine<br>
                UAB | The University of Alabama at Birmingham<br>
                ${fullAddress}<br>
                ${contactInfo}${pronouns ? `<br>${pronouns}` : ''}<br><br>
                <a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>
            </div>
        `;
    } else {
        previewContent = `
            <div style="line-height: 1.5;">
                <strong style="color: #002c17;">${name}${credentials} | ${title}</strong><br>
                UAB | The University of Alabama at Birmingham<br>
                ${contactInfo}${pronouns ? `<br>${pronouns}` : ''}<br><br>
                <a href="https://uab.edu/dopm/" target="_blank">https://uab.edu/dopm/</a>
            </div>
        `;
    }

    // Inject the generated HTML into the preview element
    document.getElementById('signature-preview').innerHTML = previewContent.trim();
}

// Function to generate contact information for the preview and clipboard
function generateContactInfo(phoneOffice, phoneMobile, email) {
    let contactInfo = '';

    // Format the contact information based on provided phone numbers and email
    if (phoneOffice && phoneMobile) {
        contactInfo = `O: ${phoneOffice}, M: ${phoneMobile} | <a href="mailto:${email}">${email}</a>`;
    } else if (phoneOffice) {
        contactInfo = `O: ${phoneOffice} | <a href="mailto:${email}">${email}</a>`;
    } else if (phoneMobile) {
        contactInfo = `M: ${phoneMobile} | <a href="mailto:${email}">${email}</a>`;
    } else {
        contactInfo = `<a href="mailto:${email}">${email}</a>`;
    }

    return contactInfo;
}

// Function to format phone numbers into ###.###.#### format
function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digit characters
    if (phoneNumber.length === 7) {
        phoneNumber = '205' + phoneNumber; // Assume default area code if not provided
    }
    if (phoneNumber.length === 10) {
        return `${phoneNumber.substring(0, 3)}.${phoneNumber.substring(3, 6)}.${phoneNumber.substring(6)}`;
    }
    return phoneNumber;
}

// Function to copy the signature preview to the clipboard
function copyToClipboard() {
    // Retrieve the inner HTML of the preview
    const signature = document.getElementById('signature-preview').innerHTML;

    // Create a temporary textarea element to copy the plain text version
    const tempElement = document.createElement('textarea');
    tempElement.style.position = 'fixed';
    tempElement.style.left = '-9999px';
    tempElement.style.top = '0';
    tempElement.value = signature.replace(/<br\s*[\/]?>/gi, '\n') // Replace <br> with newline
                               .replace(/<[^>]+>/g, ''); // Remove all HTML tags

    // Append the textarea to the document and select its content
    document.body.appendChild(tempElement);
    tempElement.select();
    document.execCommand('copy');
    document.body.removeChild(tempElement); // Remove the temporary element

    // Display success message after copying
    const copySuccess = document.getElementById('copy-success');
    copySuccess.innerText = 'Signature copied to clipboard!';
    copySuccess.style.display = 'block';

    // Hide the success message after 3 seconds
    setTimeout(() => {
        copySuccess.style.display = 'none';
    }, 3000);
}

// Function to display the current version number in the footer
function displayVersion() {
    const versionElement = document.getElementById('version-number');
    versionElement.innerText = 'Version 1.4.6'; // Update version number as needed
}

// Initialize event listeners and setup on page load
addEventListeners();
