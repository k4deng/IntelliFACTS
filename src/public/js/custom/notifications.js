const VAPID_PUBLIC_KEY = document.getElementById('notifications.js').getAttribute('vapidKey');
const URL = document.getElementById('notifications.js').getAttribute('url');
let pushData = {}

$(document).ready(async () => {

    // ============================================= form =============================================

    async function updateSentElements(endpoint) {
        const response = await fetch('/notifications/getSentElements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: endpoint })
        });

        const json = await response.json();

        if (json.status === 'success') $('select[name="sentElements"]').val(json.data).trigger('change');
    }

    async function submitNewSentElements(data){
        var Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

        try {
            const response = await fetch('/notifications/setSentElements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
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

    $('form[id="notifications-form"]').on('submit', async (event) => {
        event.preventDefault();

        const sentElements = $('select[name="sentElements"] option:selected').map((num, option) => {
            return $(option).val();
        }).get();

        await submitNewSentElements({
            data: {
                endpoint: pushData.endpoint,
                sentElements: sentElements
            }
        });

    });

    //Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    // ============================================= Push Notifications =============================================

    function _editCard(showBtn, text, cardStyle, showElements = false) {
        document.getElementById('subscribe-btn').style.display = showBtn === true ? 'block' : 'none'
        document.getElementById('text-block').innerHTML = text;
        document.getElementById('status-card').classList.remove('border-left-primary');
        if (showElements === false) document.getElementById('status-card').classList.add(`border-left-${cardStyle}`);
        document.getElementById('elements-select').style.display = showElements === true ? 'block' : 'none';
        document.getElementById('main-card-header').style.display = showElements === true ? 'block' : 'none';
        document.getElementById('main-card-footer').style.display = showElements === true ? 'block' : 'none';
    }

    async function _sendDataToBackend(subscription){
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

    async function initServiceWorker() {
        let swRegistration = await navigator.serviceWorker.register(`${URL}/serviceworker.js`, { scope: '/' });
        let pushManager = swRegistration.pushManager;

        if (!isPushManagerActive(pushManager)) return;

        let permissionState = await pushManager.permissionState({userVisibleOnly: true});
        switch (permissionState) {
            case 'prompt':
                break;
            case 'granted':
                _editCard(false, 'Select elements to be sent to this device', 'success', true)
                pushData = await pushManager.getSubscription();
                await updateSentElements(pushData.endpoint)
                break;
            case 'denied':
                _editCard(false, 'You denied push permission. Please enable it in your browser settings.', 'danger');
                break;
        }
    }

    function isPushManagerActive(pushManager) {
        if (pushManager) return true;

        if (window.navigator.standalone) _editCard(false, 'For WebPush work you may need to add this website to Home Screen at your iPhone or iPad.', 'warning');
        else throw new Error('PushManager is not active');

        return false;
    }

    async function subscribeToPush() {

        const swRegistration = await navigator.serviceWorker.getRegistration();
        const pushManager = swRegistration.pushManager;
        if (!isPushManagerActive(pushManager)) return;
        const subscriptionOptions = {
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY
        };
        try {
            pushData = await pushManager.subscribe(subscriptionOptions);
            _editCard(false, 'Select elements to be sent to this device', 'success', true)

            // Send subscription to the server
            await _sendDataToBackend(pushData);
            await updateSentElements(pushData.endpoint)
        } catch (error) {
            _editCard(false, 'You denied push permission. Please enable it in your browser settings.', 'danger');
        }
    }

    if (navigator.serviceWorker) {
        initServiceWorker()
        $('#subscribe-btn').on('click', async () => await subscribeToPush());
    }

    // ============================================= changes card w/ pagination =============================================

    const waitForEl = (selector, callback) => {
        if (jQuery(selector).length) {
            callback();
        } else {
            setTimeout(function() {
                waitForEl(selector, callback);
            }, 100);
        }
    };

    async function getItems(page, limit) {
        const response = await fetch(`/notifications/get?dummy=true${page ? '&page='+page : ''}${limit ? '&limit='+limit : ''}`);
        const data = await response.json();
        return data;
    }

    const clearFormatting = (str) => str.split('*').join('').split('`').join('');
    const formatDate = (date) => moment(date).tz(Intl.DateTimeFormat().resolvedOptions().timeZone).format('MM/DD/YYYY hh:mm A');;

    const allUrlParams = new URLSearchParams(window.location.search);
    const urlParams = {
        type: allUrlParams?.get('type'),
        title: allUrlParams?.get('title'),
        body: allUrlParams?.get('body'),
    };

    const { data: { totalPages } } = await getItems(1, 10)

    let $pagination = $('.pagination');
    const defaultOpts = {
        totalPages: totalPages,
        visiblePages: totalPages < 14 ? 5 : 7,
        prev: '<span aria-hidden="true">&lsaquo;</span>',
        first: '<span aria-hidden="true">&laquo;</span>',
        last: '<span aria-hidden="true">&raquo;</span>',
        next: '<span aria-hidden="true">&rsaquo;</span>',
        onPageClick: async (event, page) => {
            let html = '';
            const pageItems = await getItems(page, 10);

            for (const change of pageItems.data.changes) {
                let style = 'primary'
                if (change.class === 'info_changes') {
                    if (change.data[0].title === urlParams.title && clearFormatting(change.data[0].description) === urlParams.body) style = 'warning';
                    html += `<div class="card border-left-${style} h-100 my-2 col-lg-8">
                            <div class="card-body">
                                <div class="text-xs font-weight-bold text-secondary text-uppercase">${formatDate(change.time)}</div>                 
                                <div class="font-weight-bold text-${style} text-uppercase my-1">${change.data[0].title}</div>
                                <strong class="mb-0">${clearFormatting(change.data[0].description)}</strong>
                            </div>
                        </div>`;
                } else {
                    for (const item of change.data) {
                        if (clearFormatting(item.title) === urlParams.title && clearFormatting(item.description) === urlParams.body) style = 'warning';
                    }
                    html += `<div class="card border-left-${style} h-100 my-2 col-lg-10">
                            <div class="card-body">  
                                <div class="text-xs font-weight-bold text-secondary text-uppercase">${formatDate(change.time)}</div>                 
                                <div class="font-weight-bold text-${style} text-uppercase my-1">${change.class}</div>`
                                for (const item of change.data) { html += `
                                    <div class="">
                                        <strong>${clearFormatting(item.title)}</strong>
                                        <p class="text-muted mb-0">${clearFormatting(item.description)}</p>
                                    </div>`
                                } html += `
                                
                            </div>
                        </div>`;
                }
            };
            $('#page-content').html(html);
        }
    }

    if (totalPages !== 0) {
        $pagination.twbsPagination(defaultOpts)
        $('.paginationcard').show()
    }

    if (urlParams.title) {
        waitForEl('.card .border-left-warning', () => {
            $('html, body').animate({
                scrollTop: $('.card .border-left-warning').offset().top - 65
            }, 1000);
        });
    }


})