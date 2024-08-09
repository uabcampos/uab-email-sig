document.getElementById('name').addEventListener('input', function() {
    document.getElementById('preview-name').innerText = this.value;
});

document.getElementById('title').addEventListener('input', function() {
    document.getElementById('preview-title').innerText = this.value;
});

document.getElementById('location').addEventListener('input', function() {
    document.getElementById('preview-location').innerText = this.value;
});

document.getElementById('phone').addEventListener('input', function() {
    document.getElementById('preview-phone').innerText = this.value;
});

document.getElementById('email').addEventListener('input', function() {
    document.getElementById('preview-email').innerText = this.value;
});