'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var ProductMgr = require('dw/catalog/ProductMgr');
var WishlistMgr = require('dw/customer/WishlistMgr');
var Transaction = require('dw/system/Transaction');

function addProductToWishlist(productId, customer) {
    var product = ProductMgr.getProduct(productId);
    var wishlist = WishlistMgr.getWishlist(customer);

    if (!wishlist) {
        wishlist = WishlistMgr.createWishlist(customer);
    }

    Transaction.wrap(function () {
        wishlist.addProduct(product);
    });

    return {
        success: true,
        redirectUrl: URLUtils.url('Wishlist-Show').toString()
    };
}

module.exports = {
    addProductToWishlist: addProductToWishlist
};
