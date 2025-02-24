'use strict';

var base = module.superModule;
var collections = require('*/cartridge/scripts/util/collections');
var BasketMgr = require('dw/order/BasketMgr');
var currentBasket = BasketMgr.getCurrentBasket();
var ShippingMgr = require('dw/order/ShippingMgr');

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

        // Convert productLineItems to an array
        var productLineItems = Array.from(shipment.productLineItems);

        // Check if shipment contains any physical products
        var hasPhysicalProducts = productLineItems.some(function (pli) {
            return !(pli.custom.isGiftCertificate && pli.custom.giftCertificateType === 'email');
        });

        // If the shipment has physical products, ensure it has a valid address
        if (hasPhysicalProducts) {
            return address && address.address1;
        }

        // If the shipment only contains email gift cards, it is valid without an address
        return true;
    });

    return allValid;
}

base.ensureValidShipments = ensureValidShipments;
module.exports = base;
