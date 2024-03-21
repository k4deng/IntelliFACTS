const cachedDistrictCode = localStorage.getItem('RWADID');
if (cachedDistrictCode) {
    document.getElementById('rw-district-code').value = cachedDistrictCode;
}

const cachedUsername = localStorage.getItem('RWAUID');
if (cachedUsername) {
    document.getElementById('rw-username').value = cachedUsername;
}

document.querySelector('form').addEventListener('submit', function (e) {
    const newDistrictCode = document.getElementById('rw-district-code').value;
    if (newDistrictCode) localStorage.setItem('RWADID', newDistrictCode);
    const newUsername = document.getElementById('rw-username').value;
    if (newUsername) localStorage.setItem('RWAUID', newUsername);
});