var mongoose = require("mongoose");


var batchSchema = mongoose.Schema({
    batchNo: { type: String, required: true },
    purchNo: { type: String, required: true },
    sales: { type: String, required: true },
    loss: { type: String, required: true },
    expenses: {type:String,required:true},
    createdBy: { type: String, required: true },
    month: { type: String, required: true },
    year: {type:String,required:true},
    createdOn: { type: Date, default: Date.now }
});


var Batch = mongoose.model("Batch", batchSchema);


module.exports = Batch;