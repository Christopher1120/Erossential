var express = require("express");
var User = require("../../models/users");
var Schedule = require("../../models/schedules");
var Auth = require("../../auth/auth").ensureAuthenticated;
const ensureOnline = require("../../auth/auth-online").ensureOnline;

var router = express.Router();


router.use(Auth);
router.use(ensureOnline);


router.get("/", (req, res) => {
    User.find().then((user) => {
        res.render("schedules/schedules", {user:user});
    });
})

router.get("/mymeetings", (req, res) => {
    var user = req.user.full
    Schedule.find({ attendees: user }).then((meet) => {
        res.render("schedules/_partial/mymeeting", { meet: meet });
        console.log(meet, user);
    })
})



// DATA Process

router.post("/", (req, res) => {
    var title = req.body.title;
    var datetime = req.body.date + "T" + req.body.time;
    var attendees = req.body.attendees;
    var location = req.body.location;
    var type = req.body.type;
    var d = new Date(datetime);
    console.log(d);

    Schedule.count().then((count) => {

        if (count < 10) {
            var ident = "000" + count;
        } else if (count > 9 && count < 100) {
            var ident = "00" + count;
        } else if (count > 99 && count < 1000) {
            var ident = "0" + count;
        } else {
            var ident = count;
        }

        var newSchedule = new Schedule({
            ident: ident,
            title: title,
            datetime: d,
            attendees: attendees,
            location: location,
            status: "Active",
            createdBy: req.user.full,
            type: type,
        });

        newSchedule.save((err, save) => {
            if (err) {
                console.log(err);
                req.flash("error", "An error has occured!");
                return res.redirect("/schedule");
            } else {
                console.log(save);
                req.flash("info", "Meeting Schedule : " + ident);
                return res.redirect("/schedule");
            }
        })
    })
})



module.exports = router;