var mongoose = require("mongoose");


var crmSchema = mongoose.Schema({
    uid: { type: String, required: true },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    street: { type: String, required: true },
    city: {type:String,required:true},
    createdBy: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
});



var CRM = mongoose.model("Customers", crmSchema);


module.exports = CRM;