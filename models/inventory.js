var mongoose = require("mongoose");



var productSchema = mongoose.Schema({
    batchNo: { type: String, required: true },
    productName: { type: String, required: true },
    qty: { type: Number, required: true },
    sold: { type: Number, required: true },
    variant: { type: String, required: true },
    price: { type: Number, required: true },
    addedOn: { type: Date, default: Date.now },
});



var Inventory = mongoose.model("Inventory", productSchema);


module.exports = Inventory;