'use strict';

/**
 * @namespace GiftCertificate
 */

var server = require('server');
var ProductMgr = require('dw/catalog/ProductMgr');
var Site = require('dw/system/Site');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
server.get('Show', function (req, res, next) {
    var productID = req.querystring.pid; // Get product ID from the request
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var showProductPageHelperResult = productHelper.showProductPage(req.querystring, req.pageMetaData);
    var product = ProductMgr.getProduct(productID);
    var amountOptions;
    if (product) {
      
        var specificProductID = 'Gift_Certificate';
        if (product.ID === specificProductID) {
             amountOptions = Site.current.getCustomPreferenceValue('GC_Amount');
        }
        res.render('product/giftCertificate', {
            product: showProductPageHelperResult.product,
            addToCartUrl: showProductPageHelperResult.addToCartUrl,
            resources: showProductPageHelperResult.resources,
            breadcrumbs: showProductPageHelperResult.breadcrumbs,
            canonicalUrl: showProductPageHelperResult.canonicalUrl,
            schemaData: showProductPageHelperResult.schemaData,
            amountOptions: amountOptions,
        });
    } else {
        res.render('error/notFound');
    }
    next();
});
module.exports = server.exports();