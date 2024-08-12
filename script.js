document.addEventListener('DOMContentLoaded', function() {
    addEventListeners();
    validateAllRequiredFields(); 
    selectVersion('standard'); 
    selectDepartment('dopm'); 
    displayVersion(); 
});

function addEventListeners() {
    const elements = [
        'name', 'credentials', 'title', 'room', 'street', 
        'city-state', 'zip', 'phone-office', 'phone-mobile', 
        'email', 'pronouns'
    ];

    elements.forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('input', () => {
            validateField(element);
            updatePreview();
        });
    });

    document.getElementById('phone-office-enable').addEventListener('change', updatePreview);
    document.getElementById('phone-office').addEventListener('input', updatePreview);

    document.getElementById('phone-mobile-enable').addEventListener('change', updatePreview);
    document.getElementById('phone-mobile').addEventListener('input', updatePreview);

    document.getElementById('btn-standard').addEventListener('click', () => selectVersion('standard'));
    document.getElementById('btn-abbreviated').addEventListener('click', () => selectVersion('abbreviated'));

    document.getElementById('btn-dopm').addEventListener('click', () => selectDepartment('dopm'));
    document.getElementById('btn-gim').addEventListener('click', () => selectDepartment('gim'));
    document.getElementById('btn-gimpop').addEventListener('click', () => selectDepartment('gimpop'));

    document.getElementById('copy-button').addEventListener('click', copyToClipboard);
}

let currentVersion = 'standard';
let currentDepartment = 'dopm';

function selectVersion(version) {
    currentVersion = version;
    document.getElementById('btn-standard').classList.toggle('active', version === 'standard');
    document.getElementById('btn-abbreviated').classList.toggle('active', version === 'abbreviated');
    updatePreview();
}

function selectDepartment(department) {
    currentDepartment = department;
    document.getElementById('btn-dopm').classList.toggle('active', department === 'dopm');
    document.getElementById('btn-gim').classList.toggle('active', department === 'gim');
    document.getElementById('btn-gimpop').classList.toggle('active', department === 'gimpop');
    updatePreview();
}

function updatePreview() {
    const name = document.getElementById('name').value || document.getElementById('name').placeholder;
    const credentials = document.getElementById('credentials').value ? `, ${document.getElementById('credentials').value}` : '';
    const title = document.getElementById('title').value || document.getElementById('title').placeholder;
    const room = document.getElementById('room').value || document.getElementById('room').placeholder;
    const street = document.getElementById('street').value || document.getElementById('street').placeholder;
    const cityState = document.getElementById('city-state').value || document.getElementById('city-state').placeholder;
    const zip = document.getElementById('zip').value || document.getElementById('zip').placeholder;
    const fullAddress = `${room} | ${street} | ${cityState} ${zip}`;

    const phoneOfficeEnabled = document.getElementById('phone-office-enable').checked;
    const phoneMobileEnabled = document.getElementById('phone-mobile-enable').checked;

    const phoneOffice = phoneOfficeEnabled ? formatPhoneNumber(document.getElementById('phone-office').value) : '';
    const phoneMobile = phoneMobileEnabled ? formatPhoneNumber(document.getElementById('phone-mobile').value) : '';
    const email = document.getElementById('email').value || document.getElementById('email').placeholder;
    const pronouns = document.getElementById('pronouns').value ? `Pronouns: ${document.getElementById('pronouns').value}` : '';

    const contactInfo = generateContactInfo(phoneOffice, phoneMobile, email);

    let division, url;
    if (currentDepartment === 'dopm') {
        division = 'Division of Preventive Medicine';
        url = 'https://uab.edu/dopm/';
    } else if (currentDepartment === 'gim') {
        division = 'Division of General Internal Medicine';
        url = 'https://uab.edu/gim/';
    } else if (currentDepartment === 'gimpop') {
        division = 'Division of General Internal Medicine & Population Science';
        url = 'https://www.uab.edu/medicine/dom/';
    }

    let previewContent;

    if (currentVersion === 'standard') {
        previewContent = `
            <strong style="color: #002c17;">${name}${credentials} | ${title}</strong><br>
            Department of Medicine | Heersink School of Medicine<br>
            ${division}<br>
            UAB | The University of Alabama at Birmingham<br>
            ${fullAddress}<br>
            ${contactInfo}${pronouns ? `<br>${pronouns}` : ''}<br>
            <br><a href="${url}" target="_blank">${url}</a>
        `;
    } else {
        previewContent = `
            <strong style="color: #002c17;">${name}${credentials} | ${title}</strong><br>
            UAB | The University of Alabama at Birmingham<br>
            ${contactInfo}${pronouns ? `<br>${pronouns}` : ''}<br>
            <br><a href="${url}" target="_blank">${url}</a>
        `;
    }

    document.getElementById('signature-preview').innerHTML = previewContent.trim();
}

