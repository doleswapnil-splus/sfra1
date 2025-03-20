'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

function saveForLater(basket, productId) {
    var items = basket.getProductLineItems();
    var itemToSave;

collections.forEach(items, function (item) {
    if (item.product.ID === productId) {
        itemToSave = item;
    }
});

if (itemToSave) {
    Transaction.wrap(function () {

        var savedItem = CustomObjectMgr.getCustomObject('SavedForLater', productId);
        if (!savedItem) {
            savedItem = CustomObjectMgr.createCustomObject('SavedForLater', productId);
        }

        savedItem.custom.ProductId = productId;
        savedItem.custom.name = itemToSave.product.name;
        savedItem.custom.price = itemToSave.product.getPriceModel().getPrice().getValue();
        savedItem.custom.image = itemToSave.product.getImage('small').getURL();
        savedItem.custom.quantity = itemToSave.quantityValue;
        savedItem.custom.uuId = itemToSave.UUID;


    var variantAttributes = [];
    var variationModel = itemToSave.product.variationModel;

    if (variationModel) {
        var attributes = variationModel.productVariationAttributes; // Get all variation attributes
        collections.forEach(attributes, function (attribute) {
            var selectedValue = variationModel.getSelectedValue(attribute);
            if (selectedValue) {
                variantAttributes.push({
                    displayName: attribute.displayName,
                    selectedValue: selectedValue.displayValue
                });
            }
        });
    }
    savedItem.custom.options = JSON.stringify(variantAttributes);
        var b =itemToSave.custom.isGiftCertificate;

    if (itemToSave.custom.isGiftCertificate && itemToSave.custom.giftCertificateType==='email') {
        savedItem.custom.isGiftCertificate = itemToSave.custom.isGiftCertificate;
        savedItem.custom.giftCertificateType = itemToSave.custom.giftCertificateType;
        savedItem.custom.firstName = itemToSave.custom.firstName;
        savedItem.custom.lastName = itemToSave.custom.lastName;
        savedItem.custom.email = itemToSave.custom.email;
    } else {
        savedItem.custom.isGiftCertificate = false;
    }

    basket.removeProductLineItem(itemToSave);

    });
    return itemToSave;
}
  return null;
}

module.exports = {
    saveForLater: saveForLater
};
