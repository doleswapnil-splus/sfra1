
'use strict';
/**
 * @namespace Product
 */
var server = require('server');
var cache = require('*/cartridge/scripts/middleware/cache');
var consentTracking = require('*/cartridge/scripts/middleware/consentTracking');
var pageMetaData = require('*/cartridge/scripts/middleware/pageMetaData');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
server.extend(module.superModule);
server.append('Show',function (req, res, next) {
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
}, pageMetaData.computedPageMetaData);
module.exports = server.exports();
