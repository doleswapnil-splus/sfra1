
'use strict';

var server = require('server');

server.post('Start', function(req, res, next) {
    var CustomObjectMgr = require('dw/object/CustomObjectMgr');
    var Resource = require('dw/web/Resource');
    var Transaction = require('dw/system/Transaction');
    var ProductId =req.form.productId;
    var orderId = req.form.orderId;
    var reviewText = req.form.review;
    var rating = req.form.rating;
    var email=req.form.email;
    var reviews = [];
    var customObject = "Ratings_And_Reviews";

    Transaction.wrap(function() {
        var ratingsObject = CustomObjectMgr.getCustomObject(customObject, ProductId);
        var hasReviewed = false;
        if (ratingsObject) {
            reviews = JSON.parse(ratingsObject.custom.Review);
            hasReviewed = reviews.some(review => review.email === email);
        }
        if (hasReviewed) {
            res.json({ success: false, message:Resource.msg('review.already.submitted.message', 'ratingsAndReview', null) });
        } else {
            if (!ratingsObject) {
                ratingsObject = CustomObjectMgr.createCustomObject(customObject, ProductId);
                ratingsObject.custom.ProductId = ProductId;
                ratingsObject.custom.Avarage_Ratings=5;
                ratingsObject.custom.Review = JSON.stringify([]);
            }
            reviews = JSON.parse(ratingsObject.custom.Review);
            reviews.push({
                orderId: orderId,
                review: reviewText,
                rating: rating,
                email:email
            });
            ratingsObject.custom.Review = JSON.stringify(reviews);
            res.json({ success: true, message: Resource.msg('review.success.message', 'ratingsAndReview', null) });
        };
    });
    return next();
});

module.exports = server.exports();
