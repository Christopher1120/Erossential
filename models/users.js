var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
    ident: { type: String, required: true },
    username: {type:String,required:true},
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    full: {type:String,required:true},
    password: { type: String, required: true },
    email: { type: String, required: true },
    contact: {type:String,required:true},
    addedOn: { type: Date, default: Date.now },
    status: { type: String, required: true },
    position: { type: String, required: false },
    department: { type: String, required: false },
    role: { type: String, required: false },
    online: {type:String,required:false},
    code: {type:String,required:true},
});


userSchema.pre("save", function (done) {
    var user = this;

    if (!user.isModified("password")) {
        return done();
    }

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, function (err, hashedPassword) {
            if (err) { return done(err); }
            user.password = hashedPassword;
            done();
        });
    });

});


userSchema.methods.checkPassword = function (guess, done) {
    if (this.password != null) {
        bcrypt.compare(guess, this.password, function (err, isMatch) {
            done(err, isMatch);
        });
    }
}



var User = mongoose.model("User", userSchema);

module.exports = User;


