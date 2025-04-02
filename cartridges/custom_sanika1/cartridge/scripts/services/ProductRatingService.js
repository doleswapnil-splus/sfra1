'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

function productService() {
    var ProductService = LocalServiceRegistry.createService('ProductService', {
        createRequest: function (svc, productID) {
            svc.setRequestMethod('GET');
            svc.addHeader('Content-Type', 'application/json');
            return svc;
        },
        parseResponse: function (svc, response) {
            return response.text;
        }
    });
    return ProductService.call();
}

/*function getProductDetailsWithReviews(productId) {
    var productResponse = ProductService.call(productId);

    var productData = productResponse.object;

    var ratingObject = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', productId);
    var reviews = ratingObject ? JSON.parse(ratingObject.custom.Review || '[]') : [];

    return {
        ok: true,
        object: {
            id: productData.id,
            name: productData.name,
            price: productData.price || 'N/A',
            reviews: reviews
        }
    };
}*/

module.exports = {
    productService: productService
};
