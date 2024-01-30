var mongoose = require("mongoose");


var applicantSchema = mongoose.Schema({
    uid: { type: String, required: true },
    type: { type: String, required: true },
    note: { type: String, required: false },
    attempts: { type: String, required: false },
    score: { type: String, required: false },
});


var Applicant = mongoose.model("Applicant", applicantSchema);

module.exports = Applicant;