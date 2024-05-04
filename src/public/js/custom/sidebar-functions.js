jQuery(function($){
    // Get current path and find target link
    let path = window.location.pathname

    // Account for home page with empty path
    if (path === '') path = '/';

    // Find link on sidebar with the link
    const target = $('a[href="'+path+'"]');

    // In a dropdown, set parent and item to active and expand
    if (target.parent().hasClass('collapse-inner')) {
        target.addClass('active');
        target.parent().parent().parent().addClass('active');
        target.parent().parent().parent().find('.nav-link').removeClass('collapsed');
        target.parent().parent().addClass('show');
    } else

    // Add active class to regular nav item
    if (target.parent().hasClass('nav-item')) target.parent().addClass('active');
        // else dashboard item gets active
        else target.addClass('active');

    // if the pwa is installed, add the notifications link
    if (window.navigator.standalone) {
        $('#notificationsNavLink').removeAttr('hidden');
    }
});