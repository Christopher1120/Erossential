var mongoose = require("mongoose");


var investorSchema = mongoose.Schema({
    ident: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    full: {type:String,required:true},
    amount: { type: Number, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    start: { type: String, required: false },
    end: { type: String, required: false },
    status: { type: String, required: true },
    file: { type: String, required: false },
    note: { type: String, required: false },
    spartner: {type:String,required:true},
    createdOn: { type: Date, default: Date.now },
    payment: {type:Array,required:false},
});



var Investor = mongoose.model("Investor", investorSchema);

module.exports = Investor;