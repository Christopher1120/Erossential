var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var User = require("./models/users");

module.exports = function () {
    // turns a user object into an id
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });
    // turns the id into a user object
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use("login", new LocalStrategy({
        usernameField: 'username',
        passswordField: 'password',
    }, function (username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: "Username or password is incorrect" });
                console.log("User does not exist");
            }
            user.checkPassword(password,async function (err, isMatch) {
                if (err) { return done(err); }
                if (isMatch) {

                    var profile = await User.findOne({ username: username });

                    profile.online = "Online";

                    try {
                        let saveProf = await profile.save();
                        console.log(saveProf);
                        return done(null, user);
                        console.log(user);
                    } catch (e) {
                        console.log(e);
                    }

                } else {

                    return done(null, false, { message: "Username or password is incorrect" });
                    console.log("Password is not correct")
                };
            });
        });
    }));


}