function generateContactInfo(phoneOffice, phoneMobile, email) {
    let contactInfo = '';

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

function formatPhoneNumber(phoneNumber) {
    if (!phoneNumber) return '';
    phoneNumber = phoneNumber.replace(/\D/g, '');
    if (phoneNumber.length === 7) {
        phoneNumber = '205' + phoneNumber;
    }
    if (phoneNumber.length === 10) {
        return `${phoneNumber.substring(0, 3)}.${phoneNumber.substring(3, 6)}.${phoneNumber.substring(6)}`;
    }
    return phoneNumber;
}

function copyToClipboard() {
    // Create a temporary element to hold the HTML content
    const tempElement = document.createElement('div');
    tempElement.innerHTML = `
        <div style="font-size: 12px; line-height: 1.0; font-family: 'Proxima Nova', Arial, sans-serif; background-color: transparent; color: black;">
            <strong style="color: #1E6B52;">${document.getElementById('signature-preview').innerHTML.split('<br>')[0]}</strong><br>
            ${document.getElementById('signature-preview').innerHTML.split('<br>').slice(1).join('<br>')}
        </div>
    `;

    // Append the element to the body
    document.body.appendChild(tempElement);

    // Select the content
    const range = document.createRange();
    range.selectNodeContents(tempElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        // Execute the copy command
        document.execCommand('copy');
        const copySuccess = document.getElementById('copy-success');
        copySuccess.innerText = 'Signature copied to clipboard!';
        copySuccess.style.display = 'block';

        setTimeout(() => {
            copySuccess.style.display = 'none';
        }, 3000);
    } catch (err) {
        console.error('Failed to copy signature: ', err);
    }

    // Clean up by removing the temporary element
    selection.removeAllRanges();
    document.body.removeChild(tempElement);
}

function downloadRTF() {
    // Capture the current content of the preview
    const signaturePreview = document.getElementById('signature-preview').innerHTML;

    // Convert HTML to RTF format manually and ensure no leading spaces
    const rtfContent = `{\\rtf1\\ansi\\deff0
    {\\colortbl ;\\red30\\green107\\blue82;}
    {\\fonttbl {\\f0 Arial;}}
    \\fs24
    ${signaturePreview
        .replace(/<br>/g, '\\line ')  // Replace <br> tags with RTF line breaks
        .replace(/<strong style="color: #002c17;">(.*?)<\/strong>/g, '{\\b\\cf1 $1}') // Convert bold green text
        .replace(/<a href="mailto:(.*?)">(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "mailto:$1"}}{\\fldrslt $2}}') // Convert email links
        .replace(/<a href="(.*?)"(.*?)>(.*?)<\/a>/g, '{\\field{\\*\\fldinst{HYPERLINK "$1"}}{\\fldrslt $3}}') // Convert other links
        .replace(/<\/?[^>]+(>|$)/g, '') // Remove any other HTML tags
        .replace(/^\s+/gm, '') // Remove leading spaces from each line
    }
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

function displayVersion() {
    const versionElement = document.getElementById('version-number');
    versionElement.innerText = 'Version 1.5.0';
}

addEventListeners();
