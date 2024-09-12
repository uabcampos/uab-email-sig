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

    // Determine if the standard or abbreviated version is active
    const isStandardVersion = document.getElementById('btn-standard').classList.contains('active');

    let signaturePreview = '';

    if (isStandardVersion) {
        // Standard version with email
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
        // Abbreviated version without email
        signaturePreview = `
            <strong style="color: #1E6B52;">${name}${credentials} | ${title}</strong><br>
            UAB | The University of Alabama at Birmingham<br>
            ${phoneLine}${pronouns}<br><br>
            <a href="https://uab.edu/medicine/dom/" target="_blank">https://uab.edu/medicine/dom/</a>
        `;
    }

    document.getElementById('signature-preview').innerHTML = signaturePreview;
}

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

// Function to validate and update the preview
function validateAndUpdate(field) {
    validateField(field);  // Call validation for the field
    updateSignaturePreview();  // Update the signature preview immediately after validation
}

// Function to add both validation and preview listeners
function addValidationAndPreviewListeners() {
    document.getElementById('name').addEventListener('input', () => validateAndUpdate(document.getElementById('name')));
    document.getElementById('credentials').addEventListener('input', () => validateAndUpdate(document.getElementById('credentials')));
    document.getElementById('title').addEventListener('input', () => validateAndUpdate(document.getElementById('title')));
    document.getElementById('room').addEventListener('input', () => validateAndUpdate(document.getElementById('room')));
    document.getElementById('street').addEventListener('input', () => validateAndUpdate(document.getElementById('street')));
    document.getElementById('city-state').addEventListener('input', () => validateAndUpdate(document.getElementById('city-state')));
    document.getElementById('zip').addEventListener('input', () => validateAndUpdate(document.getElementById('zip')));
    document.getElementById('email').addEventListener('input', () => validateAndUpdate(document.getElementById('email')));
    document.getElementById('phone-office').addEventListener('input', () => validateAndUpdate(document.getElementById('phone-office')));
    document.getElementById('phone-mobile').addEventListener('input', () => validateAndUpdate(document.getElementById('phone-mobile')));
    document.getElementById('pronouns').addEventListener('input', () => validateAndUpdate(document.getElementById('pronouns')));

    // Also listen for changes in the enable checkboxes for phone numbers
    document.getElementById('phone-office-enable').addEventListener('change', updateSignaturePreview);
    document.getElementById('phone-mobile-enable').addEventListener('change', updateSignaturePreview);
}

// Function to download the signature as an RTF file
function downloadRTF() {
    let signaturePreview = document.getElementById('signature-preview').innerHTML;

    // Split the signature content by <br> tags to handle each line
    let lines = signaturePreview.split('<br>');

    // Part 1: Blank line at the top to separate signature from email body
    let part1 = '\\line ';  // This will be the blank line at the top

    // Part 2: Signature Block (all user information except the URL)
    let signatureBlock = lines.slice(0, -1).map(line => 
        line.replace(/^\s+/g, '')  // Remove any leading spaces
            .replace(/&amp;/g, '&')  // Replace &amp; with &
            .replace(/<strong style="color: #1E6B52;">(.*?)<\/strong>/g, '{\\b\\cf1 $1}')  // Convert to bold and green
            .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')  // Convert mailto links
            .replace(/<\/?[^>]+(>|$)/g, '')  // Remove remaining HTML tags
            .trim()  // Trim trailing/leading spaces
    ).filter(line => line !== '').join('\\line ');

    // Add a blank line after the signature block
    let part2 = `${signatureBlock}\\line `;  // Adds a blank line after the signature block

    // Part 3: URL Block (only the URL with a blank line before it)
    let part3 = lines[lines.length - 1]
        .replace(/^\s+/g, '')  // Remove any leading spaces
        .replace(/<a href="(.*?)"(.*?)>(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $3}}')  // Convert regular links
        .replace(/<\/?[^>]+(>|$)/g, '')  // Remove remaining HTML tags
        .trim();  // Trim trailing/leading spaces

    // Make sure there's exactly one blank line before the URL block
    part3 = `\\line ${part3}`;  // Ensures only one blank line before the URL block

    // Combine all parts (Part 1 + Part 2 + Part 3) without extra blank lines
    const rtfContent = `{\\rtf1\\ansi\\deff0
    {\\colortbl ;\\red30\\green107\\blue82;}
    {\\fonttbl {\\f0 Arial;}}
    \\fs24
    ${part1}${part2}${part3}
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

// Initialize listeners on page load
window.onload = function() {
    addValidationAndPreviewListeners();  // Add live preview listeners and validation listeners
    document.getElementById('btn-standard').classList.add('active');  // Default to standard version on load
    updateSignaturePreview();  // Update preview on page load
}
