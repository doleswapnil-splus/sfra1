
/**
 * Get localized messages for the Wishlist feature.
 * @returns {Object} An object containing key-value pairs for localized messages.
 */
function getWishlistMessages() {
    var Resource = require('dw/web/Resource');

    return {
        wishlistAddSuccess: Resource.msg('wishlist.toggle.success.add', 'wishlist', null),
        wishlistRemoveSuccess: Resource.msg('wishlist.toggle.success.remove', 'wishlist', null),
        wishlistToggleError: Resource.msg('wishlist.toggle.error', 'wishlist', null),
        wishlistNoProduct: Resource.msg('wishlist.toggle.error.noProduct', 'wishlist', null)
    };
}
module.exports = {
    getWishlistMessages: getWishlistMessages
};
