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
        wishlistRemoveButton: Resource.msg('wishlist.toggle.button.remove', 'wishlist', null),
        wishlistRemoveError: Resource.msg('wishlist.remove.error', 'wishlist', null),
        wishlistVariantError: Resource.msg('wishlist.variant.error', 'wishlist', null),
        saveForLaterMoved: Resource.msg('saveForLater.item.moved', 'saveForLater', null),
        saveForLaterMovedError: Resource.msg('saveForLater.item.moved.Error', 'saveForLater', null),
        saveForLaterRemovedError: Resource.msg('saveForLater.item.removed.error', 'saveForLater', null),
        AddToCartError: Resource.msg('AddToCart.Error', 'saveForLater', null),
    }
};

var urls = function () {
    return {
        SubmitReviewUrl: URLUtils.url('SubmitReview-Start').toString(),
        InWishlistUrl: URLUtils.url('WishlistHeart-CheckWishlist').toString(),
        SaveForLater:URLUtils.url('SaveForLater-SaveItem').toString(),
        SaveForLaterRemove:URLUtils.url('SaveForLater-Remove').toString(),
        AddToCart:URLUtils.url('SaveForLater-AddToCart').toString()
    }
};

module.exports = {
    properties : properties,
    urls:urls
}
