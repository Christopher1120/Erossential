var express = require("express");
var User = require("../../models/users");
var nodemailer = require("nodemailer");
var passport = require("passport");
var Batch = require("../../models/batch");
const ensureAuthenticated = require("../../auth/auth").ensureAuthenticated;


var router = express.Router();



router.get("/", (req, res) => {
    res.render("home/login");
})

router.get("/home", ensureAuthenticated, (req, res) => {
    Batch.find().then((batch) => {
        res.render("home/home", {batch:batch});
    });
})

router.get("/register", ensureAuthenticated, (req, res) => {
    res.render("home/_partial/register");
})

router.get("/activation", ensureAuthenticated,(req, res) => {
    res.render("home/activation");
})


// DATA Processing

router.post("/activation", ensureAuthenticated, (req, res) => {
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