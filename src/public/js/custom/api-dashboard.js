$(document).ready(function() {

    // regenerate api key button/modal
    $('#regenerateTokenModalSubmitButton').click(() => {
        $('#tokenForm').submit();
    });

    // copy token to clipboard
    $('#copyTokenButton').click(() => {
        navigator.clipboard.writeText($('#tokenFormInput').val()).then(() => {
            $('#copyTokenButton').text('Copied!');
            setTimeout(() => {
                $('#copyTokenButton').html('<i class="fa fa-copy"></i>');
            }, 2000);
        });
    });

});