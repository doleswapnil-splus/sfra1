'use strict';

var collections = require('*/cartridge/scripts/util/collections');
var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

// function saveForLater(basket, productId) {
//     var items = basket.getProductLineItems();
//     var itemToSave;

// collections.forEach(items, function (item) {
//     if (item.product.ID === productId) {
//         itemToSave = item;
//     }
// });

// if (itemToSave) {
//     Transaction.wrap(function () {

//         var savedItem = CustomObjectMgr.getCustomObject('SavedForLater', productId);
//         if (!savedItem) {
//             savedItem = CustomObjectMgr.createCustomObject('SavedForLater', productId);
//         }

//         savedItem.custom.ProductId = productId;
//         savedItem.custom.name = itemToSave.product.name;
//         savedItem.custom.price = itemToSave.product.getPriceModel().getPrice().getValue();
//         savedItem.custom.image = itemToSave.product.getImage('small').getURL();
//         savedItem.custom.quantity = itemToSave.quantityValue;
//         savedItem.custom.uuId = itemToSave.UUID;


//     var variantAttributes = [];
//     var variationModel = itemToSave.product.variationModel;

//     if (variationModel) {
//         var attributes = variationModel.productVariationAttributes; // Get all variation attributes
//         collections.forEach(attributes, function (attribute) {
//             var selectedValue = variationModel.getSelectedValue(attribute);
//             if (selectedValue) {
//                 variantAttributes.push({
//                     displayName: attribute.displayName,
//                     selectedValue: selectedValue.displayValue
//                 });
//             }
//         });
//     }
//     savedItem.custom.options = JSON.stringify(variantAttributes);
//         var b =itemToSave.custom.isGiftCertificate;

//     if (itemToSave.custom.isGiftCertificate && itemToSave.custom.giftCertificateType==='email') {
//         savedItem.custom.isGiftCertificate = itemToSave.custom.isGiftCertificate;
//         savedItem.custom.giftCertificateType = itemToSave.custom.giftCertificateType;
//         savedItem.custom.firstName = itemToSave.custom.firstName;
//         savedItem.custom.lastName = itemToSave.custom.lastName;
//         savedItem.custom.email = itemToSave.custom.email;
//     } else {
//         savedItem.custom.isGiftCertificate = false;
//     }

//     basket.removeProductLineItem(itemToSave);

//     });
//     return itemToSave;
// }
//   return null;
// }



var collections = require('dw/util/Collection');
var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList = require('dw/customer/ProductList');
var Transaction = require('dw/system/Transaction');
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

    if (itemToSave) {
        Transaction.wrap(function () {
            var saveForLaterList = ProductListMgr.getProductLists(customer, ProductList.TYPE_CUSTOM_1);
            saveForLaterList = saveForLaterList.length > 0 ? saveForLaterList[0] : null;

            // If list does not exist, create it
            if (!saveForLaterList) {
                saveForLaterList = ProductListMgr.createProductList(customer, ProductList.TYPE_CUSTOM_1);
                saveForLaterList.setName('Save for Later');
            }

            var savedItem = saveForLaterList.createProductItem(product);

             // Store custom attributes in saved list
             savedItem.custom.isGiftCertificate = isGiftCertificate;
             savedItem.custom.giftCertificateType = giftCertificateType;
             savedItem.custom.firstName = firstName;
             savedItem.custom.lastName = lastName;
             savedItem.custom.email = email;

            // Remove item from cart
            basket.removeProductLineItem(itemToSave);
        });

        return itemToSave;
    }

    return null;
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
    getSavedItems:getSavedItems
};

