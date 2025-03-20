
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


server.post('SaveItem', function (req, res, next) {
    var CartModel = require('*/cartridge/models/cart');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
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
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    var savedItems = [];
    var savedIterator = CustomObjectMgr.getAllCustomObjects('SavedForLater');

    while (savedIterator.hasNext()) {
        var savedItem = savedIterator.next();
        savedItems.push({
            productId: savedItem.custom.ProductId,
            name: savedItem.custom.name,
            price: savedItem.custom.price,
            image: savedItem.custom.image,
            quantity: savedItem.custom.quantity,
            options: JSON.parse(savedItem.custom.options || '[]'),
            uuId: savedItem.custom.uuId,
            isGiftCertificate:savedItem.custom.isGiftCertificate,
            giftCertificateType:savedItem.custom.giftCertificateType,
            firstName:savedItem.custom.firstName,
            lastName:savedItem.custom.lastName,
            email:savedItem.custom.email
        });
    }
    var savedForLaterCards = renderTemplateHelper.getRenderedHtml({savedItems: savedItems }, 'cart/saveForLater')


    var cartModel = new CartModel(currentBasket);
    var cartItems = cartModel.items || [];
    var cartTotals = cartModel.totals || {};
    var updatedGrandTotal = cartTotals.grandTotal ? cartTotals.grandTotal : '0.00';
    var basketModel = new CartModel(currentBasket);
    res.json({
        success: true,
        cartData: basketModel,
        savedForLaterCards: savedForLaterCards
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
    var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');
    var productId = req.form.productId;

    if (!productId) {
        res.json({ success: false, error: Resource.msg('Invalid.ProductId', 'saveForLater', null) });
        return next();
    }

    var savedItem = CustomObjectMgr.getCustomObject('SavedForLater', productId);
    if (!savedItem) {
        res.json({ success: false, error: 'Item not found in Save for Later' });
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

        if (savedItem.custom.isGiftCertificate && savedItem.custom.giftCertificateType === 'email') {
            productLineItem.custom.isGiftCertificate = savedItem.custom.isGiftCertificate;
            productLineItem.custom.giftCertificateType = savedItem.custom.giftCertificateType;
            productLineItem.custom.firstName = savedItem.custom.firstName;
            productLineItem.custom.lastName = savedItem.custom.lastName;
            productLineItem.custom.email = savedItem.custom.email;
        }

        CustomObjectMgr.remove(savedItem); // Remove item from Save for Later
    });

    // Generate updated cart data
    var updatedBasket = new CartModel(currentBasket);
    var savedItems = [];
    var savedIterator = CustomObjectMgr.getAllCustomObjects('SavedForLater');

    while (savedIterator.hasNext()) {
        var item = savedIterator.next();
        savedItems.push({
            productId: item.custom.ProductId,
            name: item.custom.name,
            price: item.custom.price,
            image: item.custom.image,
            quantity: item.custom.quantity,
            options: JSON.parse(item.custom.options || '[]'),
            uuId: savedItem.custom.uuId,
            isGiftCertificate: item.custom.isGiftCertificate,
            giftCertificateType: item.custom.giftCertificateType,
            firstName: item.custom.firstName,
            lastName: item.custom.lastName,
            email: item.custom.email
        });
    }

    var savedForLaterCards = savedItems.length > 0
       ? renderTemplateHelper.getRenderedHtml({ savedItems: savedItems }, 'cart/saveForLater')
        : '<p>Your Saved for Later section is empty.</p>';

    res.json({
        success: true,
        cartData: updatedBasket,
        savedForLaterCards: savedForLaterCards
    });

    return next();
});


module.exports = server.exports();
