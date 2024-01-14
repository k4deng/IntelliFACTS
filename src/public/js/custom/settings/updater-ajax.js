$(document).ready(function($) {

    function updaterEnabledCheck(checked) {
        var ele = $('input[id="updaterEnabled"]')
        if (ele.is(':checked')) {
            document.getElementById("allSettings").style.display = "";
        } else {
            document.getElementById("allSettings").style.display = "none";
        }
    }

    updaterEnabledCheck();

    $('input[id="updaterEnabled"]').on('change', () => {
        updaterEnabledCheck();
    });

    async function submitForm(data){
        var Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

        try {
            const response = await fetch('', {
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

    $('#updaterSettingsForm').on('submit', async (event) => {
        event.preventDefault();

        const infoCheckboxesArray = [];
        $('input[name="checkedElements-info"]:checked').each((num, input) => {
            infoCheckboxesArray.push(input.value);
        });

        const dataCheckboxesArray = [];
        $('input[name="checkedElements-data"]:checked').each((num, input) => {
            dataCheckboxesArray.push(input.value);
        });

        await submitForm({
            userId: document.getElementById('updater-ajax.js').getAttribute('user'),
            data: {
                enabled: $('input[id="updaterEnabled"]').is(':checked'),
                checkedElements: {
                    info: infoCheckboxesArray,
                    data: dataCheckboxesArray
                }
            }
        });

    });



});