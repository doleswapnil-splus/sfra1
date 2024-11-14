'use strict';

$(document).ready(function () {
    $('.add-to-wishlist').on('click', function (e) {
        e.preventDefault();
        var productId = $(this).data('product-id');

        $.ajax({
            url: $(this).attr('data-url'),
            type: 'POST',
            data: { productId: productId },
            success: function (response) {
                if (response.success) {
                    window.location.href = response.redirectUrl;
                } else {
                    alert('Failed to add product to wishlist.');
                }
            },
            error: function () {
                alert('An error occurred while adding the product to the wishlist.');
            }
        });
    });
});
