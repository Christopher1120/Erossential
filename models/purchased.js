var mongoose = require("mongoose");


var purchaseSchema = mongoose.Schema({
    oid: { type: String, required: true },
    productName: { type: String, required: true },
    variant: { type: String, required: true },
    batch: { type: String, required: true },
    qty: { type: String, required: true },
    unit: {type:String,required:true},
    total: { type: Number, required: true },
    createdBy: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
});



var Purchased = mongoose.model("Purchased", purchaseSchema);


module.exports = Purchased;