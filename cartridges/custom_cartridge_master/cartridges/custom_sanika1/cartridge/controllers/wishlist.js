'use strict';

var server = require('server');
var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList=require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var collections = require('*/cartridge/scripts/util/collections');
var Resource = require('dw/web/Resource');

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
                selectedVariantAttributes: selectedVariantAttributes
            });
        }
        res.render('wishlist/show', {
            wishlistItems: updatedWishlistItems,
        });
    }
    next();
});
// Private method to handle product removal logic
function removeProductFromWishlist(req, currentCustomer) {
    var productId = req.form.pid;
    var success=false;
    Transaction.wrap(function () {
        var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
        var wishlist = wishlists.length > 0 ? wishlists[0] : null;
        if (wishlist) {
            var productItem = null;
            var items = wishlist.getItems().toArray();
            items.forEach(function (item) {
                var itemProduct = item.product;
                if (itemProduct.isVariant() && itemProduct.masterProduct.ID === productId) {
                    productItem = item;
                    wishlist.removeItem(productItem);
                    success = true;
                }
            });
        }
    });
    return success;
}
//remove product from wishlist
server.post('Remove', function (req, res, next) {
    var currentCustomer = req.currentCustomer;
    var isRemoved = removeProductFromWishlist(req,currentCustomer);
    if (isRemoved) {
        res.render('wishlist/success', {
            successMessage:Resource.msg('wishlist.remove.success', 'wishlist', null)
        });
    } else {
        res.render('wishlist/error', {
            errorMessage:Resource.msg('wishlist.remove.error', 'wishlist', null)
        });
    }
    next();
});
//Add/remove product using toggle from pdp or product tile
function handleWishlistToggle(req, currentCustomer) {
    var productId = req.form.pid; // master product ID
    var product = ProductMgr.getProduct(productId);
    var responseMessage = '';
    var success = false;

    if (product) {
        Transaction.wrap(function () {
            var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
            var wishlist = wishlists.length > 0 ? wishlists[0] : null;
            if (!wishlist) {
                wishlist = ProductListMgr.createProductList(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
            }
            var removed = removeProductFromWishlist(req, currentCustomer);
            if (removed) {
                success = true;
                responseMessage=Resource.msg('wishlist.toggle.success.remove', 'wishlist', null);
                return;
            } else {
                var productExists = false;
                var items = wishlist.getItems().toArray();
                items.forEach(function (item) {
                    var itemProduct = item.product;
                    if (itemProduct.isVariant() && itemProduct.masterProduct.ID === productId)  {
                        productExists = true;
                    }
                });
                if (!productExists) {
                    var variantProduct = product;
                    if (product.master) {
                        var variationModel = product.getVariationModel();
                        var variants = variationModel.getVariants();
                        if (variants.length > 0) {
                            variantProduct = variants.toArray()[0];
                        }
                    }
                    var newProductItem = wishlist.createProductItem(variantProduct);
                    var optionModel = variantProduct.getOptionModel();
                    if (optionModel) {
                        var options = optionModel.getOptions();
                        options.toArray().forEach(function (option) {
                            var defaultValue = optionModel.getSelectedOptionValue(option.getID());
                            if (defaultValue) {
                                newProductItem.setOptionValue(option.getID(), defaultValue.getID());
                            }
                        });
                    }
                    success = true;
                    responseMessage =Resource.msg('wishlist.toggle.success.add', 'wishlist', null);
                }
            }
        });
    } else {
        success = false;
        responseMessage =Resource.msg('wishlist.toggle.error.noProduct', 'wishlist', null);
    }
    return { success: success, message: responseMessage };
}
server.post('ToggleWishlist', function (req, res, next) {
    var currentCustomer = req.currentCustomer;
    var result=handleWishlistToggle(req, currentCustomer);
    res.json({
        success: result.success,
        message: result.message
    });
    next();
});

module.exports = server.exports();

