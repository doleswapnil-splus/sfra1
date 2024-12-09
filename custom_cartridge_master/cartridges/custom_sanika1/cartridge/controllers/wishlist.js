'use strict';

var server = require('server');
var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList=require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var collection = require('*/cartridge/scripts/util/collections');

function getWishlistForAuthenticatedUser(req, res) {
    var collections = require('*/cartridge/scripts/util/collections');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var ProductList = require('dw/customer/ProductList');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);

    var currentCustomer = req.currentCustomer.raw;
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
        addToCartUrl: showProductPageHelperResult.addToCartUrl
    });
}
server.get('ShowProducts', function (req, res, next) {

    var currentCustomer = req.currentCustomer;
    
    if (currentCustomer.raw.authenticated) {
        getWishlistForAuthenticatedUser(req, res, currentCustomer);
       
    }else{
        getWishlistForAuthenticatedUser(req, res, currentCustomer);

    }
    
    next();
});
function removeProductFromWishlist(req, res) {
    var productId = req.form.pid; 
    var currentCustomer = req.currentCustomer;
        Transaction.wrap(function () {
            var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
            var wishlist = wishlists.length > 0 ? wishlists[0] : null;

            if (wishlist) {
                var productItem = null;
                var items = wishlist.getItems().toArray();

                items.forEach(function (item) {
                    if (item.productID === productId) {
                        productItem = item;
                    }
                });
                if (productItem) {
                    wishlist.removeItem(productItem);
                }
            }
        });
        res.render('wishlist/success', {
            successMessage: 'Product has been removed from your wishlist.'
        });
    
}
server.post('Remove', function (req, res, next) {
    var currentCustomer = req.currentCustomer;
    if (currentCustomer.raw.authenticated) {
        removeProductFromWishlist(req, res, currentCustomer);
       
    }else{
        removeProductFromWishlist(req, res, currentCustomer);

    }
    next();
});
function handleWishlistToggle(req, res, currentCustomer) {
    var productId = req.form.pid; 
    var currentCustomer = req.currentCustomer;
    
    var product = ProductMgr.getProduct(productId);

    if (product) {
        var variantProduct = null; 
        if (product.master) {
            var variationModel = product.getVariationModel();
            var variants = variationModel.getVariants();

            if (variants.length > 0) {
                variantProduct = variants.toArray()[0]; 
            }
        } else {
            variantProduct = product;
        }

        if (variantProduct) {
            Transaction.wrap(function () {
                var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
                var wishlist = wishlists.length > 0 ? wishlists[0] : null;

                if (!wishlist) { 
                    wishlist = ProductListMgr.createProductList(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
                } else {
                    var productItem = null;
                    var items = wishlist.getItems().toArray();
                    items.forEach(function (item) {
                        if (item.productID === variantProduct.ID) {
                            productItem = item;
                        }
                    });
                    if (productItem) {
                        wishlist.removeItem(productItem);
                        res.json({
                            success: true,
                            message: 'Product Removed from Wishlist'
                        });
                    } else {
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
                        res.json({
                            success: true,
                            message: 'Product Added to Wishlist'
                        });
                    }
                }
            });
        } else {
            res.json({
                success: false,
                message: 'No variant product could be found for the selected master product.'
            });
        }
    } else {
        res.json({
            success: false,
            message: 'The product could not be found.'
        });
    }
}
server.post('ToggleWishlist', function (req, res, next) {
    var currentCustomer = req.currentCustomer;
    if (currentCustomer.raw.authenticated) {
        handleWishlistToggle(req, res, currentCustomer);
    } else {
        handleWishlistToggle(req, res, currentCustomer);
    }
    next();
});
module.exports = server.exports();

