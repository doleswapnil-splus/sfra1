'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var SavedProductsHelper = require('*/cartridge/scripts/SavedProductsHelper'); // Helper script
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Resource = require('dw/web/Resource');
var customObject = "SavedForLater";
var currentBasket = BasketMgr.getCurrentBasket();
var ISML = require('dw/template/ISML');
var CartModel = require('*/cartridge/models/cart'); // Import cart model if needed
var cartHelper = require('*/cartridge/scripts/cart/cartHelpers'); // Your helper file for cart operations


// server.post('SaveItem', function (req, res, next) {
//     if (!currentBasket) {
//         res.json({ success: false, error: Resource.msg('CurrentBasket.Error', 'saveForLater', null) });
//         return next();
//     }

//     var productId = req.form.productId;
//     if (!productId) {
//         res.json({ success: false, error: Resource.msg('Invalid.ProductId', 'saveForLater', null) });
//         return next();
//     }

//     Transaction.wrap(function () {
//         SavedProductsHelper.saveForLater(currentBasket, productId); //Remove item from cart
//     });

//     res.json({ success: true });
//     return next();
// });

server.post('SaveItem', function (req, res, next) {
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var currentBasket = BasketMgr.getCurrentBasket();

    if (!currentBasket) {
        res.json({ success: false, error: Resource.msg('CurrentBasket.Error', 'saveForLater', null) });
        return next();
    }

    var productId = req.form.productId;
    if (!productId) {
        res.json({ success: false, error: Resource.msg('Invalid.ProductId', 'saveForLater', null) });
        return next();
    }

  
    Transaction.wrap(function () {
        SavedProductsHelper.saveForLater(currentBasket, productId);
    });


    var cartModel = new CartModel(currentBasket);
    var cartItems = cartModel.items || [];
    var cartTotals = cartModel.totals || {};


    var updatedProductCards = cartItems.length > 0
        ? ISML.renderTemplate('cart/cartProductList', { pdict: { items: cartItems } })
        : '<p>Your cart is empty.</p>';

    var updatedGrandTotal = cartTotals.grandTotal ? cartTotals.grandTotal : '0.00';

    res.json({
        success: true,
        updatedProductCards: updatedProductCards,
        updatedGrandTotal: updatedGrandTotal
    });

    return next();
});


server.post('Remove', function (req, res, next) {
    var productId = req.form.productId;

    if (!productId) {
        res.json({ success: false, message:Resource.msg('Invalid.ProductId', 'saveForLater', null) });
        return next();
    }

    var savedItem = CustomObjectMgr.getCustomObject(customObject, productId);

    if (savedItem) {
        Transaction.wrap(function () {
            CustomObjectMgr.remove(savedItem);
        });
        res.json({ success: true });
    } else {
        res.json({ success: false, message: Resource.msg('saveForLater.item.removed.error', 'saveForLater', null) });
    }

    return next();
});

server.post('AddToCart', function (req, res, next) {
    var productId = req.form.productId;
    var savedItem = CustomObjectMgr.getCustomObject(customObject, productId);

    if (!savedItem) {
        res.json({ success: false});
        return next();
    }

    Transaction.wrap(function () {
        var productLineItem = currentBasket.createProductLineItem(productId, currentBasket.defaultShipment);
        productLineItem.setQuantityValue(savedItem.custom.quantity);

        var variantOptions = JSON.parse(savedItem.custom.options || '[]');
        var variationModel = productLineItem.product.variationModel;

        variantOptions.forEach(function (option) {
            var attr = variationModel.getProductVariationAttribute(option.displayName);
            if (attr) {
                variationModel.setSelectedAttributeValue(attr, option.selectedValue);
            }
        });

        if (savedItem.custom.isGiftCertificate && savedItem.custom.giftCertificateType==='email') {
            productLineItem.custom.isGiftCertificate = savedItem.custom.isGiftCertificate;
            productLineItem.custom.giftCertificateType = savedItem.custom.giftCertificateType;
            productLineItem.custom.firstName = savedItem.custom.firstName;
            productLineItem.custom.lastName = savedItem.custom.lastName;
            productLineItem.custom.email = savedItem.custom.email;
        }

        CustomObjectMgr.remove(savedItem);
    });

    res.json({ success: true });
    return next();
});

module.exports = server.exports();
