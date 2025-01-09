
'use strict';
var server = require('server');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');

server.post('start', function(req, res, next) {
    //var test = req.form;
    //var userId = req.currentCustomer.profile.id; 
    var ProductId =req.form.productId;
    var orderId = req.form.orderId;
    var reviewText = req.form.review; 
    var rating = req.form.rating; 
    var email=req.form.email;

    Transaction.wrap(function() {
        var ratingsObject = CustomObjectMgr.getCustomObject('Ratings_And_Reviews', ProductId);
        var p=ProductId;
        var hasReviewed = false;

        if (ratingsObject) { 
            var reviews = JSON.parse(ratingsObject.custom.Review);
            hasReviewed = reviews.some(review => review.email === email);
        }
        if (hasReviewed) {
            res.json({ success: false, message: 'You have already submitted a review for this product.' });
        }
        else
        {
            if (!ratingsObject) {      
                ratingsObject = CustomObjectMgr.createCustomObject('Ratings_And_Reviews', ProductId);
                ratingsObject.custom.ProductId = ProductId; 
                ratingsObject.custom.Avarage_Ratings = 5; 
                ratingsObject.custom.Review = JSON.stringify([]); 
            }
            
            var reviews = JSON.parse(ratingsObject.custom.Review);
            reviews.push({
                orderId: orderId,
                review: reviewText,
                rating: rating,
                email:email
            });
            
                ratingsObject.custom.Review = JSON.stringify(reviews); 
                res.json({ success: true, message: 'Review submitted successfully!' });
            };
        });    
        return next();
});
module.exports = server.exports();
