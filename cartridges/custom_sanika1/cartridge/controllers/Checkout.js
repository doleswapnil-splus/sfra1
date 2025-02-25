'use strict';

/**
 * @namespace Checkout
 */

var server = require('server');
var baseCheckout = module.superModule;
server.extend(baseCheckout);

server.append('Begin', function (req, res, next) {

    var Transaction = require('dw/system/Transaction');
    var Resource = require('dw/web/Resource');
    var collections = require('*/cartridge/scripts/util/collections');
    var CartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');
    var checkoutHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
    var currentBasket = BasketMgr.getCurrentBasket();
    var ShippingMgr = require('dw/order/ShippingMgr');
    var Money = require('dw/value/Money');
    var onlyEmailGiftCertificates = CartHelper.checkGiftCertificateType(currentBasket);
    var isAuthenticated = req.currentCustomer.raw.authenticated;
    var checkoutData = checkoutHelpers.processCheckoutStages();

    if (!currentBasket) {
        res.redirect(URLUtils.url('Cart-Show'));
        return next();
    }

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
