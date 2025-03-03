'use strict';

var server = require('server');
server.extend(module.superModule);

var wishlistHelper = require('*/cartridge/scripts/wishlist/wishlistHelpers');

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');

    if (viewData.product) {
        var productId = viewData.product.id;
        var currentCustomer = req.currentCustomer.raw;
        viewData.isWishlisted = wishlistHelper.isProductInWishlist(productId, currentCustomer);
        var ratingsAndReviews = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', productId);
        var reviews = [];

        if (ratingsAndReviews && ratingsAndReviews.custom.Review) {
            reviews = JSON.parse(ratingsAndReviews.custom.Review);
        }

        viewData.ratingsAndReviews = ratingsAndReviews;
        viewData.reviews = reviews;

        res.setViewData(viewData);
    }
    next();
});

server.append('Variation', function (req, res, next) {
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
