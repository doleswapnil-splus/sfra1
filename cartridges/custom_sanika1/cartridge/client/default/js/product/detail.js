'use strict';

var base = require('base/product/detail');

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

        module.exports.base.methods.updateAddToCartEnableDisableOtherElements(!enable);
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

base.updateGiftCerticate = updateGiftCerticate;
base.closeModal = closeModal;
base.updateAddToCart = updateAddToCart;
base.emailValidation = emailValidation;

module.exports = base;
