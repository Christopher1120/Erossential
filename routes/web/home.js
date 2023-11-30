var express = require("express");
var User = require("../../models/users");
var nodemailer = require("nodemailer");
var passport = require("passport");
var Batch = require("../../models/batch");
const ensureAuthenticated = require("../../auth/auth").ensureAuthenticated;
const ensureOnline = require("../../auth/auth-online").ensureOnline;
var Comms = require("../../models/comms");


var router = express.Router();



router.get("/", (req, res) => {
    res.render("home/login");
})

router.get("/home", ensureAuthenticated, ensureOnline, (req, res) => {
    Batch.find().then((batch) => {
        res.render("home/home", {batch:batch});
    });
})

router.get("/register", ensureAuthenticated, ensureOnline, (req, res) => {
    res.render("home/_partial/register");
})

router.get("/activation", ensureAuthenticated, ensureOnline, (req, res) => {
    res.render("home/activation");
});

router.get("/forgot-password", (req, res) => {
    res.render("home/verify-user");
})

router.get("/forgot-password/verify", (req, res) => {
    res.render("home/forgot-code");
})

router.get("/forgot-password/user=:ident", (req, res) => {
    User.findById(req.params.ident).then((user) => {
        res.render("home/forget-password", {user:user});
    });
})

router.get("/status", ensureAuthenticated, ensureOnline, (req, res) => {
    User.find().then((user) => {
        res.render("home/_partial/online", { user: user });
    })
});

router.get("/create-comms", ensureAuthenticated, ensureOnline, (req, res) => {
    res.render("home/_partial/create-comms");
})

router.get("/comms", ensureAuthenticated, ensureOnline, (req, res) => {
    Comms.find({ user: req.user.ident }).then((comms) => {
        res.render("home/_partial/comms-list", { comms: comms });
    })
})

router.get("/comms/comms=:id", ensureAuthenticated, ensureOnline, (req, res) => {
    Comms.findById(req.params.id).then((comms) => {
        res.render("home/_partial/comms", { comms: comms });
    })
})

// DATA Processing

router.post("/create-comms", ensureAuthenticated, ensureOnline, async (req, res) => {
    var title = req.body.title;
    var type = req.body.type;
    var user = req.body.user;
    var content = req.body.content;

    var users = user.split(",");
    var communic = await Comms.find();

    users.forEach(async emp => {

        var comms = await Comms.insertMany({
            title: title,
            type: type,
            user: emp,
            content: content,
            createdby: req.user.full,
            status: "Active",
            read: false
        });
    });

    try {
        console.log(communic);
        req.flash("info", "Communication sent!");
        return res.redirect("/home");

    } catch (e) {
        console.log(e);
        req.flash("error", "An error has occured");
        return res.redirect("/home");
    }
});

router.get("/log-out", ensureAuthenticated, async (req, res) => {


    var d = new Date();
    var user = await User.findById(req.user._id);

    user.online = "Offline";
    user.last = d;

    try {
        let saveUser = await user.save();
        console.log(saveUser);

        req.logout((err) => {
            if (err) {
                console.log(err);
                return;
            }
            return res.redirect("/");
        })
    } catch (e) {
        console.log(e);
    }

})


router.post("/forgot-password/user=:ident", async (req, res) => {
    var newpass = req.body.newpass;
    var retype = req.body.retype;

    var user = await User.findById(req.params.ident);


    if (user.password == newpass) {
        req.flash("error", "Password can't be the same one again!");
        return res.redirect("/forgot-password/user=" + user._id);
    } else if (newpass != retype) {
        req.flash("error", "Password did not match!");
        return res.redirect("/forgot-password/user=" + user._id);
    } else {

        user.password = newpass;
        user.status = "Active";

        try {
            let savePass = await user.save();
            console.log("Saving Password", savePass);
            return res.redirect("/");
        } catch (e) {
            console.log(e);
            return res.redirect("/forgot-password/user=" + user._id);
        }
    }
})


router.post("/validate-code", async (req, res) => {
    var code = req.body.code;

    var user = await User.findOne({ code: code });

    if (!user) {
        req.flash("error", "Invalid Code!");
        return res.redirect("/forgot-password/verify");
    }
    if (user) {
        console.log("Code Valid!");
        return res.redirect("/forgot-password/user=" + user._id);
    }

})

