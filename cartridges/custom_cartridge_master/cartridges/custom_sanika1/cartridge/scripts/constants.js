'use strict';

var properties = function () {
    var properties = {
        wishlistAddSuccess: Resource.msg('wishlist.toggle.success.add', 'wishlist', null),
        wishlistRemoveSuccess: Resource.msg('wishlist.toggle.success.remove', 'wishlist', null),
        wishlistToggleError: Resource.msg('wishlist.toggle.error', 'wishlist', null),
        wishlistNoProduct: Resource.msg('wishlist.toggle.error.noProduct', 'wishlist', null),
        wishlistAddButton: Resource.msg('wishlist.toggle.button.add', 'wishlist', null),
        wishlistRemoveButton: Resource.msg('wishlist.toggle.button.remove', 'wishlist', null)
    }
};

module.exports = {
    properties : properties
}
