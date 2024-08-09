document.getElementById('name').addEventListener('input', function() {
    updatePreview();
});

document.getElementById('credentials').addEventListener('input', function() {
    updatePreview();
});

document.getElementById('title').addEventListener('input', function() {
    updatePreview();
});

document.getElementById('room').addEventListener('input', function() {
    document.getElementById('preview-room').innerText = this.value;
});

document.getElementById('street').addEventListener('input', function() {
    document.getElementById('preview-street').innerText = this.value;
});

document.getElementById('city-state').addEventListener('input', function() {
    document.getElementById('preview-city-state').innerText = this.value;
});

document.getElementById('zip').addEventListener('input', function() {
    document.getElementById('preview-zip').innerText = this.value;
});

document.getElementById('phone').addEventListener('input', function() {
    document.getElementById('preview-phone').innerText = this.value;
});

document.getElementById('email').addEventListener('input', function() {
    document.getElementById('preview-email').innerText = this.value;
});

function updatePreview() {
    const name = document.getElementById('name').value;
    const credentials = document.getElementById('credentials').value;
    const title = document.getElementById('title').value;

    document.getElementById('preview-name').innerText = name;
    document.getElementById('preview-credentials').innerText = credentials;
    document.getElementById('preview-title').innerText = title;

    if (name && credentials) {
        document.getElementById('preview-name').innerText = name + ', ' + credentials;
    } else if (name) {
        document.getElementById('preview-name').innerText = name;
    } else if (credentials) {
        document.getElementById('preview-name').innerText = credentials;
    }
}
