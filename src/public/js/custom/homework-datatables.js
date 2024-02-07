// Call the dataTables jQuery plugin
$(document).ready(function() {
    $('.classGridData').children('p').css('font', 'inherit');
    $('.classGridData').children('p').children('span').css('font-family', 'inherit').css('font-size', 'inherit').css('color', 'inherit');
    $('.classGridData').children('p').children('span').children('span').css('font-family', 'inherit').css('font-size', 'inherit').css('color', 'inherit');

    $('#homeworkTable').DataTable({
        paging: false,
        info: false,
        searching: false
    });
});