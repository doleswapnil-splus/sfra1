
'use strict';
$(document).ready(function() {
    $('.ratings').on('click', function() {
        const productId = $(this).data('pid');
        const orderId = $(this).data('orderno');
        const email = $(this).data('email');
        $('#review').val('');
        $('#rating').val('');
        $('#submitReview').data({
            productid: productId,
            orderid: orderId,
            email: email
        });
    });
    $('#submitReview').on('click', function() {
        const productId = $(this).data('productid');
        const reviewText = $('#review').val();
        const rating = $('#rating').val();
        const orderId = $(this).data('orderid');
        const email = $(this).data('email');
        const form = {
            productId: productId,
            orderId: orderId,
            review: reviewText,
            rating: rating,
            email: email
        };
        $.ajax({
            url: window.submitReviewUrl,
            type: 'POST',
            dataType: 'json',
            data: form,
            success: function(response) {
                $('#ratingsModal').modal('hide');
                alert(response.success ? response.message : response.message);
            },
            error: function(xhr) {
                alert(window.properties.reviewErrorMessage + xhr.responseText);
            }
        });
    });
});
