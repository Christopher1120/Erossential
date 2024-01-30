var express = require("express");
var User = require("../../models/users");
var Auth = require("../../auth/auth").ensureAuthenticated;
var Applicant = require("../../models/applicant");


var router = express.Router();

router.use(Auth);

router.get("/", (req, res) => {
    res.render("recruit/home");
});

router.get("/applicant", (req, res) => {
    User.find({ status: "Applicant" }).then((user) => {
        res.render("recruit/_partials/applicant", { user: user });
    })
})

router.get("/interviews", (req, res) => {
    User.find({ status: "Interview" }).then((user) => {
        res.render("recruit/_partials/interviews", { user: user });
    })
})

router.get("/job-offer", (req, res) => {
    User.find({ status: "Offer" }).then((user) => {
        res.render("recruit/_partials/job-offer", { user: user });
    });
});

router.get("/denied", (req, res) => {
    User.find({ status: "Denied" }).then((user) => {
        res.render("recruit/_partials/denied", { user: user });
    })
});

router.get("/view-applicant/applicant=:id", (req, res) => {
    User.findById(req.params.id).then((user) => {
        Applicant.findOne({ uid: req.params.id }).then((applicant) => {
            res.render("recruit/_partials/view", { user: user, applicant: applicant });
        })
    })
})


// DATA Processing;

router.get("/job-offer/applicant=:id", async (req, res) => {
    var user = await User.findById(req.params.id);

    user.status = "Active";

    try {
        let saveUser = await user.save();
        req.flash("info", "Account Activated!");
        return res.redirect("/recruit");
    } catch (e) {
        console.log(e);
        req.flash("error", "An error has occured");
        return res.redirect("/recruit");
    }

})

router.post("/view-applicant/applicant=:id", async (req, res) => {
    var applicant = await Applicant.findOne({ uid: req.params.id });
    var user = await User.findById(req.params.id);
    var type = req.body.type;
    var attempts = req.body.attempts;
    var notes = req.body.notes;
    var score = req.body.score;


    applicant.note = notes;
    applicant.attempts = attempts;

    if (type == "Initial Interview" && attempts == "Answered") {
        applicant.type = "Final Interview"
    } else if (type == "Final Interview" && attempts == "Answered") {

        applicant.score = score
        if (score == "Failed") {
            applicant.type = "Denied";
            user.status = "Denied";
        } else {
            applicant.type = "Job Offer";
            user.status = "Offer";
        }
    } else if (attempts == "3rd") {
        applicant.attempts = attempts;
        user.status = "Denied";
        applicant.type = "Denied";
    }

    try {
        let saveApplicant = await applicant.save();
        var saveUser = await user.save();
        console.log("Saving Progress", saveApplicant, saveUser)
        req.flash("info", "Applicant Progress Saved!");
        return res.redirect("/recruit");
    } catch (e) {
        req.flash("error", "An error has occured");
        console.log(e);
        return res.redirect("/recruit");
    }

})

router.get("/set-interview/applicant=:id", async (req, res) => {
    var user = await User.findById(req.params.id);

    user.status = "Interview"

    try {
        let saveApp = await user.save();
        console.log(saveApp);

        Applicant.findById(req.params.id).then((applicant) => {
            if (applicant) {
                res.status(404);
                return res.send("Applicant already exist!");
            }

            var newApp = new Applicant({
                uid: req.params.id,
                type: "Initial Interview",
                note: "",
            });

            newApp.save((err, save) => {
                if (err) {
                    console.log(err);
                    res.status(404)
                    return res.send("An error has occured");
                }
                console.log(save);
                res.status(200);
                return res.send("Applicant is now fowarded for interview!");
            })

        })

    } catch (e) {
        console.log(e);
        req.flash("error", "An error has occured!");
        return res.redirect("/recruit");
    }

})


module.exports = router;