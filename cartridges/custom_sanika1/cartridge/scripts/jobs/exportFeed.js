
'use strict';

var Logger = require('dw/system/Logger');
var File = require('dw/io/File');
var FileWriter = require('dw/io/FileWriter');
var XMLStreamWriter = require('dw/io/XMLStreamWriter');
var ProductMgr = require('dw/catalog/ProductMgr');
var ProductRatingService = require('*/cartridge/scripts/services/ProductRatingService');
var StringWriter = require('dw/io/StringWriter');

function getAllProducts(parameters, stepExecution) {
    var productIterator = ProductMgr.queryAllSiteProducts();
    return productIterator.hasNext() ? productIterator.next() : null;
}

function getProductRating(product) {
    var ratingResponse = ProductRatingService.productService();

    if (!ratingResponse.ok) {
        return;
    }

    var responseObject = ratingResponse.object;

    var b =JSON.stringify(responseObject);
    
    var reviews = Object.keys(responseObject)
        .filter(key => !isNaN(key))
        .map(key => responseObject[key]);

    var path = File.IMPEX + File.SEPARATOR + "src" + File.SEPARATOR + "export" + File.SEPARATOR + 'exportRating.xml';

    var file = new File(path);
    var fileWriter = new FileWriter(file);
    var xmlWriter = new XMLStreamWriter(fileWriter);

    xmlWriter.writeStartDocument();
    xmlWriter.writeStartElement('Reviews');

    reviews.forEach(function (review) {
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

function after(success, parameters, stepExecution) {
    if (success) {
        Logger.info('Job Completed Successfully.');
    } else {
        Logger.error('Job Failed.');
    }
}

module.exports = {
    getProductRating: getProductRating
};
