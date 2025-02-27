'use strict';

var server = require('server');
server.extend(module.superModule);

var wishlistHelper = require('*/cartridge/scripts/wishlist/wishlistHelpers');

// server.append('Show', function (req, res, next) {
//     var viewData = res.getViewData();

//     if (viewData.product) {
//         var productId = viewData.product.id;
//         var currentCustomer = req.currentCustomer.raw;

//         viewData.isWishlisted = wishlistHelper.isProductInWishlist(productId, currentCustomer);

//         res.setViewData(viewData);
//     }
//     next();
// });

server.append('Show', function (req, res, next) {
    var viewData = res.getViewData();
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var wishlistHelper = require('*/cartridge/scripts/wishlist/wishlistHelpers');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');

    // Ensure product exists in viewData
    if (viewData.product) {
        var productId = viewData.product.id;
        var currentCustomer = req.currentCustomer.raw;

        // Check if product is in the wishlist
        viewData.isWishlisted = wishlistHelper.isProductInWishlist(productId, currentCustomer);

        // Fetch Ratings & Reviews Data
        var ratingsAndReviews = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', productId);
        var reviews = [];

        if (ratingsAndReviews && ratingsAndReviews.custom.Review) {
            reviews = JSON.parse(ratingsAndReviews.custom.Review);
        }

        // Add ratings and reviews to viewData
        viewData.ratingsAndReviews = ratingsAndReviews;
        viewData.reviews = reviews;

        // Update viewData
        res.setViewData(viewData);
    }

    next();
});


// server.append('Show', cache.applyPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
//     var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
//     var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
//     var ratingsAndReviewsId =req.querystring.pid;
//     var ratingsAndReviews = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', ratingsAndReviewsId);
//     var reviews = [];
//     if (ratingsAndReviews && ratingsAndReviews.custom.Review) {
//         reviews = JSON.parse(ratingsAndReviews.custom.Review);
//     }
//     res.render(showProductPageHelperResult.template, {
//         ratingsAndReviews: ratingsAndReviews,
//         reviews: reviews
//     });
//     next();
// }, pageMetaData.computedPageMetaData);

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
