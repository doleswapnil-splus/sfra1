
'use strict';

var base = module.superModule;
var ProductMgr = require('dw/catalog/ProductMgr');
var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
var Resource = require('dw/web/Resource');
var Transaction = require('dw/system/Transaction');
var CartModel = require('*/cartridge/models/cart');
/**
 * Checks if all product line items in the basket are email gift certificates.
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
        // If there is a mix of email and non-email products, return false
        if (hasEmailGiftCertificate && hasNonEmailGiftCertificate) {
            return false;
        }
    }
    // Return true only if all items are email gift certificates
    return hasEmailGiftCertificate && !hasNonEmailGiftCertificate;
}
/**
 * Adds a product to the cart. If the product is already in the cart it increases the quantity of
 * that product.
 * @param {dw.order.Basket} currentBasket - Current users's basket
 * @param {string} productId - the productId of the product being added to the cart
 * @param {number} quantity - the number of products to the cart
 * @param {string[]} childProducts - the products' sub-products
 * @param {SelectedOption[]} options - product options
 *  @return {Object} returns an error object
 */
function addProductToCart(currentBasket, productId, quantity, childProducts, options,firstName,
    lastName,email,isGiftCertificate, giftCertificateType) {
    var availableToSell;
    var defaultShipment = currentBasket.defaultShipment;
    var perpetual;
    var product = ProductMgr.getProduct(productId);
    var productInCart;
    var productLineItems = currentBasket.productLineItems;
    var productQuantityInCart;
    var quantityToSet;
    var optionModel = productHelper.getCurrentOptionModel(product.optionModel, options);
    var result = {
        error: false,
        message: Resource.msg('text.alert.addedtobasket', 'product', null)
    };
    var totalQtyRequested = 0;
    var canBeAdded = false;

    if (product.bundle) {
        canBeAdded = base.checkBundledProductCanBeAdded(childProducts, productLineItems, quantity);
    } else {
        totalQtyRequested = quantity + base.getQtyAlreadyInCart(productId, productLineItems);
        perpetual = product.availabilityModel.inventoryRecord ? product.availabilityModel.inventoryRecord.perpetual : null;
        if (product.availabilityModel.inventoryRecord) {
        canBeAdded = (perpetual
            || totalQtyRequested <= product.availabilityModel.inventoryRecord.ATS.value);
        }
    }

    if (!canBeAdded) {
        result.error = true;
        result.message = Resource.msgf(
            'error.alert.selected.quantity.cannot.be.added.for',
            'product',
            null,
            product.product.availabilityModel.inventoryRecord? product.availabilityModel.inventoryRecord.ATS.value: null,
            product.name
        );
        return result;
    }

    productInCart = base.getExistingProductLineItemInCart(product, productId, productLineItems, childProducts, options);

    if (productInCart) {
        productQuantityInCart = productInCart.quantity.value;
        quantityToSet = quantity ? quantity + productQuantityInCart : productQuantityInCart + 1;
        availableToSell = productInCart.product.availabilityModel.inventoryRecord ? productInCart.product.availabilityModel.inventoryRecord.ATS.value : null;

        if (availableToSell >= quantityToSet || perpetual) {
            productInCart.setQuantityValue(quantityToSet);
            result.uuid = productInCart.UUID;
        } else {
            result.error = true;
            result.message = availableToSell === productQuantityInCart
                ? Resource.msg('error.alert.max.quantity.in.cart', 'product', null)
                : Resource.msg('error.alert.selected.quantity.cannot.be.added', 'product', null);
        }
    } else {
        var productLineItem;

        productLineItem = base.addLineItem(
            currentBasket,
            product,
            quantity,
            childProducts,
            optionModel,
            defaultShipment
        );
        Transaction.wrap(function () {
            productLineItem.custom.firstName = firstName;
            productLineItem.custom.lastName = lastName;
            productLineItem.custom.email = email;
            productLineItem.custom.isGiftCertificate = Boolean(isGiftCertificate);
            productLineItem.custom.giftCertificateType = giftCertificateType;
        });
        result.uuid = productLineItem.UUID;
    }

    return result;
}

base.checkGiftCertificateType = checkGiftCertificateType;
base.addProductToCart=addProductToCart;

module.exports=base;
