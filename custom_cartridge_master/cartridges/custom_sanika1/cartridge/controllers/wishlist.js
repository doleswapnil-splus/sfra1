'use strict';

var server = require('server');
var ProductListMgr = require('dw/customer/ProductListMgr');
var ProductList=require('dw/customer/ProductList');
var ProductMgr = require('dw/catalog/ProductMgr');
var Transaction = require('dw/system/Transaction');
var URLUtils = require('dw/web/URLUtils');
var collection = require('*/cartridge/scripts/util/collections');

// function handleAddToWishlist(req, res, currentCustomer) {
//     var productId = req.form.pid; 
//     var currentCustomer = req.currentCustomer;
       
//         var product = ProductMgr.getProduct(productId);

//         if (product) {
//             var variantProduct = null; 
//             if (product.master) {
//                 var variationModel = product.getVariationModel();
//                 var variants = variationModel.getVariants();

//                 if (variants.length > 0) {
//                     variantProduct = variants.toArray()[0]; 
//                 }
//             } else {
              
//                 variantProduct = product;
//             }

//             if (variantProduct) {
//                 Transaction.wrap(function () {
//                     var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
//                     var wishlist = wishlists.length > 0 ? wishlists[0] : null;

//                     if (!wishlist) {
//                         wishlist = ProductListMgr.createProductList(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
//                     }

//                     var idd =variantProduct.ID;
//                     var productItemm = wishlist.getItem(variantProduct.ID);

//                     if (productItemm) {
//                         res.json({
//                             success: false,
//                             message: 'Product already present in your wishlist.'
//                         });
//                         return;
//                     }
//                     var productItem = wishlist.createProductItem(variantProduct);
//                     var optionModel = variantProduct.getOptionModel();
//                     if (optionModel) {
//                         var options = optionModel.getOptions();
//                         options.toArray().forEach(function (option) {
//                             var defaultValue = optionModel.getSelectedOptionValue(option.getID());
//                             if (defaultValue) {
//                                 productItem.setOptionValue(option.getID(), defaultValue.getID());
//                             }
//                         });
//                     }
//                 });

//                 res.json({
//                     success: true,
//                     message: 'Product is added'
//                 });
//             } else {
//                 res.json({
//                     success: false,
//                     message: 'No variant product could be found for the selected master product.'
//                 });
//             }
//         } else {
//             res.json({
//                 success: false,
//                 message: 'The product could not be found.'
//             });
//         }
    
// }
// server.post('AddToWhishlist', function (req, res, next) {
//     var currentCustomer = req.currentCustomer;
//     if (currentCustomer.raw.authenticated) {
//         handleAddToWishlist(req, res, currentCustomer);
       
//     }else{
//         handleAddToWishlist(req, res, currentCustomer);

//     }
//     next();
// });


// function getWishlistForAuthenticatedUser(req, res) {
//     var currentCustomer = req.currentCustomer;
//     var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
//     var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
//     var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
      
//         var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
//         var wishlist = wishlists.length > 0 ? wishlists[0] : null;

      
//         var wishlistItems = wishlist ? wishlist.getProductItems() : [];
//         res.render('wishlist/show', {
//             wishlistItems: wishlistItems,
//             addToCartUrl: showProductPageHelperResult.addToCartUrl
//         });
   
