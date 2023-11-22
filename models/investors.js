var mongoose = require("mongoose");


var investorSchema = mongoose.Schema({
    ident: { type: String, required: true },
    firstName: { type: String, required: true },
    middleInit: { type: String, required: false },
    lastName: { type: String, required: true },
    amount: { type: Number, required: true },
    stock: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, required: true },
    start: { type: String, required: false },
    end: { type: String, required: false },
    spartner: { type: Array, required: true },
});



var Investor = mongoose.model("Investor", investorSchema);

module.exports = Investor;