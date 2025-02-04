'use strict';

var server = require('server');

var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList=require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var collections = require('*/cartridge/scripts/util/collections');
var Resource = require('dw/web/Resource');
var wishlistHelpers = require('*/cartridge/scripts/wishlist/wishlistHelpers');

server.get('ShowProducts', function (req, res, next) {
    var currentCustomer = req.currentCustomer.raw;
    var wishlists = ProductListMgr.getProductLists(currentCustomer, ProductList.TYPE_WISH_LIST);
    var wishlist = wishlists.length > 0 ? wishlists[0] : null;
    var wishlistItems = wishlist ? wishlist.getProductItems() : [];
    var updatedWishlistItems = [];

    if (wishlistItems.length > 0) {
        wishlistItems.forEach(function (item) {
            var product = ProductMgr.getProduct(item.productID);
            var selectedVariantAttributes = {};
            var ProductFactory = require('*/cartridge/scripts/factories/product');
            var productImage = ProductFactory.get({ pid: item.productID });

            if (product.isVariant()) {
                var variationModel = product.getVariationModel();
                var productVariationAttributes = variationModel.getProductVariationAttributes();

                collections.forEach(productVariationAttributes, function (attribute) {
                    var attributeValue = variationModel.getSelectedValue(attribute);
                    if (attributeValue) {
                        selectedVariantAttributes[attribute.getID()] = {
                            displayName: attribute.getDisplayName(),
                            selectedValue: attributeValue.getDisplayValue()
                        };
                    }
                });
            }
            updatedWishlistItems.push({
                productListItem: item,
                imageURL: productImage.images.small[0].url,
                selectedVariantAttributes: selectedVariantAttributes
            });
        });
    }
    res.render('wishlist/show', {
        wishlistItems: updatedWishlistItems,
    });
    next();
});

server.post('Remove', function (req, res, next) {
    var productId = req.form.pid;
    var currentCustomer = req.currentCustomer;
    var success = wishlistHelpers.removeProductFromWishlist(productId,currentCustomer);
    res.json({
        success: success,
        message: success ? Resource.msg('wishlist.toggle.success.remove', 'wishlist', null) : Resource.msg('wishlist.toggle.error', 'wishlist', null)
    });
    next();
});

server.post('ToggleWishlist', function (req, res, next) {
    var productId = req.form.pid;
    var currentCustomer = req.currentCustomer;
    var result=wishlistHelpers.handleWishlistToggle(productId, currentCustomer);
    res.json({
        success: result.success,
        message: result.message
    });
    return next();
});

server.get('CheckWishlist', function (req, res, next) {
    var productId = req.querystring.pid;
    var currentCustomer = req.currentCustomer.raw;

    var isInWishlist = wishlistHelpers.isProductInWishlist(productId, currentCustomer);

    res.json({ isInWishlist: isInWishlist });
    next();
});

module.exports = server.exports();
