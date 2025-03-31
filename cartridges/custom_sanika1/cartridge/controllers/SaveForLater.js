
'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var Transaction = require('dw/system/Transaction');
var SavedProductsHelper = require('*/cartridge/scripts/SavedProductsHelper');
var Resource = require('dw/web/Resource');
var currentBasket = BasketMgr.getCurrentBasket();
var CartModel = require('*/cartridge/models/cart');
var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList = require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');
var renderTemplateHelper = require('*/cartridge/scripts/renderTemplateHelper');

server.post('SaveItem', function (req, res, next) {
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');
    var currentCustomer = req.currentCustomer.raw;

    if (!currentBasket) {
        res.json({ success: false, error: Resource.msg('CurrentBasket.Error', 'saveForLater', null) });
        return next();
    }

    var productId = req.form.productId;
    if (!productId) {
        res.json({ success: false, error: Resource.msg('Invalid.ProductId', 'saveForLater', null) });
        return next();
    }

    var basketItems = currentBasket.getAllProductLineItems();
    var isGiftCertificate = false;
    var giftCertificateType = '';
    var firstName = '';
    var lastName = '';
    var email = '';

    for (var j = 0; j < basketItems.length; j++) {
        var pli = basketItems[j];

        if (pli.productID === productId) {
            isGiftCertificate = pli.custom && 'isGiftCertificate' in pli.custom ? pli.custom.isGiftCertificate : false;
            giftCertificateType = pli.custom && 'giftCertificateType' in pli.custom ? pli.custom.giftCertificateType : '';
            firstName = pli.custom && 'firstName' in pli.custom ? pli.custom.firstName : '';
            lastName = pli.custom && 'lastName' in pli.custom ? pli.custom.lastName : '';
            email = pli.custom && 'email' in pli.custom ? pli.custom.email : '';
            break;
        }
    }

    var savedItem = Transaction.wrap(function () {
        return SavedProductsHelper.saveForLater(
            currentBasket, currentCustomer, productId, isGiftCertificate, giftCertificateType, firstName, lastName, email
        );
        basketCalculationHelpers.calculateTotals(currentBasket);
    });

    if (!savedItem) {
        res.json({ success: false});
        return next();
    }

    var savedItems = SavedProductsHelper.getSavedItems(currentCustomer);
    var savedForLaterCards = renderTemplateHelper.getRenderedHtml({ savedItems: savedItems }, 'cart/saveForLater');
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
    var currentCustomer = req.currentCustomer.raw;

    if (!productId) {
        res.json({ success: false, message: Resource.msg('Invalid.ProductId', 'saveForLater', null) });
        return next();
    }

    Transaction.wrap(function () {

        var saveForLaterLists = ProductListMgr.getProductLists(currentCustomer, ProductList.TYPE_CUSTOM_1);
        var saveForLaterList = saveForLaterLists.length > 0 ? saveForLaterLists[0] : null;

        if (!saveForLaterList) {
            res.json({ success: false, message: Resource.msg('saveForLater.list.not.found', 'saveForLater', null) });
            return next();
        }

        var savedItems = saveForLaterList.getProductItems();
        var productItemToRemove = null;


        savedItems.toArray().forEach(function (item) {
            if (item.product.ID === productId) {
                productItemToRemove = item;
                saveForLaterList.removeItem(productItemToRemove);
            }
        });
    });

    var savedItems = SavedProductsHelper.getSavedItems(currentCustomer);
    var savedForLaterCards = renderTemplateHelper.getRenderedHtml({ savedItems: savedItems }, 'cart/saveForLater');
    res.json({ success: true, savedForLaterCards: savedForLaterCards });

    return next();
});

server.post('AddToCart', function (req, res, next) {
    var currentCustomer = req.currentCustomer.raw;

    if (!currentBasket) {
        res.json({ success: false, error: Resource.msg('CurrentBasket.Error', 'saveForLater', null) });
        return next();
    }

    var productId = req.form.productId;
    if (!productId) {
        res.json({ success: false, error: Resource.msg('Invalid.ProductId', 'saveForLater', null) });
        return next();
    }

    var savedForLaterLists = ProductListMgr.getProductLists(currentCustomer, ProductList.TYPE_CUSTOM_1);
    var savedForLaterList = savedForLaterLists.length > 0 ? savedForLaterLists[0] : null;
    var savedItem = null;

    if (savedForLaterList) {
        var productItems = savedForLaterList.getProductItems();
        for (var i = 0; i < productItems.length; i++) {
            if (productItems[i].productID === productId) {
                savedItem = productItems[i];
                break;
            }
        }
    }

    if (!savedItem) {
        res.json({ success: false, error: Resource.msg('product.not.found', 'saveForLater', null) });
        return next();
    }

    Transaction.wrap(function () {
        var product = ProductMgr.getProduct(savedItem.productID);
        if (!product) {
            res.json({ success: false, error:Resource.msg('product.not.found', 'saveForLater', null) });
            return next();
        }

        var productLineItem = currentBasket.createProductLineItem(productId, currentBasket.defaultShipment);
        productLineItem.setQuantityValue(savedItem.quantityValue);

        // GC
        if (savedItem.custom.isGiftCertificate) {
            productLineItem.custom.isGiftCertificate = savedItem.custom.isGiftCertificate;
            productLineItem.custom.giftCertificateType = savedItem.custom.giftCertificateType;
            productLineItem.custom.firstName = savedItem.custom.firstName;
            productLineItem.custom.lastName = savedItem.custom.lastName;
            productLineItem.custom.email = savedItem.custom.email;
        }

        if (product.isVariant()) {
            var variationModel = product.getVariationModel();
            if (variationModel) {
                var productVariationAttributes = variationModel.getProductVariationAttributes();

                productVariationAttributes.toArray().forEach(function (attribute) {
                    var attributeValue = variationModel.getSelectedValue(attribute);
                    if (attributeValue) {
                        variationModel.setSelectedAttributeValue(attribute.ID, attributeValue.ID);
                    }
                });
            }
        }
        savedForLaterList.removeItem(savedItem); // Remove item from Save for Later list
    });

    var updatedBasket = new CartModel(currentBasket);
    var savedItems = SavedProductsHelper.getSavedItems(currentCustomer);
    var savedForLaterCards = renderTemplateHelper.getRenderedHtml({ savedItems: savedItems }, 'cart/saveForLater');

    res.json({
        success: true,
        cartData: updatedBasket,
        savedForLaterCards: savedForLaterCards
    });

    return next();
});

module.exports = server.exports();
