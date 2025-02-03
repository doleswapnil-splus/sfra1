'use strict';

var server = require('server');

var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList=require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var collections = require('*/cartridge/scripts/util/collections');
var Resource = require('dw/web/Resource');
var wishlistHelpers = require('*/cartridge/scripts/wishlist/wishlistHelpers');

// server.post('Remove', function (req, res, next) {
//     var productId = req.form.pid;
//     var currentCustomer = req.currentCustomer;
//     var result = wishlistHelpers.removeProductFromWishlist(productId,currentCustomer);
//     if (result.success) {
//         res.json({
//             success: true,
//             message: result.message
//         });
//     } else {
//         res.json({
//             success: false,
//             message: result.message
//         });
//     }
//     next();
// });
server.get('ShowProducts', function (req, res, next) {
    var currentCustomer = req.currentCustomer.raw;
    if (currentCustomer) {
        var wishlists = ProductListMgr.getProductLists(currentCustomer, ProductList.TYPE_WISH_LIST);
        var wishlist = wishlists.length > 0 ? wishlists[0] : null;
        var wishlistItems = wishlist ? wishlist.getProductItems() : [];
        var updatedWishlistItems = [];
        var iterator = wishlistItems.iterator();

        while (iterator.hasNext()) {
            var item = iterator.next();
            var product = ProductMgr.getProduct(item.productID);
            var selectedVariantAttributes = {};
            var ProductFactory = require('*/cartridge/scripts/factories/product');
            var product1 = ProductFactory.get({pid: item.productID});

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
                imageURL: product1.images.small[0].url,
                selectedVariantAttributes: selectedVariantAttributes
            });
        }
        res.render('wishlist/show', {
            wishlistItems: updatedWishlistItems,
        });
    }
    next();
});

server.post('Remove', function (req, res, next) {
    var productId = req.form.pid;
    var currentCustomer = req.currentCustomer;
    var success = wishlistHelpers.removeProductFromWishlist(productId,currentCustomer);
    res.json({
        success: success,
        message: success ? 'Product removed successfully' : 'Error: Unable to remove product from wishlist.'
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
