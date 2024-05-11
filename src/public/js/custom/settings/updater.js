$(document).ready(function($) {

    function updaterEnabledCheck(checked) {
        var ele = $('input[id="updaterEnabled"]')
        if (ele.is(':checked')) {
            $('div[id="updaterEnabledShowHide"]').show();
        } else {
            $('div[id="updaterEnabledShowHide"]').hide();
        }
    }

    updaterEnabledCheck();

    $('input[id="updaterEnabled"]').on('change', () => {
        updaterEnabledCheck();
    });

    async function submitUpdaterForm(data){
        var Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

        try {
            const response = await fetch('/settings/updater', {
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

    $('form[id="updaterSettingsForm"]').on('submit', async (event) => {
        event.preventDefault();

        let notifications = [];
        $('div #discordNotifications').each((index, element) => {
            const sentElements = $(element).find('select[name="sentElements"] option:selected').map((num, option) => {
                return $(option).val();
            }).get();

            notifications.push({
                channelId: $(element).attr('name'),
                sentElements: sentElements,
                style: $(element).find('select[name="messageStyle"] option:selected').val()
            });
        });

        await submitUpdaterForm({
            data: {
                enabled: $('input[id="updaterEnabled"]').is(':checked'),
                notifications: notifications
            }
        });

    });

});