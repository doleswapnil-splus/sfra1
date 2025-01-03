'use strict';
var base = module.superModule;
function OrderModel(lineItemContainer, options) {
    base.call(this, lineItemContainer, options);
    if (!lineItemContainer) {
        this.rewardPoints = null;
    } else {
        this.rewardPoints = lineItemContainer.custom && 'rewardPoints' in lineItemContainer.custom
    ? lineItemContainer.custom.rewardPoints
    : null; 
    }
}
module.exports = OrderModel;
