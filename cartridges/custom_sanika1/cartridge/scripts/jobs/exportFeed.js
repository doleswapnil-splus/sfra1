
'use strict';

var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var XMLStreamWriter = require('dw/io/XMLStreamWriter');
var ProductMgr = require('dw/catalog/ProductMgr');
var ProductRatingService = require('*/cartridge/scripts/services/ProductRatingService');
var Resource = require('dw/web/Resource');

function getProductRating() {
    var productIterator = ProductMgr.queryAllSiteProducts();
    var allReviews = [];
    var noRating = Resource.msg('service.no.rating', 'service', null);

    while (productIterator.hasNext()) {
        var product = productIterator.next();
        var productId = product.ID;
        var ratingResponse = ProductRatingService.productService(productId);

        if (!ratingResponse.ok) {
            continue;
        }

        var responseObject = ratingResponse.object;//ret strg
        var items = JSON.parse(responseObject);//con to json obj

        if (items.message && items.message.indexOf(noRating) !== -1) {
            continue;
        }

        delete items.action;
        delete items.locale;
        delete items.queryString;

        var reviews = Object.values(items);
        if (reviews.length === 0) {
            continue;
        }

        allReviews = allReviews.concat(reviews);
    }

    productIterator.close();

    if (allReviews.length > 0) {
        var path = File.IMPEX + File.SEPARATOR + "src" + File.SEPARATOR + "export" + File.SEPARATOR + 'exportRating.xml';
        var file = new File(path);
        var fileWriter = new FileWriter(file);
        var xmlWriter = new XMLStreamWriter(fileWriter);

        xmlWriter.writeStartDocument();
        xmlWriter.writeStartElement('Reviews');

        allReviews.forEach(function (review) {
            xmlWriter.writeStartElement("Review");

            xmlWriter.writeStartElement("orderId");
            xmlWriter.writeCharacters(String(review.orderId || "N/A"));
            xmlWriter.writeEndElement();

            xmlWriter.writeStartElement("review");
            xmlWriter.writeCharacters(review.review || "No comment");
            xmlWriter.writeEndElement();

            xmlWriter.writeStartElement("Rating");
            xmlWriter.writeCharacters(String(review.rating || 0));
            xmlWriter.writeEndElement();

            xmlWriter.writeStartElement("Reviewer");
            xmlWriter.writeCharacters(review.email || "Anonymous");
            xmlWriter.writeEndElement();

            xmlWriter.writeEndElement();
        });

        xmlWriter.writeEndElement();
        xmlWriter.writeEndDocument();

        xmlWriter.close();
        fileWriter.close();
    }
}

module.exports = {
    getProductRating: getProductRating
};




