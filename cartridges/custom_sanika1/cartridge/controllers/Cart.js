'use strict';

/**
 * @namespace Cart
 */
var server = require('server');
server.extend(module.superModule);

server.replace('AddProduct', function (req, res, next) {

    var BasketMgr = require('dw/order/BasketMgr');
    var Resource = require('dw/web/Resource');
    var URLUtils = require('dw/web/URLUtils');
    var Transaction = require('dw/system/Transaction');
    var CartModel = require('*/cartridge/models/cart');
    var ProductLineItemsModel = require('*/cartridge/models/productLineItems');
    var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
    var basketCalculationHelpers = require('*/cartridge/scripts/helpers/basketCalculationHelpers');

    var currentBasket = BasketMgr.getCurrentOrNewBasket();
    var previousBonusDiscountLineItems = currentBasket.getBonusDiscountLineItems();
    var productId = req.form.pid;
    var isGiftCertificate = req.form.isGiftCertificate;
    var giftCertificateType = req.form.giftCertificateType || null;
    var firstName=req.form.firstName;
    var lastName=req.form.lastName;
    var email=req.form.email;

    var childProducts = Object.hasOwnProperty.call(req.form, 'childProducts')
        ? JSON.parse(req.form.childProducts)
        : [];
    var options = req.form.options ? JSON.parse(req.form.options) : [];
    var quantity;
    var result;
    var pidsObj;

    if (currentBasket) {
        Transaction.wrap(function () {
            if (!req.form.pidsObj) {
                quantity = parseInt(req.form.quantity, 10);
                result = cartHelper.addProductToCart(
                    currentBasket,
                    productId,
                    quantity,
                    childProducts,
                    options,
                    firstName,
                    lastName,
                    email,
                    isGiftCertificate,
                    giftCertificateType
                );
            } else {
                // product set
                pidsObj = JSON.parse(req.form.pidsObj);
                result = {
                    error: false,
                    message: Resource.msg('text.alert.addedtobasket', 'product', null)
                };

                pidsObj.forEach(function (PIDObj) {
                    quantity = parseInt(PIDObj.qty, 10);
                    var pidOptions = PIDObj.options ? JSON.parse(PIDObj.options) : {};
                    var PIDObjResult = cartHelper.addProductToCart(
                        currentBasket,
                        PIDObj.pid,
                        quantity,
                        childProducts,
                        pidOptions,
                        firstName,
                        lastName,
                        email
                    );
                    if (PIDObjResult.error) {
                        result.error = PIDObjResult.error;
                        result.message = PIDObjResult.message;
                    }
                });
            }
            if (!result.error) {
                cartHelper.ensureAllShipmentsHaveMethods(currentBasket);
                basketCalculationHelpers.calculateTotals(currentBasket);
            }
        });
    }
    var quantityTotal = ProductLineItemsModel.getTotalQuantity(currentBasket.productLineItems);
    var cartModel = new CartModel(currentBasket);
    var urlObject = {
        url: URLUtils.url('Cart-ChooseBonusProducts').toString(),
        configureProductstUrl: URLUtils.url('Product-ShowBonusProducts').toString(),
        addToCartUrl: URLUtils.url('Cart-AddBonusProducts').toString()
    };
    var newBonusDiscountLineItem = cartHelper.getNewBonusDiscountLineItem(
        currentBasket,
        previousBonusDiscountLineItems,
        urlObject,
        result.uuid
    );
    if (newBonusDiscountLineItem) {
        var allLineItems = currentBasket.allProductLineItems;
        var collections = require('*/cartridge/scripts/util/collections');
        collections.forEach(allLineItems, function (pli) {
            if (pli.UUID === result.uuid) {
                Transaction.wrap(function () {
                    pli.custom.bonusProductLineItemUUID = 'bonus'; // eslint-disable-line no-param-reassign
                    pli.custom.preOrderUUID = pli.UUID; // eslint-disable-line no-param-reassign
                });
            }
        });
    }

    var reportingURL = cartHelper.getReportingUrlAddToCart(currentBasket, result.error);
    res.json({
        reportingURL: reportingURL,
        quantityTotal: quantityTotal,
        message: result.message,
        cart: cartModel,
        newBonusDiscountLineItem: newBonusDiscountLineItem || {},
        error: result.error,
        pliUUID: result.uuid,
        minicartCountOfItems: Resource.msgf('minicart.count', 'common', null, quantityTotal)
    });

    next();
});

server.append('Show', function (req, res, next) {
    var CartModel = require('*/cartridge/models/cart');
    var ProductListMgr = require('dw/customer/ProductListMgr');
    var ProductList = require('dw/customer/ProductList');
    var ProductMgr = require('dw/catalog/ProductMgr');
    var Money = require('dw/value/Money');
    var currentCustomer = req.currentCustomer.raw;
    var viewData = res.getViewData();
    var savedItems = [];

    if (currentCustomer) {
        var savedForLaterLists = ProductListMgr.getProductLists(currentCustomer, ProductList.TYPE_CUSTOM_1);
        var savedForLaterList = savedForLaterLists.length > 0 ? savedForLaterLists[0] : null;

        if (savedForLaterList) {
            var savedListItems = savedForLaterList.getProductItems();

            for (var i = 0; i < savedListItems.length; i++) {
                var item = savedListItems[i]; // ProductListItem
                var product = ProductMgr.getProduct(item.productID); // Get product details
                var selectedVariantAttributes = [];

                if (product) {
                    if (product.isVariant()) {
                        var variationModel = product.getVariationModel();
                        if (variationModel) {
                            var productVariationAttributes = variationModel.getProductVariationAttributes();

                            productVariationAttributes.toArray().forEach(function (attribute) {
                                var attributeValue = variationModel.getSelectedValue(attribute);
                                if (attributeValue) {
                                    selectedVariantAttributes.push({
                                        displayName: attribute.getDisplayName(),
                                        selectedValue: attributeValue.getDisplayValue()
                                    });
                                }
                            });
                        }
                    }

                    // Store variant attributes as a JSON string
                    var selectedVariantAttributesJSON = JSON.stringify(selectedVariantAttributes);

                    savedItems.push({
                        productListItem: item,
                        productID: product.ID,
                        name: product.name,
                        price: product.priceModel.price.valueOrNull || 0,
                        image: product.getImage('small').getURL(),
                        selectedVariantAttributes: selectedVariantAttributesJSON 
                    });
                }
            }
        }
    }

    viewData.savedItems = savedItems;
    var currentBasket = require('dw/order/BasketMgr').getCurrentBasket();
    viewData.cart = new CartModel(currentBasket);

    res.setViewData(viewData);
    next();
});

module.exports = server.exports();



