
'use strict';

/**
 * @namespace Order
 */

var server = require('server');
server.extend(module.superModule);

var Resource = require('dw/web/Resource');
var URLUtils = require('dw/web/URLUtils');

server.append('Confirm',function (req, res, next) {
        var OrderMgr = require('dw/order/OrderMgr');
        var Locale = require('dw/util/Locale');
        var Site = require('dw/system/Site');
        var Transaction = require('dw/system/Transaction');
        var reportingUrlsHelper = require('*/cartridge/scripts/reportingUrls');
        var OrderModel = require('*/cartridge/models/order');

        if (!req.form.orderToken || !req.form.orderID) {
            res.render('/error', {
                message: Resource.msg('error.confirmation.error', 'confirmation', null)
            });

            return next();
        }
        var order = OrderMgr.getOrder(req.form.orderID, req.form.orderToken);
        if (!order || order.customer.ID !== req.currentCustomer.raw.ID) {
            res.render('/error', {
                message: Resource.msg('error.confirmation.error', 'confirmation', null)
            });

            return next();
        }
        var lastOrderID = Object.prototype.hasOwnProperty.call(req.session.raw.custom, 'orderID')
            ? req.session.raw.custom.orderID
            : null;
        if (lastOrderID === req.querystring.ID) {
            res.redirect(URLUtils.url('Home-Show'));
            return next();
        }
        var config = {
            numberOfLineItems: '*'
        };
        var currentLocale = Locale.getLocale(req.locale.id);

        var orderModel = new OrderModel(
            order,
            { config: config, countryCode: currentLocale.country, containerView: 'order' }
        );
        var reportingURLs = reportingUrlsHelper.getOrderReportingURLs(order);
        var passwordForm;
        if (!req.currentCustomer.profile) {
            passwordForm = server.forms.getForm('newPasswords');
            passwordForm.clear();
            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: false,
                passwordForm: passwordForm,
                reportingURLs: reportingURLs,
                orderUUID: order.getUUID()
            });
        } else {
            //Rewards points
            var rewardPointsToAmount = Site.getCurrent().getCustomPreferenceValue('rewardPointsToAmount') || 10;
            var orderTotal = order.totalGrossPrice.value;
            var earnedPoints = Math.floor(orderTotal / rewardPointsToAmount);//60/10
            var currentPoints=0;
            Transaction.wrap(function () {
                order.custom.rewardPoints = earnedPoints;
                if (req.currentCustomer.profile) {
                    var customerProfile = order.customer.profile;
                   var currentPoints = (customerProfile.custom && customerProfile.custom.totalRewardPoints) || 0;
                    customerProfile.custom.totalRewardPoints = currentPoints + earnedPoints;
                }
            });
            res.render('checkout/confirmation/confirmation', {
                order: orderModel,
                returningCustomer: true,
                reportingURLs: reportingURLs,
                orderUUID: order.getUUID(),
            });
        }
        req.session.raw.custom.orderID = req.querystring.ID; // eslint-disable-line no-param-reassign
        return next();
    }
);

module.exports = server.exports();
