'use strict';

var base = require('base/product/base');

function getAddToCartUrl() {
    return $('.add-to-cart-url').val();
}

function getChildProducts() {
    var childProducts = [];
    $('.bundle-item').each(function () {
        childProducts.push({
            pid: $(this).find('.product-id').text(),
            quantity: parseInt($(this).find('label.quantity').data('quantity'), 10)
        });
    });

    return childProducts.length ? JSON.stringify(childProducts) : [];
}

function handlePostCartAdd(response) {
    $('.minicart').trigger('count:update', response);
    var messageType = response.error ? 'alert-danger' : 'alert-success';

    // Show add to cart toast
    if (response.newBonusDiscountLineItem && Object.keys(response.newBonusDiscountLineItem).length !== 0) {
        chooseBonusProducts(response.newBonusDiscountLineItem);
    } else {
        if ($('.add-to-cart-messages').length === 0) {
            $('body').append('<div class="add-to-cart-messages"></div>');
        }
        $('.add-to-cart-messages').append(
            '<div class="alert ' + messageType + ' add-to-basket-alert text-center" role="alert">'
            + response.message
            + '</div>'
        );
        setTimeout(function () {
            $('.add-to-basket-alert').remove();
        }, 5000);
    }
}

function getOptions($productContainer) {
    var options = $productContainer
        .find('.product-option')
        .map(function () {
            var $elOption = $(this).find('.options-select');
            var urlValue = $elOption.val();
            var selectedValueId = $elOption.find('option[value="' + urlValue + '"]').data('value-id');
            return {
                optionId: $(this).data('option-id'),
                selectedValueId: selectedValueId
            };
        }).toArray();
    return JSON.stringify(options);
}

function addToCart() {
    $(document).on('click', 'button.add-to-cart, button.add-to-cart-global', function () {
        var addToCartUrl;
        var pid;
        var pidsObj;
        var setPids;

        $('body').trigger('product:beforeAddToCart', this);

        if ($('.set-items').length && $(this).hasClass('add-to-cart-global')) {
            setPids = [];
            $('.product-detail').each(function () {
                if (!$(this).hasClass('product-set-detail')) {
                    setPids.push({
                        pid: $(this).find('.product-id').text(),
                        qty: $(this).find('.quantity-select').val(),
                        options: getOptions($(this))
                    });
                }
            });
            pidsObj = JSON.stringify(setPids);
        }

        if ($('.wishlistpage').length) {
            pid = $(this).closest('.product-detail').data('pid');
        } else {
            pid = base.getPidValue($(this));
        }

        var $productContainer = $(this).closest('.product-detail');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.quick-view-dialog').find('.product-detail');
        }

        addToCartUrl = getAddToCartUrl();

        var isGiftCertificate = $productContainer.find('.gift-certificate-options').length > 0;
        var giftCertificateType = null;
        if (isGiftCertificate) {
            giftCertificateType = $productContainer
                .find('input[name="giftCertificate"]:checked')
                .val();
        }

        var form = {
            pid: pid,
            pidsObj: pidsObj,
            childProducts: getChildProducts(),
            quantity: base.getQuantitySelected($(this))
        };

        if (isGiftCertificate) {
            form.giftCertificateType = giftCertificateType || null;
            form.isGiftCertificate = true;
            form.firstName = $('#firstName').val() || null;
            form.lastName = $('#lastName').val() || null;
            form.email = $('#email').val() || null;
        }

        if (!$('.bundle-item').length) {
            form.options = getOptions($productContainer);
        }

        $(this).trigger('updateAddToCartFormData', form);

        if (addToCartUrl) {
            $.ajax({
                url: addToCartUrl,
                method: 'POST',
                data: form,
                success: function (data) {
                    handlePostCartAdd(data);
                    $('body').trigger('product:afterAddToCart', data);
                    $.spinner().stop();
                    miniCartReportingUrl(data.reportingURL);
                },
                error: function () {
                    $.spinner().stop();
                }
            });
        }
    });
}

function selectAttribute () {
    $(document).on('change', 'select[class*="select-"], .options-select', function (e) {
        e.preventDefault();

        var $productContainer = $(this).closest('.set-item');
        if (!$productContainer.length) {
            $productContainer = $(this).closest('.product-detail');
        }
        attributeSelect(e.currentTarget.value, $productContainer);
    });
}

function attributeSelect(selectedValueUrl, $productContainer) {
    if (selectedValueUrl) {
        $('body').trigger(
            'product:beforeAttributeSelect',
            { url: selectedValueUrl, container: $productContainer }
        );

        $.ajax({
            url: selectedValueUrl,
            method: 'GET',
            success: function (data) {
                base.handleVariantResponse(data, $productContainer);
                base.updateOptions(data.product.optionsHtml, $productContainer);
                base.updateQuantities(data.product.quantities, $productContainer);
                checkWishlistStatus(data.product.id);

                $('body').trigger(
                    'product:afterAttributeSelect',
                    { data: data, container: $productContainer }
                );
                $.spinner().stop();
            },
            error: function () {
                $.spinner().stop();
            }
        });
    }
}

function checkWishlistStatus(productId) {
    $.ajax({
        url: window.urls.InWishlistUrl,
        method: 'GET',
        data: { pid: productId },
        success: function (response) {
            if (response.isInWishlist) {
                $('.wishlist-icon-button i').removeClass('wishlist-removed').addClass('wishlist-added');
            } else {
                $('.wishlist-icon-button i').removeClass('wishlist-added').addClass('wishlist-removed');
            }
        },
        error: function () {
            console.error('Error checking wishlist status.');
        }
    });
}

base.addToCart = addToCart;
base.selectAttribute=selectAttribute;
base.checkWishlistStatus=checkWishlistStatus;
base.attributeSelect=attributeSelect;

module.exports = base;
