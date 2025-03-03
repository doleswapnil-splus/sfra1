'use strict';

var base = module.superModule;
var collections = require('*/cartridge/scripts/util/collections');

/**
 * Loop through all shipments and make sure all non-GC shipments have a valid address.
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current user's basket
 * @returns {boolean} - true if all physical product shipments have valid addresses
 */
function ensureValidShipments(lineItemContainer) {
    var shipments = lineItemContainer.shipments;

    var allValid = collections.every(shipments, function (shipment) {
        if (!shipment) {
            return false;
        }
        var address = shipment.shippingAddress;
        var productLineItems = Array.from(shipment.productLineItems);

        var hasPhysicalProducts = productLineItems.some(function (pli) {
            return !(pli.custom.isGiftCertificate && pli.custom.giftCertificateType === 'email');
        });

        if (hasPhysicalProducts) {
            return address && address.address1;
        }
        return true;
    });

    return allValid;
}

function CheckoutFreeShipping() {
    var Transaction = require('dw/system/Transaction');
    var Resource = require('dw/web/Resource');
    var CartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var BasketMgr = require('dw/order/BasketMgr');
    var ShippingMgr = require('dw/order/ShippingMgr');
    var currentBasket = BasketMgr.getCurrentBasket();
    var onlyEmailGiftCertificates = CartHelper.checkGiftCertificateType(currentBasket);

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
            basketCalculationHelpers.calculateTotals(currentBasket);
        });
    }
}

base.ensureValidShipments = ensureValidShipments;
base.CheckoutFreeShipping=CheckoutFreeShipping;
module.exports = base;
