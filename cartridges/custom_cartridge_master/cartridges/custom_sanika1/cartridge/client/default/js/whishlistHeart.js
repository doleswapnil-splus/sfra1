

$(document).ready(function () {
    $('.wishlist-icon-button').each(function () {
        var button = $(this);
        var heartIcon = button.find('.fa-heart');
        var isInWishlist = button.attr('data-wishlist-state') === 'true';
        if (isInWishlist) {
            heartIcon.css('color', 'black');
        } else {
            heartIcon.css('color', '#e74c3c');
        }
    });
    $('.wishlist-icon-button').on('click', function (event) {
        event.preventDefault();
        var button = $(this);
        var form = button.closest('form');
        var formData = form.serialize();

        $.ajax({
            url: form.attr('action'),
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function (response) {
                var heartIcon = button.find('.fa-heart');
                var isInWishlist = button.attr('data-wishlist-state') === 'true';
                if (response.success) {
                    if (response.message ===window.wishlistMessages.wishlistRemoveSuccess){
                        heartIcon.css('color', '#e74c3c');
                        button.attr('data-wishlist-state', 'false');
                        button.attr('title','Add to Wishlist');
                        alert(response.message);
                    } else if (response.message === window.wishlistMessages.wishlistAddSuccess) {
                        heartIcon.css('color', 'black');
                        button.attr('data-wishlist-state', 'true');
                        button.attr('title','Remove from Wishlist');
                        alert(response.message);
                    }
                } else {
                    alert(window.wishlistMessages.wishlistToggleError);
                }
            },
            error: function (xhr, status, error) {
                alert(window.wishlistMessages.wishlistToggleError);
            }
        });
    });
});



