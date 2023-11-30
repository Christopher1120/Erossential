var mongoose = require("mongoose");


var commsSchema = mongoose.Schema({
    user: { type: String, required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    read: { type: Boolean, required: true },
    createdby: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    status: { type: String, required: true },
});


var Comms = mongoose.model("Comms", commsSchema);


module.exports = Comms;