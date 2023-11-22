var mongoose = require("mongoose");


var ponSchema = mongoose.Schema({
    purchNo: { type: String, required: true },
    type: {type:String,required:false},
    batchNo: {type:String,required:false},
    orderOn: { type: String, required: false },
    receivedOn: { type: String, required: false },
    delivery: { type: Number, required: false },
    total: {type:Number,required:false},
    requestBy: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    supplier: { type: String, required: false },
});



var POs = mongoose.model("Purchase-Order", ponSchema);

module.exports = POs;