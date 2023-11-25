var mongoose = require("mongoose");


var monthlySchema = mongoose.Schema({
    month: { type: String, required: true },
    sales: {type:Number,require:true},
    loss: { type: Number, required: true },
    expenses: { type: Number, required: true },
})



var Monthly = mongoose.model("Monthly", monthlySchema);


module.exports = Monthly;
