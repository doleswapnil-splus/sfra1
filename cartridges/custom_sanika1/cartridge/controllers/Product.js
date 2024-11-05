
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

server.replace('Show', cache.applyPromotionSensitiveCache, consentTracking.consent, function (req, res, next) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);

    //var ratingsAndReviewsId = showProductPageHelperResult.product.ID; 
    var ratingsAndReviewsId =req.querystring.pid; 
    // Get the custom object based on the product ID
    var ratingsAndReviews = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', ratingsAndReviewsId);
    var reviews = [];

    // Check if the custom object exists and extract reviews if it does
    if (ratingsAndReviews && ratingsAndReviews.custom.Review) {
       reviews = JSON.parse(ratingsAndReviews.custom.Review);
    }
    var productType = showProductPageHelperResult.product.productType;
    if (!showProductPageHelperResult.product.online && productType !== 'set' && productType !== 'bundle') {
        res.setStatusCode(404);
        res.render('error/notFound');
    } else {
        var pageLookupResult = productHelper.getPageDesignerProductPage(showProductPageHelperResult.product);

        if ((pageLookupResult.page && pageLookupResult.page.hasVisibilityRules()) || pageLookupResult.invisiblePage) {
            
            res.cachePeriod = 0; 
        }
        if (pageLookupResult.page) {
            res.page(pageLookupResult.page.ID, {}, pageLookupResult.aspectAttributes);
        } else {
            res.render(showProductPageHelperResult.template, {
                product: showProductPageHelperResult.product,
                addToCartUrl: showProductPageHelperResult.addToCartUrl,
                resources: showProductPageHelperResult.resources,
                breadcrumbs: showProductPageHelperResult.breadcrumbs,
                canonicalUrl: showProductPageHelperResult.canonicalUrl,
                schemaData: showProductPageHelperResult.schemaData,
                ratingsAndReviews: ratingsAndReviews,
                 reviews:reviews
            });
        }
    }
    next();
}, pageMetaData.computedPageMetaData);


module.exports = server.exports();