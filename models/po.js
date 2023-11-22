var mongoose = require("mongoose");


var purchasedOrderSchema = mongoose.Schema({
    purchNo: { type: String, required: true },
    batchNo: { type: String, required: false },
    product: { type: String, required: true },
    variant: { type: String, required: true },
    qty: { type: String, required: true },
    unit: { type: String, required: true },
    cost: { type: String, required: true },
    inventory: {type:String,required:false},
});




var PurchasedOrder = mongoose.model("PO", purchasedOrderSchema);

module.exports = PurchasedOrder;