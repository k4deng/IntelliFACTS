const emailData = document.getElementById('home.js').getAttribute('email');
const email = emailData.split('').reverse().join('');

document.getElementById("emailfill").innerHTML = `<a href="mailto:${email}">${email}</a>`;

// add as pwa popup
// https://github.com/philfung/add-to-homescreen
window.addEventListener('load', function () {
    window.AddToHomeScreenInstance = new window.AddToHomeScreen({
        appName: document.getElementById('home.js').getAttribute('name'),
        appIconUrl: '/public/favicon/android-chrome-512x512.png',
        assetUrl: '/public/vendor/add-to-homescreen/assets/img/',
        showErrorMessageForUnsupportedBrowsers: window.AddToHomeScreen.SHOW_ERRMSG_UNSUPPORTED.MOBILE,
        allowUserToCloseModal: true,
        maxModalDisplayCount: -1
    });
    window.AddToHomeScreenInstance.show('en');
});