router.post("/verify-user", (req, res) => {
    var email = req.body.email;

    User.findOne({ email: email }).then(async (user) => {
        if (!user) {
            req.flash("error", "Email address is incorrect!");
            return res.redirect("/forgot-password");
        } else {

            var account = await User.findOne({ email: email });

            var coded = Math.floor(Math.random() * 200000);

            console.log(coded);

            account.code = coded;
            account.status = "FP";

            try {
                let saveCode = await account.save();
                console.log("Code sent!", saveCode);


                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'ccruz0000.erossential@gmail.com',
                        pass: 'lzncproizaqwoufw'
                    }
                });

                const mailOptions = {
                    from: "ccruz0000.erossential@gmail.com",
                    to: email,
                    subject: "Password Reset Request",
                    html: "Awesome Day " + account.full + "," + "<br><br>" + "<br><br>Your passcode is : " + coded + "<br><br> " + "<br>Regards</br>" + "<br>Erossential</br>"
                }

                transporter.sendMail(mailOptions, (err, success) => {
                    if (err) {
                        req.flash("error", "An error has occured");
                        console.log(err);
                        return res.redirect("/forgot-password");
                    } else {
                        console.log(success.response);
                        req.flash("info", "Code Sent!");
                        return res.redirect("/forgot-password/verify");
                    }
                });

            } catch (e) {
                console.log(e);
            }

        }
    })
})


router.post("/activation", ensureAuthenticated, ensureOnline, (req, res) => {
    var code = req.body.code;

    User.findOne({ ident: req.user.ident }).then((user) => {
        if (code == user.code) {
                console.log("Authenticated!");

                User.findOneAndUpdate({ ident: req.user.ident }, { $set: { status: "Active" } }).then((scc) => {
                    console.log(scc);
                    return res.redirect("/home");
                })


        } else {
            console.log("Not valid!");
            req.flash("error", "Invalid activation code");
            return res.redirect("/activation");
        }
    })

})


router.post("/login", passport.authenticate("login", {
    successRedirect: "/authentication",
    failureRedirect: "/",
    failureFlash: true
}));

router.get("/authentication", (req, res) => {
    if (req.user.status == "Pending") {
        return res.redirect("/activation");
    } else {
        return res.redirect("/home");
    }
})



router.post("/register", (req, res) => {
    var first = req.body.first;
    var last = req.body.last;
    var email = req.body.email;
    var contact = req.body.contact;
    var full = first + " " + last

    var Confirmation = Math.floor(Math.random() * 20000);
    console.log(Confirmation);

    User.count().then((count) => {
        if (count < 10) {
            var ident = "000" + count;
        } else if (count > 9 && count < 100) {
            var ident = "00" + count;
        } else if (count > 99 && count < 1000) {
            var ident = "0" + count;
        } else {
            var ident = count;
        }

        var fletter = first.charAt(0);
        var lower = fletter.toLowerCase();
        var lletter = last.toLowerCase();
        var username = lower + lletter + ident;
        console.log(username);

        var newUser = new User({
            ident: ident,
            username: username,
            firstName: first,
            lastName: last,
            full: full,
            password: "Erossential19.",
            contact: contact,
            email: email,
            status: "Pending",
            code: Confirmation,
        })

        newUser.save((err, save) => {
            if (err) {
                console.log(err);
                req.flash("error", "An error has occured!");
                return res.redirect("/home");
            }

            

            var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ccruz0000.erossential@gmail.com',
                    pass: 'lzncproizaqwoufw'
                }
            });

            const mailOptions = {
                from: "ccruz0000.erossential@gmail.com",
                to: email,
                subject: "Account Activation from Erossential System",
                html: "Awesome Day " + full + "," + "<br><br>Username : " + username +"<br><br>Your Account Activation Code is : " + Confirmation +"<br><br> " + "<br>Regards</br>" + "<br>Erossential</br>"
            }

            transporter.sendMail(mailOptions, (err, success) => {
                if (err) {
                    req.flash("error", "An error has occured");
                    console.log(err);
                    return res.redirect("/home");
                } else {
                    console.log(success.response);
                    req.flash("info", "Account Registered!");
                    return res.redirect("/home");
                }

            })

        })
    })
});




module.exports = router;