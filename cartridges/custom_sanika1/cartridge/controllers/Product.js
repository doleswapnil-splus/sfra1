// 'use strict';

// var server = require('server');
// server.extend(module.superModule);
// var productId = req.querystring.pid; //master
//     var currentCustomer = req.currentCustomer.raw;

// server.append('Show', function (req, res, next) {
//     var wishlistHelper = require('*/cartridge/scripts/wishlist/wishlistHelpers');

//     var productId = req.querystring.pid; //master
//     var currentCustomer = req.currentCustomer.raw;

//     var isWishlisted = wishlistHelper.isProductInWishlist(productId, currentCustomer);

//     res.render(showProductPageHelperResult.template, {
//         isWishlisted: isWishlisted
//     });
//     next();
// });

// module.exports = server.exports();



'use strict';

var server = require('server');
server.extend(module.superModule);

var URLUtils = require('dw/web/URLUtils');
var wishlistHelper = require('*/cartridge/scripts/wishlist/wishlistHelpers');

server.append('Show', function (req, res, next) {
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
