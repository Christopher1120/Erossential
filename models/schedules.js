var mongoose = require("mongoose");


var scheduleSchema = mongoose.Schema({
    ident: { type: String, required: true },
    title: {type:String,required:true},
    attendees: { type: Array, required: true },
    location: { type: String, required: true },
    datetime: { type: String, required: true },
    createdBy: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    status: { type: String, required: true },
    type: {type:String,required:true},
});



var Schedules = mongoose.model("Schedules", scheduleSchema);


module.exports = Schedules