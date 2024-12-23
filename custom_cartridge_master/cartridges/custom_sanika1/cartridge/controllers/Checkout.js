
'use strict';

/**
 * @namespace Checkout
 */

var server = require('server');
var baseCheckout = module.superModule;

server.extend(baseCheckout);

var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');
var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var Transaction = require('dw/system/Transaction');
var BasketMgr = require('dw/order/BasketMgr');
var collections = require('*/cartridge/scripts/util/collections');
var AccountModel = require('*/cartridge/models/account');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

/**
 * Helper function to determine whether to skip to the payment stage or not.
 * @param {dw.order.Basket} basket - The current basket
 * @returns {boolean} - True if all products have giftCertificateType='email', otherwise false
 */
function checkGiftCertificateType(basket) {
    var productLineItems = basket.productLineItems.iterator();
    var hasEmailGiftCertificate = false;
    var hasNonEmailGiftCertificate = false;

    while (productLineItems.hasNext()) {
        var item = productLineItems.next();
        var giftCertificateType = item.custom.giftCertificateType;

        if (giftCertificateType === 'email') {
            hasEmailGiftCertificate = true;
        } else {
            hasNonEmailGiftCertificate = true;
        }

        // If there is a mix of email and non-email products, do not skip shipping
        if (hasEmailGiftCertificate && hasNonEmailGiftCertificate) {
            return false;
        }
    }

    // Skip to payment only if all items are 'email' gift certificates
    return hasEmailGiftCertificate && !hasNonEmailGiftCertificate;
}

/**
 * Checkout-Begin : Overrides the base controller's Begin action to modify the logic for advancing checkout stages
 */
server.append(
    'Begin',
    server.middleware.https,
    consentTracking.consent,
    csrfProtection.generateToken,
    function (req, res, next) {
        var BasketMgr = require('dw/order/BasketMgr');
        var URLUtils = require('dw/web/URLUtils');
        var currentBasket = BasketMgr.getCurrentBasket();
        var currentBasket = BasketMgr.getCurrentBasket();
    if (currentBasket && currentBasket.productLineItems[0].custom.giftCertificateType === 'email') {
        Transaction.wrap(function () {
            collections.forEach(currentBasket.shipments, function (shipment) {
                shipment.setShippingMethod(null);
            });
            basketCalculationHelpers.calculateTotals(currentBasket);
        });
    }

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
                // Email address already collected, decide whether to skip to payment or proceed to shipping
                currentStage = checkGiftCertificateType(currentBasket) ? 'payment' : 'shipping';
            }
        }

        // Update the current stage in the response (or any other necessary changes)
        res.setViewData({
            currentStage: currentStage
        });

        next();
    }
);

module.exports = server.exports();

