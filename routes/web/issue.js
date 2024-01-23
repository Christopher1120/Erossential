var express = require("express");
var nodemailer = require("nodemailer");
var Ticket = require("../../models/tickets");
var User = require("../../models/users");
var Auth = require("../../auth/auth").ensureAuthenticated;

var router = express.Router();

router.use(Auth);


router.get("/", (req, res) => {
    res.render("tickets/home");
});

router.get("/create-ticket", (req, res) => {
    res.render("tickets/_partials/create");
});

router.get("/view-tickets", (req, res) => {
    Ticket.find().then((ticket) => {
        res.render("tickets/_partials/tickets", {ticket:ticket});
    });
})

router.get("/view-ticket/:ident", (req, res) => {
    Ticket.findOne({ ident: req.params.ident }).then((ticket) => {
        res.render("tickets/_partials/view-ticket", { ticket: ticket });
        console.log(ticket);
    })
})


// Data Processing

router.post("/set-status/ticket=:ident", async (req, res) => {
    var ticket = await Ticket.findOne({ ident: req.params.ident });
    var d = new Date();
    var date = d.toISOString();
    var status = req.body.status;
    var resolution = req.body.resolution;

    ticket.status = status;
    ticket.resolution = resolution;
    ticket.completedOn = date;

    try {
        let saveTicket = await ticket.save();
        console.log(saveTicket);
        req.flash("info", "Ticket No: " + ticket.ident + " is " + status);
        return res.redirect("/issue");
    } catch (e) {
        console.log(e);
        req.flash("error", "An error has occured");
        return res.redirect("/issue");
    }
    

})

router.get("/handle-ticket=:ident", (req, res) => {
    Ticket.findOneAndUpdate({ ident: req.params.ident }, { $set: { handleby: { ident: req.user.ident, name: req.user.full, email: req.user.email }, status: "In Progress" } }).then((update) => {
        res.status(200);
        req.flash("info", "Awesome, ticket no: " + req.params.ident + " is now assigned to you!");
        return res.redirect("/issue");
    });
})

router.post("/create-ticket", (req, res) => {

    var issue = req.body.issue;
    var ident = req.body.ident;
    var description = req.body.description;


    User.findOne({ ident: ident }).then((user) => {

        Ticket.count().then((count) => {
            if (count < 10) {
                var idents = "000" + count;
            } else if (count > 9 && count < 100) {
                var idents = "00" + count;
            } else if (count > 99 && count < 1000) {
                var idents = "0" + count;
            } else {
                var idents = count;
            }


            var newTicket = new Ticket({
                ident: idents,
                issue: issue,
                description: description,
                for: {
                    ident: user.ident,
                    name: user.full,
                    email: user.email,
                },
                createdBy: {
                    ident: req.user.ident,
                    name: req.user.full,
                    email: req.user.email
                },
                status: "Pending",
            });

            newTicket.save((err, save) => {
                if (err) {
                    console.log(err);
                    res.status(502);
                    req.flash("error", "An error has occured");
                    return res.redirect("/issue");
                }
                console.log(save);
                res.status(202);
                req.flash("info", "Ticket Created!");
                var transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'system.erossential@gmail.com',
                        pass: 'syizkrtfkevoyvrp'
                    }
                });

                const mailOptions = {
                    from: "system.erossential@gmail.com",
                    to: user.email,
                    cc: "ccruz0000.erossential@gmail.com",
                    subject: "Ticket No." + idents + " is raised",
                    html: "Hi " + user.full + "," + "<br><br>You have created a ticket with ticket no. : " + idents + "<br><br>Our IT Team will be on action for this issue. <br><br> " + "<br>Regards</br>" + "<br>Erossential IT Team</br>"
                }

                transporter.sendMail(mailOptions, (err, success) => {
                    if (err) {
                        req.flash("error", "An error has occured");
                        console.log(err);
                        return res.redirect("/issue");
                    } else {
                        console.log(success.response);
                        return res.redirect("/issue");
                    }
                })
            })

        })
    })
})

router.post("/search-employee/user=:ident", (req, res) => {
    var ident = req.params.ident;
    console.log(ident);

    User.findOne({ ident: ident }).then((user) => {
        if (!user) {
            res.status(404);
            res.send("No Employee Found with " + ident);
            console.log("No User found");
            return;
        } else if (user) {
            res.status(202);
            res.send(user)
            console.log(user);
            return;
        } else {
            res.status(502);
            res.send("An error has occured!");
            console.log("An error has occured")
            return;
        }
    });
})

module.exports = router;

