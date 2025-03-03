module.exports = {
    init: function () {
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
                    if (response.success) {
                        if (response.message === window.properties.wishlistRemoveSuccess){
                            heartIcon.removeClass('wishlist-added').addClass('wishlist-removed');
                            button.attr('data-wishlist-state', 'false');
                            button.attr('title',window.properties.wishlistAddButton);
                            alert(response.message);
                        } else if (response.message === window.properties.wishlistAddSuccess) {
                            heartIcon.removeClass('wishlist-removed').addClass('wishlist-added');
                            button.attr('data-wishlist-state', 'true');
                            button.attr('title',window.properties.wishlistRemoveButton);
                            alert(response.message);
                        }
                    } else {
                        alert(window.properties.wishlistToggleError);
                    }
                },
                error: function (xhr, status, error) {
                    alert(window.properties.wishlistToggleError);
                }
            });
        });

        $(document).on('click', '.remove-button', function (e) {
            e.preventDefault();

            var button = $(this);
            var form = button.closest('form');
            var formData = form.serialize();
            var actionUrl = form.attr('action');

            $.ajax({
                url: actionUrl,
                method: 'POST',
                data: formData,
                success: function (response) {
                    alert(response.message);
                    window.location.reload();
                },
                error: function () {
                    alert(window.properties.wishlistToggleError);
                }
            });
        });
    }
};
