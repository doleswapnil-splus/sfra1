
'use strict';

var server = require('server');
server.extend(module.superModule);

server.append('Show', function (req, res, next) {
    var wishlistHelper = require('*/cartridge/scripts/wishlist/wishlistHelpers');
    var viewData = res.getViewData();

    if (viewData.product) {
        var productId = viewData.product.id;
        var currentCustomer = req.currentCustomer.raw;

        viewData.isWishlisted = wishlistHelper.isProductInWishlist(productId, currentCustomer);

        res.setViewData(viewData);
    }
    next();
});

module.exports = server.exports();