// }

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
            selectedVariantAttributes: selectedVariantAttributes // Add selected variant attributes
        });
    }

    // Pass the updated wishlist items and add-to-cart URL to the ISML template
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
                    // If the wishlist does not exist, create a new wishlist for the customer
                    wishlist = ProductListMgr.createProductList(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
                } else {
                    // If wishlist exists
                    var productItem = null;
                    var items = wishlist.getItems().toArray();

                    // Check if the product already exists in the wishlist
                    items.forEach(function (item) {
                        if (item.productID === variantProduct.ID) {
                            productItem = item;
                        }
                    });

                    if (productItem) {
                        // If the product exists in the wishlist, remove it
                        wishlist.removeItem(productItem);
                        res.json({
                            success: true,
                            message: 'Product Removed from Wishlist'
                        });
                    } else {
                        // If the product does not exist in the wishlist, add it
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





// function getWishlistForAuthenticatedUser(req, res) {
//     var collections = require('*/cartridge/scripts/util/collections');
//     var currentCustomer = req.currentCustomer;
//     var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
//     var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
//     var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
      
//         var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
//         var wishlist = wishlists.length > 0 ? wishlists[0] : null;
//         var wishlistItems = wishlist ? wishlist.getProductItems() : [];
//         var updatedWishlistItems = [];
// var iterator = wishlistItems.iterator();

// while (iterator.hasNext()) {
//     var item = iterator.next();
//     var product = ProductMgr.getProduct(item.productID);
//     var defaultValue;
//                     var optionModel = product.getOptionModel();
//                     if (optionModel) {
//                         var options = optionModel.getOptions();
//                         options.toArray().forEach(function (option) {
//                             var a = option.getID();
//                         defaultValue = optionModel.getSelectedOptionValue(option.getID());
//                         });
//                     }
//     var test =item.productID;
//     var masterProductID;

//     // Determine the master product ID
//     if (product && product.variant) {
//         masterProductID = product.getMasterProduct().ID;
//     } else {
//         masterProductID = product.ID; // If not a variant, use its own ID
//     }

//     // Add the item and the masterProductID to the array
//     updatedWishlistItems.push({
//         productListItem: item, // Original ProductListItem
//         masterProductID: masterProductID // Additional property
//     });
// }

// // Render the ISML with updated items
// res.render('wishlist/show', {
//     wishlistItems: updatedWishlistItems,
//     addToCartUrl: showProductPageHelperResult.addToCartUrl // Example of passing additional data
// });

// // Use `updatedWishlistItems` for rendering or further processing

//         res.render('wishlist/show', {
//             wishlistItems: wishlistItems,
//             addToCartUrl: showProductPageHelperResult.addToCartUrl
//         });
   
// }














//////////////////////////////////////////////

// function getWishlistForAuthenticatedUser(req, res) {
//     var collections = require('*/cartridge/scripts/util/collections');
//     var currentCustomer = req.currentCustomer;
//     var csrfProtection = require('*/cartridge/scripts/middleware/csrf');
//     var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
//     var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
      
//         var wishlists = ProductListMgr.getProductLists(currentCustomer.raw, ProductList.TYPE_WISH_LIST);
//         var wishlist = wishlists.length > 0 ? wishlists[0] : null;
//         var wishlistItems = wishlist ? wishlist.getProductItems() : [];
//         var updatedWishlistItems = [];
// var iterator = wishlistItems.iterator();

// while (iterator.hasNext()) {
//     var item = iterator.next();
//     var product = ProductMgr.getProduct(item.productID);
//     var defaultValue;
//                     var optionModel = product.getOptionModel();
//                     if (optionModel) {
//                         var options = optionModel.getOptions();
//                         options.toArray().forEach(function (option) {
//                             var a = option.getID();
//                         defaultValue = optionModel.getSelectedOptionValue(option.getID());
//                         });
//                     }
//     var test =item.productID;
//     var masterProductID;

   
//     if (product && product.variant) {
//         masterProductID = product.getMasterProduct().ID;
//     } else {
//         masterProductID = product.ID; 
//     }

   
//     updatedWishlistItems.push({
//         productListItem: item, // Original ProductListItem
//         masterProductID: masterProductID // Additional property
//     });
// }

// // Render the ISML with updated items
// res.render('wishlist/show', {
//     wishlistItems: updatedWishlistItems,
//     addToCartUrl: showProductPageHelperResult.addToCartUrl // Example of passing additional data
// });

// // Use `updatedWishlistItems` for rendering or further processing

//         res.render('wishlist/show', {
//             wishlistItems: wishlistItems,
//             addToCartUrl: showProductPageHelperResult.addToCartUrl
//         });
   
// }
