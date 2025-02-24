'use strict';

/**
 * @namespace Checkout
 */

var server = require('server');
var baseCheckout = module.superModule;

server.extend(baseCheckout);

var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var collections = require('*/cartridge/scripts/util/collections');
var CartHelper = require('*/cartridge/scripts/cart/cartHelpers');
var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

server.append('Begin', function (req, res, next) {
    var BasketMgr = require('dw/order/BasketMgr');
    var URLUtils = require('dw/web/URLUtils');
    var currentBasket = BasketMgr.getCurrentBasket();
    var onlyEmailGiftCertificates = CartHelper.checkGiftCertificateType(currentBasket);
    var ShippingMgr = require('dw/order/ShippingMgr');
    var Money = require('dw/value/Money');

    if (onlyEmailGiftCertificates) {
        Transaction.wrap(function () {
            collections.forEach(currentBasket.shipments, function (shipment) {
                var shipmentShippingModel = ShippingMgr.getShipmentShippingModel(shipment);
                var applicableMethods = shipmentShippingModel.getApplicableShippingMethods();
                var freeShippingMethod = null;
                var freeShippingID = Resource.msg('shipping.method.free', 'checkout', 'free-shipping');

                var methodIterator = applicableMethods.iterator();
                while (methodIterator.hasNext()) {
                    var method = methodIterator.next();
                    if (method.ID === freeShippingID) {
                        freeShippingMethod = method;
                        break;
                    }
                }

                if (freeShippingMethod) {
                    shipment.setShippingMethod(freeShippingMethod);
                }
            });
            var shipment = currentBasket.shipments[0];

            shipment.getShippingLineItems().toArray().forEach(function (shippingLineItem) {
                shippingLineItem.setTax(new dw.value.Money(0, currentBasket.currencyCode));
            });
            currentBasket.updateTotals();

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
            currentStage = CartHelper.checkGiftCertificateType(currentBasket) ? 'payment' : 'shipping';
        }
    }
    res.setViewData({
        currentStage: currentStage,
        onlyEmailGiftCertificates: onlyEmailGiftCertificates
    });

    next();
});

module.exports = server.exports();
