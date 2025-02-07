
'use strict';

var base = module.superModule;

/**
 * Extends the base ProductLineItems to include gift certificate attributes.
 * @constructor
 * @classdesc Class that represents a collection of line items and total quantity of
 * items in current basket or per shipment.
 * @param {dw.util.Collection<dw.order.ProductLineItem>} productLineItems - the product line items
 * @param {string} view - the view of the line item (basket or order)
 */
function ProductLineItems(productLineItems, view) {
    base.call(this, productLineItems, view);

    if (this.items && this.items.length > 0) {
        this.items.forEach(function (item, index) {
            var lineItem = productLineItems[index];
            if (lineItem && lineItem.custom) {
                item.isGiftCertificate = lineItem.custom.isGiftCertificate || false;
                item.giftCertificateType = lineItem.custom.giftCertificateType || null;
            }
        });
    }
}

ProductLineItems.getTotalQuantity = base.getTotalQuantity;
module.exports = ProductLineItems;
