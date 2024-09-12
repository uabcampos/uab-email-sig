// Function to update the signature preview based on the form values
function updateSignaturePreview() {
    const name = document.getElementById('name').value || 'John Doe';
    const credentials = document.getElementById('credentials').value ? ', ' + document.getElementById('credentials').value : '';
    const title = document.getElementById('title').value || 'Program Director II';
    const room = document.getElementById('room').value || 'MT634';
    const street = document.getElementById('street').value || '1717 11th Avenue South';
    const cityState = document.getElementById('city-state').value || 'Birmingham, AL';
    const zip = document.getElementById('zip').value || '35294-4410';
    const email = document.getElementById('email').value || 'johndoe@uabmc.edu';
    const pronouns = document.getElementById('pronouns').value ? '<br>Pronouns: ' + document.getElementById('pronouns').value : '';
    const officePhoneEnabled = document.getElementById('phone-office-enable').checked;
    const officePhone = document.getElementById('phone-office').value || '205.975.7908';
    const mobilePhoneEnabled = document.getElementById('phone-mobile-enable').checked;
    const mobilePhone = document.getElementById('phone-mobile').value || '205.555.1234';
    let phoneLine = '';

    if (officePhoneEnabled && mobilePhoneEnabled) {
        phoneLine = `O: ${officePhone}, M: ${mobilePhone}`;
    } else if (officePhoneEnabled) {
        phoneLine = `O: ${officePhone}`;
    } else if (mobilePhoneEnabled) {
        phoneLine = `M: ${mobilePhone}`;
    }

    const isStandardVersion = document.getElementById('btn-standard').classList.contains('active');

    let signaturePreview = '';

    if (isStandardVersion) {
        signaturePreview = `
            <strong style="color: #1E6B52;">${name}${credentials} | ${title}</strong><br>
            Department of Medicine | Heersink School of Medicine<br>
            Division of General Internal Medicine & Population Science<br>
            UAB | The University of Alabama at Birmingham<br>
            ${room} | ${street} | ${cityState} ${zip}<br>
            ${phoneLine ? `${phoneLine} | ` : ''}${email}${pronouns}<br><br>
            <a href="https://uab.edu/medicine/dom/" target="_blank">https://uab.edu/medicine/dom/</a>
        `;
    } else {
        signaturePreview = `
            <strong style="color: #1E6B52;">${name}${credentials} | ${title}</strong><br>
            UAB | The University of Alabama at Birmingham<br>
            ${phoneLine ? `${phoneLine} | ` : ''}${email}${pronouns}<br><br>
            <a href="https://uab.edu/medicine/dom/" target="_blank">https://uab.edu/medicine/dom/</a>
        `;
    }

    document.getElementById('signature-preview').innerHTML = signaturePreview;
}

// Function to validate the form and update the preview
function validateAndUpdatePreview() {
    // Validate all required fields before generating the preview
    validateAllRequiredFields(); // Call the validateAllRequiredFields function from validation.js
    updateSignaturePreview(); // If validation passes, update the preview
}

// Add event listeners for form inputs to validate them as the user types
document.getElementById('name').addEventListener('input', () => validateField(document.getElementById('name')));
document.getElementById('credentials').addEventListener('input', () => validateField(document.getElementById('credentials')));
document.getElementById('title').addEventListener('input', () => validateField(document.getElementById('title')));
document.getElementById('room').addEventListener('input', () => validateField(document.getElementById('room')));
document.getElementById('street').addEventListener('input', () => validateField(document.getElementById('street')));
document.getElementById('city-state').addEventListener('input', () => validateField(document.getElementById('city-state')));
document.getElementById('zip').addEventListener('input', () => validateField(document.getElementById('zip')));
document.getElementById('email').addEventListener('input', () => validateField(document.getElementById('email')));
document.getElementById('phone-office').addEventListener('input', () => validateField(document.getElementById('phone-office')));
document.getElementById('phone-mobile').addEventListener('input', () => validateField(document.getElementById('phone-mobile')));

// Toggle between Standard and Abbreviated versions
document.getElementById('btn-standard').addEventListener('click', function() {
    document.getElementById('btn-standard').classList.add('active');
    document.getElementById('btn-abbreviated').classList.remove('active');
    validateAndUpdatePreview(); // Validate and update preview on standard version selection
});

document.getElementById('btn-abbreviated').addEventListener('click', function() {
    document.getElementById('btn-abbreviated').classList.add('active');
    document.getElementById('btn-standard').classList.remove('active');
    validateAndUpdatePreview(); // Validate and update preview on abbreviated version selection
});

// Call validateAndUpdatePreview on page load
window.onload = function() {
    document.getElementById('btn-standard').classList.add('active');
    validateAndUpdatePreview(); // Validate fields and show the standard version by default on load
};

// Function to copy the signature to clipboard
function copyToClipboard() {
    const signaturePreview = document.getElementById('signature-preview').innerHTML;
    const tempElement = document.createElement('div');
    tempElement.innerHTML = `
        <div style="font-size: 12px; line-height: 1.0; font-family: 'Proxima Nova', Arial, sans-serif;">
            ${signaturePreview}
        </div>
    `;
    document.body.appendChild(tempElement);

    const range = document.createRange();
    range.selectNodeContents(tempElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');
        document.getElementById('copy-success').style.display = 'block';
        setTimeout(() => {
            document.getElementById('copy-success').style.display = 'none';
        }, 3000);
    } catch (err) {
        console.error('Failed to copy signature: ', err);
    }

    selection.removeAllRanges();
    document.body.removeChild(tempElement);
}

document.getElementById('copy-button').addEventListener('click', copyToClipboard);

// Function to download the signature as an RTF file
function downloadRTF() {
    let signaturePreview = document.getElementById('signature-preview').innerHTML;

    // Split the signature content by <br> tags to handle each line
    let lines = signaturePreview.split('<br>');

    // Fix the first line (name and title) by removing any leading spaces and converting HTML to RTF
    let firstLine = lines[0]
        .replace(/^\s+/g, '')  // Remove leading spaces
        .replace(/<strong style="color: #1E6B52;">(.*?)<\/strong>/g, '{\\b\\cf1 $1}')  // Make bold and green
        .replace(/&amp;/g, '&');  // Replace &amp; with &

    // Handle the rest of the lines, removing leading spaces, stripping HTML tags, and converting links
    let restOfLines = lines.slice(1).map(line => 
        line.replace(/^\s+/g, '')  // Remove any leading spaces
            .replace(/&amp;/g, '&')  // Replace &amp; with &
            .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')  // Convert mailto links
            .replace(/<a href="(.*?)"(.*?)>(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $3}}')  // Convert regular links
            .replace(/<\/?[^>]+(>|$)/g, '')  // Remove any remaining HTML tags
    ).join('\\line ');

    // Add a blank line before the signature content to fix indenting
    const rtfContent = `{\\rtf1\\ansi\\deff0
    {\\colortbl ;\\red30\\green107\\blue82;}
    {\\fonttbl {\\f0 Arial;}}
    \\fs24
    \\line
    ${firstLine}\\line ${restOfLines}
    }`;

    // Create a blob and download the RTF file
    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'signature.rtf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('download-button').addEventListener('click', downloadRTF);
