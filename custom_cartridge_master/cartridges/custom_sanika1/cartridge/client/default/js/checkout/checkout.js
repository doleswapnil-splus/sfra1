'use strict';

var base = require('base/checkout/checkout');
function initialize() {
   
    base.members.currentStage = base.checkoutStages
        .indexOf($('.data-checkout-stage').data('checkout-stage'));
    $(base.plugin).attr('data-checkout-stage', base.checkoutStages[base.members.currentStage]);

    $('body').on('click', '.submit-customer-login', function (e) {
        e.preventDefault();
        base.members.nextStage();
    });

    $('body').on('click', '.submit-customer', function (e) {
        var giftCertificateItems = $('.cart-items').filter(function () {
            return $(this).data('gift-certificate-type') === 'email';
        });
    
        var nonGiftCertificateItems = $('.cart-items').filter(function () {
            var giftCertificateType = $(this).data('gift-certificate-type');
            return giftCertificateType === 'paper' || giftCertificateType === 'none';
        });
    
        if (giftCertificateItems.length > 0 && nonGiftCertificateItems.length === 0) {
            // Only email gift certificates in the cart
            members.gotoStage('payment');
        } else {
            // Mixed or non-email gift certificate items in the cart
            e.preventDefault();
            members.nextStage();
        }
    });
    // Handle Payment option selection
    $('input[name$="paymentMethod"]', base.plugin).on('change', function () {
        $('.credit-card-form').toggle($(this).val() === 'CREDIT_CARD');
    });

    // Handle Next State button click
    $(base.plugin).on('click', '.next-step-button button', function () {
        base.members.nextStage();
    });

    // Handle Edit buttons on shipping and payment summary cards
    $('.customer-summary .edit-button', base.plugin).on('click', function () {
        base.members.gotoStage('customer');
    });

    $('.shipping-summary .edit-button', base.plugin).on('click', function () {
        if (!$('#checkout-main').hasClass('multi-ship')) {
            $('body').trigger('shipping:selectSingleShipping');
        }
        base.members.gotoStage('shipping');
    });

    $('.payment-summary .edit-button', base.plugin).on('click', function () {
        base.members.gotoStage('payment');
    });

    
    base.updateUrl(base.members.currentStage);

    // Listen for forward/back button press and move to the correct checkout-stage
    $(window).on('popstate', function (e) {
        if (
            e.state === null ||
            base.checkoutStages.indexOf(e.state) < base.members.currentStage
        ) {
            base.members.handlePrevStage(false);
        } else if (base.checkoutStages.indexOf(e.state) > base.members.currentStage) {
            base.members.handleNextStage(false);
        }
    });

    base.plugin.data('formData', base.formData);
}
base.initialize = initialize;
module.exports = base;
