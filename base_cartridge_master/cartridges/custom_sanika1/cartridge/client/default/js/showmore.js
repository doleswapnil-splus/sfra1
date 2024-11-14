'use strict';

$(document).ready(function() {
    $('#showMoreBtn').on('click', function() {
        var hiddenReviews = $('.hidden-reviews');

        if (hiddenReviews.is(':hidden')) {
            hiddenReviews.show();
            $(this).text('Show Less');
        } else {
            hiddenReviews.hide();
            $(this).text('Show More');
        }
    });
});