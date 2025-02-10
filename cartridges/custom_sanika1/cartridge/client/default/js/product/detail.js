'use strict';

var base = require('base/product/detail');
var wishlist = require('../whishlistHeart');

/**
 * Enable/disable UI elements
 */
function updateGiftCerticate() {
    $('body').on('change', 'input[name="giftCertificate"]', function (event) {
        const $paperRadio = $('#paperGiftCertificate');
        const $personalizeButton = $('#personalizeButton');
        const $addToCart = $('#add-to-cart');

        if ($paperRadio.is(':checked')) {
            $personalizeButton.hide();
            $addToCart.show();
        } else if ($('#emailGiftCertificate').is(':checked')) {
            $personalizeButton.show();
            $addToCart.hide();
        }

        localStorage.setItem('giftCertificateType', $(this).val());
    });

    // Initial check to set the button state on page load
    if ($('#paperGiftCertificate').is(':checked')) {
        $('#personalizeButton').hide();
    } else {
        $('#personalizeButton').show();
    }

    // Restore saved state from localStorage
    $(document).ready(function () {
        const savedType = localStorage.getItem('giftCertificateType');
        if (savedType) {
            $(`#emailGiftCertificate[value="${savedType}"]`).prop('checked', true);
        }
    });
}

function updateAddToCart() {
    $('body').on('product:updateAddToCart', function (e, response) {
        $('button.add-to-cart', response.$productContainer).attr(
            'disabled',
            (!response.product.readyToOrder || !response.product.available)
        );

        $('#personalizeButton').attr(
            'disabled',
            (!response.product.readyToOrder || !response.product.available)
        );

        var enable = $('.product-availability').toArray().every(function (item) {
            return $(item).data('available') && $(item).data('ready-to-order');
        });

        base.methods.updateAddToCartEnableDisableOtherElements(!enable);
        $('#personalizeButton').attr('disabled', !enable);
    });
}

function closeModal() {
    $('button.add-to-cart').on('click', function (e) {
        e.preventDefault();
        $('#chooseProductModal').modal('hide');
    });
}

function emailValidation() {
    $(document).ready(function () {
        const emailInput = $('#email');
        const emailError = $('#emailError');
        const addToCartButton = $('#addToCart');
        const firstNameInput = $('#firstName');
        const lastNameInput = $('#lastName');
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        emailError.hide();
        addToCartButton.prop('disabled', true); // Disable button initially

        $('#chooseProductModal').on('show.bs.modal', function () {
            addToCartButton.prop('disabled', true);
            emailInput.val('');
            firstNameInput.val('');
            lastNameInput.val('');
            emailError.hide();
        });

        function validateInputs() {
            if (
                firstNameInput.val().trim() !== '' &&
                lastNameInput.val().trim() !== '' &&
                emailRegex.test(emailInput.val())
            ) {
                addToCartButton.prop('disabled', false);
            } else {
                addToCartButton.prop('disabled', true);
            }
        }

        firstNameInput.on('input', validateInputs);
        lastNameInput.on('input', validateInputs);
        emailInput.on('input', function () {
            emailError.toggle(!emailRegex.test(emailInput.val()));
            validateInputs();
        });

        $('body').on('click', '#addToCart', function (e) {
            e.preventDefault();

            if (emailRegex.test(emailInput.val())) {
                console.log('Valid email:', emailInput.val());
            }
        });
    });
}

function updateAttribute() {
    $('body').on('product:afterAttributeSelect', function (e, response) {
        if (response.data && response.data.product) {
            var productId = response.data.product.id; // Get the selected product ID

            if ($('.product-detail>.bundle-items').length) {
                response.container.data('pid', productId);
                response.container.find('.product-id').text(productId);
            } else if ($('.product-set-detail').eq(0).length) { // Fix condition
                response.container.data('pid', productId);
                response.container.find('.product-id').text(productId);
            } else {
                $('.product-id').text(productId);
                $('.product-detail:not(".bundle-item")').data('pid', productId);
            }
            var variantIdText=productId;
            $('input.product-id').val(variantIdText);
            checkWishlistStatus(productId);
        }
    });
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
            alert(window.properties.wishlistVariantError);
        }
    });
}

base.updateGiftCerticate = updateGiftCerticate;
base.closeModal = closeModal;
base.updateAddToCart = updateAddToCart;
base.emailValidation = emailValidation;
base.updateAttribute=updateAttribute;
base.checkWishlistStatus=checkWishlistStatus;
base.addToCart=custombase.addToCart;

module.exports = {
    initWishlist: function () {
        wishlist.init();
    } ,
    base
};

