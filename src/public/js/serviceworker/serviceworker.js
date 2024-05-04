self.addEventListener('push', (event) => {
    let pushData = event.data.json();

    self.registration.showNotification(pushData.title, pushData)
        .then(async () => {
            // set the badge to 1 as i cant increment it
            navigator.setAppBadge(1);
        });
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    clients.openWindow(event.notification.data.url)
        .then(async () => {
            //reset the app badge count
            await navigator.clearAppBadge();
        });
});

self.addEventListener('pushsubscriptionchange', (event) => {

});