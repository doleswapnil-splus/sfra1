'use strict';
var base = module.superModule;
var URLUtils = require('dw/web/URLUtils');
var Resource = require('dw/web/Resource');

/**
 * Overrides the `createProductLineItemsObject` method to include gift certificate attributes.
 * @param {dw.util.Collection<dw.order.ProductLineItem>} allLineItems - All product
 * line items of the basket
 * @param {string} view - the view of the line item (basket or order)
 * @returns {Array} an array of product line items.
 */
function createProductLineItemsObject(allLineItems, view) {
    var lineItems = [];
    allLineItems.toArray().forEach(function (item) {
        // Handle unassigned product categories
        if (!item.product) {
            lineItems.push({
                id: item.productID,
                quantity: item.quantity.value,
                productName: item.productName,
                UUID: item.UUID,
                noProduct: true,
                images: {
                    small: [
                        {
                            url: URLUtils.staticURL('/images/noimagelarge.png'),
                            alt: Resource.msgf('msg.no.image', 'common', null),
                            title: Resource.msgf('msg.no.image', 'common', null)
                        }
                    ]
                },
                isGiftCertificate: item.custom.isGiftCertificate,
                giftCertificateType: item.custom.giftCertificateType,
                firstName:item.custom.firstName,
                lastName:item.custom.lastName,
                email:item.custom.email
            });
        } else {
            // Handle standard products
            var options = item.optionProductLineItems.toArray().map(function (optionItem) {
                return {
                    optionId: optionItem.optionID,
                    selectedValueId: optionItem.optionValueID
                };
            });

            var params = {
                pid: item.product.ID,
                quantity: item.quantity.value,
                variables: null,
                pview: 'productLineItem',
                containerView: view,
                lineItem: item,
                options: options
            };

            var newLineItem =require('*/cartridge/scripts/factories/product').get(params);
            newLineItem.isGiftCertificate = item.custom.isGiftCertificate || false;
            newLineItem.giftCertificateType = item.custom.giftCertificateType; 
            lineItems.push(newLineItem);
        }
    });

    return lineItems;
}

/**
 * Extends the base ProductLineItems to include custom behavior.
 * @constructor
 * @classdesc Class that represents a collection of line items and total quantity of
 * items in current basket or per shipment.
 * @param {dw.util.Collection<dw.order.ProductLineItem>} productLineItems - the product line items
 *                                                       of the current line item container
 * @param {string} view - the view of the line item (basket or order)
 */
function ProductLineItems(productLineItems, view) {
    if (productLineItems) {
        this.items = createProductLineItemsObject(productLineItems, view);
        this.totalQuantity = base.getTotalQuantity(productLineItems);
    } else {
        this.items = [];
        this.totalQuantity = 0;
    }
}

// Expose static methods from the base class
ProductLineItems.getTotalQuantity = base.getTotalQuantity;
module.exports = ProductLineItems;


