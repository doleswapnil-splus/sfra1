'use strict';

var server = require('server');
var ProductService = require('*/cartridge/scripts/services/ProductRatingService');
var ProductMgr = require('dw/catalog/ProductMgr');

// server.get('TestServiceCall', function (req, res, next) {

//     var response = ProductService.productService();

//     if (!response.ok) {
//         res.json({
//             error: true,
//             message: 'Failed to fetch product details'
//         });
//     } else {
//         res.json(response.object);
//     }

//     return next();
// });

server.get('GetProduct', function (req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    //var ProductFactory = require('*/cartridge/scripts/factories/product');
    var productId ='701644345860M';

    var ratingObject = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', productId);
    var reviews = ratingObject ? JSON.parse(ratingObject.custom.Review || '[]') : [];

    res.json(reviews);
    return next();
});

module.exports = server.exports();
