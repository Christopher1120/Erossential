var express = require("express");
var User = require("../../models/users");
var Orders = require("../../models/orders");
var Batch = require("../../models/batch");
var Month = require("../../models/monthly-sales");
var Inventory = require("../../models/batch");
var Auth = require("../../auth/auth").ensureAuthenticated;
var Online = require("../../auth/auth-online").ensureOnline;
var Report = require("../../auth/auth-report").CheckRep;



var router = express.Router();

router.use(Auth);
router.use(Online);
router.use(Report);


router.get("/", (req, res) => {
    res.render("reports/report");
});

router.get("/batch-sales", (req, res) => {
    Batch.find().then((batch) => {
        res.render("reports/_partial/batch", { batch: batch });
    });
})

router.get("/monthly-sales", (req, res) => {
    Month.find().then((monthly) => {
        res.render("reports/_partial/monthly", { monthly: monthly });
    })
})

router.get("/yearly-sales", (req, res) => {
    Month.aggregate(
        [
            {
                $group: {
                    _id: { year: { $year: "$createdOn" } },
                    profit: { $sum: "$profit" },
                    expenses: { $sum: "$expenses" },
                    sales: {$sum:"$sales"},
                }
            }
        ]
    ).then((yearly) => {
        console.log(yearly);
        res.render("reports/_partial/yearly", { yearly: yearly });
    })
})


module.exports = router;