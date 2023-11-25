var mongoose = require("mongoose");


var orderSchema = mongoose.Schema({
    oid: { type: String, required: true },
    assigned: { type: Boolean, required: true },
    cid: {type:String,required:false},
    customer: { type: Array, required: false },
    orderDate: { type: String, required: false },
    deliveryDate: { type: String, required: false },
    deliveryFee: { type: Number, required: true },
    cost: { type: Number, required: true },
    discount: {type:Number,required:true},
    total: { type: Number, required: true },
    createdBy: { type: String, required: true },
    transferTo: { type: String, required: false },
    status: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
});



var Order = mongoose.model("Order", orderSchema);

module.exports = Order;