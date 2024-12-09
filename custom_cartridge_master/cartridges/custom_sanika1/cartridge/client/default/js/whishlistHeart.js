// $(document).ready(function () {
//     $('.wishlist-icon-button').on('click', function (event) {
//         event.preventDefault();
//         var form = $(this).closest('form'); 
//         var formData = form.serialize(); 

//         $.ajax({
//             url: form.attr('action'), 
//             type: 'POST',
//             data: formData, 
//             dataType: 'json', 
//             success: function (response) {
//                 var heartIcon = form.find('.fa-heart'); // Locate the heart icon inside the form
//                 if (response.success) {
//                     if (response.message === 'Product Removed from Wishlist') {
//                         // If product is removed, reset the icon color to normal
//                         heartIcon.css('color', 'red'); 
//                         alert('Product Removed from Wishlist');
//                     } else if (response.message === 'Product Added to Wishlist') {
//                         // If product is added, change the icon color to black
//                         heartIcon.css('color', 'black'); 
//                         alert('Product Added to Wishlist');
//                     }
//                 } else {
//                     alert(response.message || 'An unexpected error occurred');
//                 }
//             },
//             error: function (xhr, status, error) {
//                 alert('An error occurred while toggling the wishlist: ' + error);
//             }
//         });
//     });
// });


// $(document).ready(function () {
//     $('.wishlist-icon-button').on('click', function (event) {
//         event.preventDefault(); // Prevent form submission
//         var button = $(this);
//         var form = button.closest('form'); 
//         var formData = form.serialize(); 

//         $.ajax({
//             url: form.attr('action'),
//             type: 'POST',
//             data: formData,
//             dataType: 'json',
//             success: function (response) {
//                 var heartIcon = button.find('.fa-heart'); 
//                 var isInWishlist = button.attr('data-wishlist-state') === 'true';

//                 if (response.success) {
//                     if (response.message === 'Product Removed from Wishlist') {
//                         // Update icon to reflect removal
//                         heartIcon.css('color', '#e74c3c'); // Default red color
//                         button.attr('data-wishlist-state', 'false');
//                         button.attr('title', 'Add to Wishlist');
//                         alert('Product Removed from Wishlist');
//                     } else if (response.message === 'Product Added to Wishlist') {
//                         // Update icon to reflect addition
//                         heartIcon.css('color', 'black'); // Marked as in wishlist
//                         button.attr('data-wishlist-state', 'true');
//                         button.attr('title', 'Remove from Wishlist');
//                         alert('Product Added to Wishlist');
//                     }
//                 } else {
//                     alert(response.message || 'An unexpected error occurred');
//                 }
//             },
//             error: function (xhr, status, error) {
//                 alert('An error occurred while toggling the wishlist: ' + error);
//             }
//         });
//     });
// });


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
                    if (response.message === 'Product Removed from Wishlist') {
                        heartIcon.css('color', '#e74c3c'); 
                        button.attr('data-wishlist-state', 'false');
                        button.attr('title', 'Add to Wishlist');
                        alert('Product Removed from Wishlist');
                    } else if (response.message === 'Product Added to Wishlist') {
                        heartIcon.css('color', 'black'); 
                        button.attr('data-wishlist-state', 'true');
                        button.attr('title', 'Remove from Wishlist');
                        alert('Product Added to Wishlist');
                    }
                } else {
                    alert(response.message || 'An unexpected error occurred');
                }
            },
            error: function (xhr, status, error) {
                alert('An error occurred while toggling the wishlist: ' + error);
            }
        });
    });
});

