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
        // Standard version of the signature
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
        // Abbreviated version of the signature
        signaturePreview = `
            <strong style="color: #1E6B52;">${name}${credentials} | ${title}</strong><br>
            UAB | The University of Alabama at Birmingham<br>
            ${phoneLine ? `${phoneLine} | ` : ''}${email}${pronouns}<br><br>
            <a href="https://uab.edu/medicine/dom/" target="_blank">https://uab.edu/medicine/dom/</a>
        `;
    }

    document.getElementById('signature-preview').innerHTML = signaturePreview;
}

// Call the updateSignaturePreview function on page load
window.onload = function() {
    // Set the standard version active by default
    document.getElementById('btn-standard').classList.add('active');
    updateSignaturePreview(); // Show the standard version by default
};

// Event listeners for form changes to update the preview
document.getElementById('name').addEventListener('input', updateSignaturePreview);
document.getElementById('credentials').addEventListener('input', updateSignaturePreview);
document.getElementById('title').addEventListener('input', updateSignaturePreview);
document.getElementById('room').addEventListener('input', updateSignaturePreview);
document.getElementById('street').addEventListener('input', updateSignaturePreview);
document.getElementById('city-state').addEventListener('input', updateSignaturePreview);
document.getElementById('zip').addEventListener('input', updateSignaturePreview);
document.getElementById('email').addEventListener('input', updateSignaturePreview);
document.getElementById('pronouns').addEventListener('input', updateSignaturePreview);
document.getElementById('phone-office').addEventListener('input', updateSignaturePreview);
document.getElementById('phone-mobile').addEventListener('input', updateSignaturePreview);
document.getElementById('phone-office-enable').addEventListener('change', updateSignaturePreview);
document.getElementById('phone-mobile-enable').addEventListener('change', updateSignaturePreview);

// Event listener for version buttons
document.getElementById('btn-standard').addEventListener('click', function() {
    document.getElementById('btn-standard').classList.add('active');
    document.getElementById('btn-abbreviated').classList.remove('active');
    updateSignaturePreview(); // Update preview when standard version is selected
});
document.getElementById('btn-abbreviated').addEventListener('click', function() {
    document.getElementById('btn-abbreviated').classList.add('active');
    document.getElementById('btn-standard').classList.remove('active');
    updateSignaturePreview(); // Update preview when abbreviated version is selected
});

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

    // Add a blank line before the first line to fix the indenting issue
    let lines = signaturePreview.split('<br>');
    let firstLine = lines[0].replace(/<strong style="color: #1E6B52;">(.*?)<\/strong>/g, '{\\b\\cf1 $1}').trim();
    let restOfLines = lines.slice(1).map(line => 
        line.trim()
            .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}')
            .replace(/<a href="(.*?)"(.*?)>(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $3}}')
            .replace(/<\/?[^>]+(>|$)/g, '') // Remove any remaining HTML tags
    ).join('\\line ');

    // Add a blank line before the signature content to fix indenting
    const rtfContent = `{\\rtf1\\ansi\\deff0
    {\\colortbl ;\\red30\\green107\\blue82;}
    {\\fonttbl {\\f0 Arial;}}
    \\fs24
    \\line
    ${firstLine}\\line ${restOfLines}
    }`;

    const blob = new Blob([rtfContent], { type: 'application/rtf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'signature.rtf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('download-button').addEventListener('click', downloadRTF);
