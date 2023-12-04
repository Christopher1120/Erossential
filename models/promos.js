var mongoose = require("mongoose");


var promoSchema = mongoose.Schema({
    name: {type:String,required:true},
    code: { type: String, required: true , unique:true},
    criteria: {type:Array,required:true},
    amount: { type: String, required: true },
    start: { type: String, required: true },
    expiry: { type: String, required: true },
    createdBy: { type: String, required: true },
    status: { type: String, required: true },
    createdOn: { type: Date, default: Date.now }
});




var Promo = mongoose.model("Promos", promoSchema);


module.exports = Promo;