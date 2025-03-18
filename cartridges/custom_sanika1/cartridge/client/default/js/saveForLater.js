'use strict';

// $(document).ready(function () {
//     $('.save-for-later-btn').on('click', function () {
//         var productId = $(this).data('product-id');

//         $.ajax({
//             url:window.urls.SaveForLater,
//             type: 'POST',
//             data: { productId: productId },
//             success: function (response) {
//                 if (response.success) {
//                     alert(window.properties.saveForLaterMoved);
//                     location.reload();
//                 } else {
//                     alert(window.properties.saveForLaterMovedError);
//                 }
//             }
//         });
//     });
// });

$(document).ready(function () {
    $('.save-for-later-btn').on('click', function () {
        var productId = $(this).data('product-id');

        $.ajax({
            url: window.urls.SaveForLater, 
            type: 'POST',
            data: { productId: productId },
            success: function (response) {
                if (response.success) {
                    //alert(window.properties.saveForLaterMoved);

                    // Update the product card section
                    $('#cart-items-container').html(response.updatedProductCards);

                    // Update the checkout section
                    $('.grand-total').html(response.updatedGrandTotal);
                    alert(window.properties.saveForLaterMoved);
                } else {
                    alert(window.properties.saveForLaterMovedError);
                }
            }
        });
    });
});


$(document).on('click', '.remove-saved-item', function () {
    var productId = $(this).data('product-id');

    $.ajax({
        url: window.urls.SaveForLaterRemove,
        type: 'POST',
        data: { productId: productId },
        success: function (response) {
            if (response.success) {
                location.reload();
            } else {
                alert(response.message);
            }
        },
        error: function () {
            alert(window.properties.saveForLaterRemovedError);

        }
    });
});

$(document).ready(function () {
    // Add to Cart Functionality
    $('.saved-for-later-section').on('click', '.add-to-cart', function () {
        var productId = $(this).data('product-id');

        $.ajax({
            url:window.urls.AddToCart,
            type: 'POST',
            data: { productId: productId },
            success: function (response) {
                if (response.success) {
                    location.reload();
                } else {
                    alert(window.properties.AddToCartError);
                }
            },
            error: function () {
                alert(window.properties.AddToCartError);
            }
        });
    });
});

