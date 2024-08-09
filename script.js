document.getElementById('name').addEventListener('input', function() {
    document.getElementById('preview-name').innerText = this.value;
});

document.getElementById('credentials').addEventListener('input', function() {
    document.getElementById('preview-credentials').innerText = this.value;
});

document.getElementById('title').addEventListener('input', function() {
    document.getElementById('preview-title').innerText = this.value;
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
