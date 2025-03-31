'use strict';

var Transaction = require('dw/system/Transaction');
var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList = require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');

function saveForLater(basket, customer, productId, isGiftCertificate, giftCertificateType, firstName, lastName, email) {
    var items = basket.getProductLineItems().toArray();
    var itemToSave = null;
    var product = ProductMgr.getProduct(productId);

    for (var i = 0; i < items.length; i++) {
        if (items[i].product.ID === productId) {
            itemToSave = items[i];
            break;
        }
    }

    if (!itemToSave) {
        return null;
    }

    Transaction.wrap(function () {
        var saveForLaterList = ProductListMgr.getProductLists(customer, ProductList.TYPE_CUSTOM_1);
        saveForLaterList = saveForLaterList.length > 0 ? saveForLaterList[0] : null;

        if (!saveForLaterList) {
            saveForLaterList = ProductListMgr.createProductList(customer, ProductList.TYPE_CUSTOM_1);
            saveForLaterList.setName('Save for Later');
        }

        var savedItems = saveForLaterList.items.toArray();
        for (var j = 0; j < savedItems.length; j++) {
            if (savedItems[j].product.ID === productId) {
                basket.removeProductLineItem(itemToSave);
                return;
            }
        }
        var savedItem = saveForLaterList.createProductItem(product);
        savedItem.custom.isGiftCertificate = isGiftCertificate;
        savedItem.custom.giftCertificateType = giftCertificateType;
        savedItem.custom.firstName = firstName;
        savedItem.custom.lastName = lastName;
        savedItem.custom.email = email;

        basket.removeProductLineItem(itemToSave);
    });

    return itemToSave;
}

/**
 * Fetches saved items from the "Save for Later" list.
 * @param {dw.customer.Customer} currentCustomer - The current customer object.
 * @returns {Array} Array of saved items.
 */
function getSavedItems(currentCustomer) {
    var savedItems = [];

    if (!currentCustomer) {
        return savedItems;
    }

    var savedForLaterLists = ProductListMgr.getProductLists(currentCustomer, ProductList.TYPE_CUSTOM_1);
    var savedForLaterList = savedForLaterLists.length > 0 ? savedForLaterLists[0] : null;

    if (!savedForLaterList) {
        return savedItems;
    }

    var savedListItems = savedForLaterList.getProductItems();

    for (var i = 0; i < savedListItems.length; i++) {
        var item = savedListItems[i]; // ProductListItem
        var product = ProductMgr.getProduct(item.productID); // Get product details
        var selectedVariantAttributes = [];

        if (product) {
            if (product.isVariant()) {
                var variationModel = product.getVariationModel();
                if (variationModel) {
                    var productVariationAttributes = variationModel.getProductVariationAttributes();

                    productVariationAttributes.toArray().forEach(function (attribute) {
                        var attributeValue = variationModel.getSelectedValue(attribute);
                        if (attributeValue) {
                            selectedVariantAttributes.push({
                                displayName: attribute.getDisplayName(),
                                selectedValue: attributeValue.getDisplayValue()
                            });
                        }
                    });
                }
            }

            var selectedVariantAttributesJSON = JSON.stringify(selectedVariantAttributes);

            savedItems.push({
                productListItem: item,
                productID: product.ID,
                name: product.name,
                price: product.priceModel.price.valueOrNull || 0,
                image: product.getImage('small') ? product.getImage('small').getURL() : '',
                selectedVariantAttributes: selectedVariantAttributesJSON,
                isGiftCertificate: item.custom.isGiftCertificate,
                giftCertificateType: item.custom.giftCertificateType,
                firstName: item.custom.firstName,
                lastName: item.custom.lastName,
                email: item.custom.email
            });
        }
    }
    return savedItems;
}

module.exports = {
    saveForLater: saveForLater,
    getSavedItems: getSavedItems
};
