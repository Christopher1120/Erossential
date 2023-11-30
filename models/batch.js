var mongoose = require("mongoose");


var batchSchema = mongoose.Schema({
    batchNo: { type: String, required: true },
    purchNo: { type: String, required: true },
    sales: { type: Number, required: true },
    loss: { type: Number, required: true },
    expenses: { type: Number, required: true },
    profit: {type:Number,required:false},
    createdBy: { type: String, required: true },
    month: { type: String, required: true },
    year: {type:String,required:true},
    createdOn: { type: Date, default: Date.now },
    status: {type:String,required:false},
});


var Batch = mongoose.model("Batch", batchSchema);


module.exports = Batch;