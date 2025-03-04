'use strict';

/**
 * @namespace Checkout
 */

var server = require('server');
var baseCheckout = module.superModule;
server.extend(baseCheckout);

server.append('Begin', function (req, res, next) {

    var Transaction = require('dw/system/Transaction');
    var CartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');
    var checkoutHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var currentBasket = BasketMgr.getCurrentBasket();
    var isAuthenticated = req.currentCustomer.raw.authenticated;

    if (!currentBasket) {
        res.redirect(URLUtils.url('Cart-Show'));
        return next();
    }
   //Check for Giftcertificate Type email
    var onlyEmailGiftCertificates = CartHelper.checkGiftCertificateType(currentBasket);

   //Check for the freeShipping.
   var checkoutData = checkoutHelpers.CheckoutFreeShipping();

    var requestStage = req.querystring.stage;
    var currentStage = requestStage || 'customer';

    if (currentStage === 'customer') {
        var AccountModel = require('*/cartridge/models/account');
        var accountModel = new AccountModel(req.currentCustomer);

        if (accountModel.registeredUser) {
            // Since the shopper already logged in upon starting checkout, fast forward to shipping stage
            currentStage = 'shipping';
            if (!requestStage) {
                Transaction.wrap(function () {
                    currentBasket.customerEmail = accountModel.profile.email;
                });
            }
        } else if (currentBasket.customerEmail) {
            currentStage = CartHelper.checkGiftCertificateType(currentBasket) ? 'payment' : 'shipping';
        }
    }
    res.setViewData({
        currentStage: currentStage,
        onlyEmailGiftCertificates: onlyEmailGiftCertificates,
        isAuthenticated: isAuthenticated
    });
    next();
});

module.exports = server.exports();
