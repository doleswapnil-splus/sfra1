'use strict';

var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

var properties = function () {
   return {
        wishlistAddSuccess: Resource.msg('wishlist.toggle.success.add', 'wishlist', null),
        wishlistRemoveSuccess: Resource.msg('wishlist.toggle.success.remove', 'wishlist', null),
        wishlistToggleError: Resource.msg('wishlist.toggle.error', 'wishlist', null),
        wishlistNoProduct: Resource.msg('wishlist.toggle.error.noProduct', 'wishlist', null),
        wishlistAddButton: Resource.msg('wishlist.toggle.button.add', 'wishlist', null),
        wishlistRemoveButton: Resource.msg('wishlist.toggle.button.remove', 'wishlist', null)
    }
};

var urls = function () {
    return {
        SubmitReviewUrl: URLUtils.url('SubmitReview-Start').toString()
    }
};

module.exports = {
    properties : properties,
    urls:urls
}
