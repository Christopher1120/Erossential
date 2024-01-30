var express = require("express");
var User = require("../../models/users");
var Orders = require("../../models/purchased");
var Batch = require("../../models/batch");
var Month = require("../../models/monthly-sales");
var Products = require("../../models/inventory");
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
    Batch.aggregate(
        [
            {
                $project: {
                    _id: 1,
                    batchNo: 1,
                    sales: 1,
                    expenses: 1,
                    profit: { $subtract: ["$sales", "$expenses"] }
                }
            }
        ]
    ).then((batch) => {
        console.log(batch);
        res.render("reports/_partial/batch", { batch: batch });
    })


   // Batch.find().then((batch) => {
   //     res.render("reports/_partial/batch", { batch: batch });
   // });
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

router.get("/top-selling", (req, res) => {
    Products.aggregate(
        [
            {
                $group: {
                    _id: "$variant",
                    sold: { $sum: "$sold" },
                }
            },
            {
                $project: {
                    _id: 1,
                    sold: 1,
                    total: {$multiply:["$sold","$price"]}
                }
            }
        ]
    ).sort({ sold: -1 }).then((selling) => {
        console.log(selling);
        res.render("reports/_partial/top-selling", { selling: selling });
    })
})

router.get("/top-selling-products-all", (req, res) => {
    Orders.find().then((orders) => {
        res.render("reports/_partial/orders", { orders: orders });
    })
})


module.exports = router;