'use strict';

var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList=require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var collections = require('*/cartridge/scripts/util/collections');
var Resource = require('dw/web/Resource');

function removeProductFromWishlist(productId, currentCustomer) {
    var success = false;

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
                } else if (itemProduct.ID === productId) {
                    productItem = item;
                    wishlist.removeItem(productItem);
                    success = true;
                }
            });

        }
    });
    return success;
}

// function removeProductFromWishlist(productId, currentCustomer) {
//     var success = false;

//     Transaction.wrap(function () {
//         var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
//         var wishlist = wishlists.length > 0 ? wishlists[0] : null;

//         if (wishlist) {
//             var productItem = null;
//             var items = wishlist.getItems().toArray();

//             items.forEach(function (item) {
//                 var itemProduct = item.product;
//                 if (itemProduct.isVariant() && itemProduct.masterProduct.ID === productId) {
//                     productItem = item;
//                     wishlist.removeItem(productItem);
//                     success = true;
//                 } else if (itemProduct.ID === productId) {
//                     productItem = item;
//                     wishlist.removeItem(productItem);
//                     success = true;
//                 }
//             });
//             if (success) {
//                 responseMessage = Resource.msg('wishlist.remove.success', 'wishlist', null);
//             }
//         }else {
//             responseMessage = Resource.msg('wishlist.error', 'wishlist', null);
//         }
//     });
//     return { success: success, message: responseMessage };
// }


function handleWishlistToggle(productId, currentCustomer) {
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
            var removed = removeProductFromWishlist(productId, currentCustomer);
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
                        var newProductItem = wishlist.createProductItem(variantProduct);
                    } else{
                        var newProductItem = wishlist.createProductItem(variantProduct);
                    }
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

// function isProductInWishlist(productId, customer) {
//     var isInWishlist = false;

//     Transaction.wrap(function () {
//         var wishlists = ProductListMgr.getProductLists(customer, ProductList.TYPE_WISH_LIST);
//         var wishlist = wishlists && wishlists.length > 0 ? wishlists[0] : null;

//         if (wishlist) {
//             var items = wishlist.getItems().toArray();
//             items.forEach(function (item) {
//                 var itemProduct = item.product;
//                 if (itemProduct.isVariant() && itemProduct.masterProduct.ID === productId) {
//                     isInWishlist = true;
//                 }
//             });
//         }
//     });
//     return isInWishlist;
// }

function isProductInWishlist(productId, customer) {
    var isInWishlist = false;

    Transaction.wrap(function () {
        var wishlists = ProductListMgr.getProductLists(customer, ProductList.TYPE_WISH_LIST);
        var wishlist = wishlists && wishlists.length > 0 ? wishlists[0] : null;

        if (wishlist) {
            var items = wishlist.getItems().toArray();
            items.forEach(function (item) {
                var itemProduct = item.product;
                if (itemProduct.isVariant() && itemProduct.masterProduct.ID === productId) {
                    isInWishlist = true;
                }else if (itemProduct.ID === productId){
                    isInWishlist = true;
                }
            });
        }
    });

    return isInWishlist;
}

module.exports = {
    removeProductFromWishlist:removeProductFromWishlist,
    handleWishlistToggle:handleWishlistToggle,
    isProductInWishlist: isProductInWishlist
};
