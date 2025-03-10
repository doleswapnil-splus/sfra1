'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var SavedProductsHelper = require('*/cartridge/scripts/SavedProductsHelper'); // Helper script
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Resource = require('dw/web/Resource');
var customObject = "SavedForLater";
var currentBasket = BasketMgr.getCurrentBasket();

server.post('SaveItem', function (req, res, next) {
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
        SavedProductsHelper.saveForLater(currentBasket, productId); //Remove item from cart
    });

    res.json({ success: true });
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

        CustomObjectMgr.remove(savedItem);
    });

    res.json({ success: true });
    return next();
});

module.exports = server.exports();
