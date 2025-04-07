'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

function productService(productID) {
    var ProductService = LocalServiceRegistry.createService('ProductService', {
        createRequest: function (svc, productID) {
            svc.setRequestMethod('GET');
            svc.addHeader('Content-Type', 'application/json');
            svc.setURL(svc.getConfiguration().credential.URL + '?productId=' + productID);
            return svc;
        },
        parseResponse: function (svc, response) {
            return response.text;
        }
    });

    return ProductService.call(productID);
}

module.exports = {
    productService: productService
};
