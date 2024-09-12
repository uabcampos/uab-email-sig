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

    const signaturePreview = `
        <strong style="color: #1E6B52;">${name}${credentials} | ${title}</strong><br>
        Department of Medicine | Heersink School of Medicine<br>
        Division of General Internal Medicine & Population Science<br>
        UAB | The University of Alabama at Birmingham<br>
        ${room} | ${street} | ${cityState} ${zip}<br>
        ${phoneLine ? `${phoneLine} | ` : ''}${email}${pronouns}<br><br>
        <a href="https://uab.edu/medicine/dom/" target="_blank">https://uab.edu/medicine/dom/</a>
    `;

    document.getElementById('signature-preview').innerHTML = signaturePreview;
}

// Call the updateSignaturePreview function on page load
window.onload = function() {
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
document.getElementById('btn-standard').addEventListener('click', function() {
    updateSignaturePreview(); // Standard version click handler
    document.getElementById('btn-standard').classList.add('active');
    document.getElementById('btn-abbreviated').classList.remove('active');
});
document.getElementById('btn-abbreviated').addEventListener('click', function() {
    updateSignaturePreview(); // Abbreviated version click handler
    document.getElementById('btn-abbreviated').classList.add('active');
    document.getElementById('btn-standard').classList.remove('active');
});
