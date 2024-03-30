$(document).ready(function($) {

    //Initialize Select2 Elements
    $('.select2bs4').select2({
        theme: 'bootstrap4'
    })

    // fill help text with filtering type
    function updateFilteringTypeHelpText() {
        const filteringType = $('select[name="filteringType"]').val();
        $('span[id="filteringHelpType"]').text(filteringType)
    }
    updateFilteringTypeHelpText() // call on load
    $('select[name="filteringType"]').on('change', () => {
        updateFilteringTypeHelpText()
    });

    async function submitUserForm(data){
        var Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });

        try {
            const response = await fetch('/settings/user', {
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

    $('#userSettingsForm').on('submit', async (event) => {
        event.preventDefault();

        await submitUserForm({
            data: {
                classes: {
                    filteringType: $('select[name="filteringType"]').val(),
                    list: $('select[name="filteringList"]').val()
                }
            }
        });

    });
});