'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var wishlistHelper = require('*/cartridge/scripts/wishlist/wishlistHelpers');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
    var productId = req.querystring.pid; //master
    var currentCustomer = req.currentCustomer.raw;
    var isWishlisted = wishlistHelper.isProductInWishlist(productId, currentCustomer);

    res.render(showProductPageHelperResult.template, {
        isWishlisted: isWishlisted
    });

    next();
});

module.exports = server.exports();
