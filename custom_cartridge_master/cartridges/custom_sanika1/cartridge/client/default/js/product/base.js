'use strict';

 var base1 = require('base/product/base');

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
    // show add to cart toast
    if (response.newBonusDiscountLineItem
        && Object.keys(response.newBonusDiscountLineItem).length !== 0) {
        chooseBonusProducts(response.newBonusDiscountLineItem);
    } else {
        if ($('.add-to-cart-messages').length === 0) {
            $('body').append(
                '<div class="add-to-cart-messages"></div>'
            );
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
            var selectedValueId = $elOption.find('option[value="' + urlValue + '"]')
                .data('value-id');
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

        if($('.wishlistpage').length)
        {
          pid=$(this).closest('.product-detail').data('pid');
        }
        else
        {
            pid = base1.getPidValue($(this));
        }
        //pid = base1.getPidValue($(this));//?null:$(this).closest('.product-detail').data('pid');

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
                .val(); // 'email' or 'paper'
        }

        var form = {
            pid: pid,
            pidsObj: pidsObj,
            childProducts: getChildProducts(),
            quantity: base1.getQuantitySelected($(this))
            
        };
if (isGiftCertificate) {
    form.giftCertificateType = giftCertificateType || null; // Default to null if not defined
    form.isGiftCertificate=true;
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


base1.addToCart=addToCart;
module.exports=base1;
