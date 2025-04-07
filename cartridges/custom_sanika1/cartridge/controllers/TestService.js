'use strict';

var server = require('server');

server.get('GetProduct', function (req, res, next) {
    var Resource = require('dw/web/Resource');
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');

    var productId = req.querystring.productId;

    if (!productId) {
        res.json({ error: Resource.msg('service.no.productId', 'service', null)});
        return next();
    }

    var ratingObject = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', productId);

    if (!ratingObject) {
        res.json({ message: Resource.msg('service.no.rating', 'service', null)});
        return next();
    }

    var reviews = ratingObject ? JSON.parse(ratingObject.custom.Review) : [];

    res.json(reviews);
    return next();
});

module.exports = server.exports();
