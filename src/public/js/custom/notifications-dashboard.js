const VAPID_PUBLIC_KEY = document.getElementById('notifications-dashboard.js').getAttribute('vapidKey');

async function initServiceWorker() {
    let swRegistration = await navigator.serviceWorker.register('https://intellifactsdev.k4deng.net/serviceworker.js', { scope: '/' });
    let pushManager = swRegistration.pushManager;

    if (!isPushManagerActive(pushManager)) return;

    let permissionState = await pushManager.permissionState({userVisibleOnly: true});
    switch (permissionState) {
        case 'prompt':
            break;
        case 'granted':
            document.getElementById('subscribe_btn').style.display = 'none';
            document.getElementById('text_block').innerHTML = 'You are subscribed to notifications!';
            break;
        case 'denied':
            document.getElementById('subscribe_btn').style.display = 'none';
            document.getElementById('text_block').innerHTML = 'You denied push permission. Please enable it in your browser settings.';
    }
}

function isPushManagerActive(pushManager) {
    if (pushManager) return true;

    if (!window.navigator.standalone) document.getElementById('add-to-home-screen').style.display = 'block';
    else throw new Error('PushManager is not active');

    document.getElementById('subscribe_btn').style.display = 'none';
    return false;
}

async function sendDataToBackend(subscription){
    var Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });

    try {
        const response = await fetch('/notifications/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        const json = await response.json();

        Toast.fire({
            icon: json.status,
            title: json.message,
            position: 'bottom-left'
        })
    } catch (error) {
        Toast.fire({
            icon: 'error',
            title: error.message
        })
    }
}

async function subscribeToPush() {

    let swRegistration = await navigator.serviceWorker.getRegistration();
    let pushManager = swRegistration.pushManager;
    if (!isPushManagerActive(pushManager)) return;
    let subscriptionOptions = {
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY
    };
    try {
        let subscription = await pushManager.subscribe(subscriptionOptions);
        document.getElementById('subscribe_btn').style.display = 'none';
        document.getElementById('text_block').innerHTML = 'You are now subscribed to notifications!';

        // Send subscription to the server
        await sendDataToBackend(subscription);

    } catch (error) {
        document.getElementById('subscribe_btn').style.display = 'none';
        document.getElementById('text_block').style.display = 'block';
        document.getElementById('text_block').innerHTML = 'You denied push permission. Please enable it in your browser settings.';
    }
}

if (navigator.serviceWorker) {
    initServiceWorker()
    $('#subscribe_btn').on('click', async () => await subscribeToPush());
}