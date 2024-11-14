'use strict';

var server = require('server');
var URLUtils = require('dw/web/URLUtils');
var ProductMgr = require('dw/catalog/ProductMgr');
var CustomerMgr = require('dw/customer/CustomerMgr');
var Transaction = require('dw/system/Transaction');

server.post('Add', function (req, res, next) {
    var productId = req.form.productId;
    var product = ProductMgr.getProduct(productId);
    var customer = req.currentCustomer.raw;
    var wishlist = customer.getProfile().getWishlist();

    if (!wishlist) {
        Transaction.wrap(function () {
            wishlist = customer.getProfile().createWishlist();
        });
    }

    Transaction.wrap(function () {
        wishlist.addProduct(product);
    });

    res.json({
        success: true,
        redirectUrl: URLUtils.url('Wishlist-Show').toString()
    });

    next();
});

module.exports = server.exports();
