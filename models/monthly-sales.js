var mongoose = require("mongoose");


var monthlySchema = mongoose.Schema({
    month: { type: String, required: true },
    year: {type:String,required:true},
    sales: { type: Number, require: true },
    loss: { type: Number, required: true },
    expenses: { type: Number, required: true },
    profit: { type: Number, required: true },
    createdOn: {type:Date,default:Date.now}
});



var Monthly = mongoose.model("Monthly", monthlySchema);


module.exports = Monthly;
