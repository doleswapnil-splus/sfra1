

'use strict';

/**
 * re-renders the order totals and the number of items in the cart
 * @param {Object} data - AJAX response from the server
 */
function updateCartTotals(data) {
    $('.number-of-items').empty().append(data.resources.numberOfItems);
    $('.shipping-cost').empty().append(data.totals.totalShippingCost);
    $('.tax-total').empty().append(data.totals.totalTax);
    $('.grand-total').empty().append(data.totals.grandTotal);
    $('.sub-total').empty().append(data.totals.subTotal);
    $('.minicart-quantity').empty().append(data.numItems);
    $('.minicart-link').attr({
        'aria-label': data.resources.minicartCountOfItems,
        title: data.resources.minicartCountOfItems
    });
    if (data.totals.orderLevelDiscountTotal.value > 0) {
        $('.order-discount').removeClass('hide-order-discount');
        $('.order-discount-total').empty()
            .append('- ' + data.totals.orderLevelDiscountTotal.formatted);
    } else {
        $('.order-discount').addClass('hide-order-discount');
    }

    if (data.totals.shippingLevelDiscountTotal.value > 0) {
        $('.shipping-discount').removeClass('hide-shipping-discount');
        $('.shipping-discount-total').empty().append('- '
            + data.totals.shippingLevelDiscountTotal.formatted);
    } else {
        $('.shipping-discount').addClass('hide-shipping-discount');
    }

    data.items.forEach(function (item) {
        if (data.totals.orderLevelDiscountTotal.value > 0) {
            $('.coupons-and-promos').empty().append(data.totals.discountsHtml);
        }
        if (item.renderedPromotions) {
            $('.item-' + item.UUID).empty().append(item.renderedPromotions);
        } else {
            $('.item-' + item.UUID).empty();
        }
        $('.uuid-' + item.UUID + ' .unit-price').empty().append(item.renderedPrice);
        $('.line-item-price-' + item.UUID + ' .unit-price').empty().append(item.renderedPrice);
        $('.item-total-' + item.UUID).empty().append(item.priceTotal.renderedPrice);
    });

}

$(document).ready(function () {
    $('.save-for-later-btn').on('click', function () {
        var productId = $(this).data('product-id');
        var uuid = $(this).data('uuid');
        $.spinner().start();
        $.ajax({
            url: window.urls.SaveForLater,
            type: 'POST',
            data: { productId: productId },
            success: function (response) {
                updateCartTotals(response.cartData);
                if (response.savedForLaterCards) {
                    $('#saveForLaterContainer').html(response.savedForLaterCards)
                }
                if (response.cartData.items.length === 0) {
                    $('.cart').empty().append('<div class="row"> '
                        + '<div class="col-12 text-center"> '
                        + '<h1>' + response.cartData.resources.emptyCartMsg + '</h1> '
                        + '</div> '
                        + '</div>');
                    $('.number-of-items').empty().append(response.cartData.resources.numberOfItems);
                    $('.minicart-quantity').empty().append(response.cartData.numItems);
                    $('.minicart-link').attr({
                        'aria-label': response.cartData.resources.minicartCountOfItems,
                        title: response.cartData.resources.minicartCountOfItems
                    });
                    $('.minicart .popover').empty();
                    $('.minicart .popover').removeClass('show');
                    $('body').removeClass('modal-open');
                    $('html').removeClass('veiled');

                } else {
                    $('.uuid-' + uuid).remove();
                    if (!response.cartData.hasBonusProduct) {
                        $('.bonus-product').remove();
                    }
                    $('.coupons-and-promos').empty().append(response.cartData.totals.discountsHtml);
                    $('body').trigger('setShippingMethodSelection', response);

                }
                $('body').trigger('cart:update', response);
                $.spinner().stop();
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
    $('.saved-for-later-section').on('click', '.add-to-cart', function () {
        var productId = $(this).data('product-id');
        var uuid = $(this).data('uuid');
        $.spinner().start();

        $.ajax({
            url: window.urls.AddToCart,
            type: 'POST',
            data: { productId: productId },

            success: function (response) {
                $('.saved-item-' + uuid).remove();

                updateCartTotals(response.cartData);
                if (response.savedForLaterCards) {
                    $('#saveForLaterContainer').html(response.savedForLaterCards)
                }
                if (!response.cartData.hasBonusProduct) {
                    $('.bonus-product').remove();
                }
                $('.coupons-and-promos').empty().append(response.cartData.totals.discountsHtml);
                $('body').trigger('setShippingMethodSelection', response);

                $.spinner().stop();
            },
            error: function () {
                alert(window.properties.AddToCartError);
                $.spinner().stop();
            }
        });
    });
});
