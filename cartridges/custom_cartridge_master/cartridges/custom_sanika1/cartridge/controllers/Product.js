
'use strict';

/**
 * @namespace Product
 */
var server = require('server');
server.extend(module.superModule);

server.append('Show',function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
    var ratingsAndReviewsId =req.querystring.pid;
    var ratingsAndReviews = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', ratingsAndReviewsId);
    var reviews = [];
    if (ratingsAndReviews && ratingsAndReviews.custom.Review) {
        reviews = JSON.parse(ratingsAndReviews.custom.Review);
    }
    res.render(showProductPageHelperResult.template, {
        ratingsAndReviews: ratingsAndReviews,
        reviews: reviews
    });
    next();
});

module.exports = server.exports();
