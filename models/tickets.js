var mongoose = require("mongoose");


var ticketSchema = mongoose.Schema({
    ident: { type: String, required: true },
    issue: { type: String, required: true },
    description: { type: String, required: true },
    for: { type: Array, required: true },
    createdBy: { type: Array, required: true },
    status: { type: String, required: true },
    handleby: { type: Array, required: false },
    resolution: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    completedOn: { type: String, required: false },
});


var Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;