$(document).ready(function($) {
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

    $('#form1').on('submit', async (event) => {
        event.preventDefault();

        await submitForm({
            name: 'John Doe',
            age: 30
        });

    });
});