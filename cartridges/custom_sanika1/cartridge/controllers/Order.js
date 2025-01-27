
'use strict';

/**
 * @namespace Order
 */
var server = require('server');
server.extend(module.superModule);

server.append('Details',function (req, res, next) {
    
        res.setViewData({ pageID: 'Order-Details' });
        next();
    }
);

module.exports = server.exports();

