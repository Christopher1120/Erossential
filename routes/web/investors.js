var express = require("express");
var router = express.Router();
var Investor = require("../../models/investors");
var Auth = require("../../auth/auth").ensureAuthenticated;
var Batch = require("../../models/batch");
var multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './contracts')
    },
    filename: function (req, file, cb) {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        cb(null, req.params.id + "-investment-contract" + ext);
    }
})

const upload = multer({ storage })


var router = express.Router();


router.use(Auth);

router.get("/", (req, res) => {
    res.render("investors/investors");
})

router.get("/add-investors", (req, res) => {
    res.render("investors/_partials/add-investors");
});

router.get("/upload-contract/investor=:id", (req, res) => {
    Investor.findById(req.params.id).then((investor) => {
        res.render("investors/_partials/approved", {investor:investor});
    });
})

router.get("/information/:id", (req, res) => {
    Investor.findById(req.params.id).then((investor) => {
        Investor.count().then((count) => {
            Batch.aggregate([
                {
                    $group: {
                        _id: 0,
                        total: { $sum: "$sales" }
                    }
                }
            ]
            ).then(sales => {
                sales.forEach((sale) => {
                    var cal = (sale.total * 1) / (count * 1) + (investor.amount * 1);
                    console.log(sale.total);
                    var tot = cal.toFixed(2);
                    var total = tot;
                    res.render("investors/_partials/info", { investor: investor, sale: sale, count: count, total: total });
                    console.log(sales, total);
                });
            });
        });
    })
})


// DATA Processing

router.post("/add-payment-details/:id", (req, res) => {
    var account = req.body.accountname;
    var number = req.body.accountnumber;
    var bank = req.body.bank;

    Investor.findByIdAndUpdate(req.params.id, { $set: { payment: { account: account, number: number, bank: bank, payment:true } } }).then(async (update) => {
        req.flash("info", "Payment Information Added!");
        return res.redirect("/investors");
        console.log(update);
    })
    
})

router.post("/upload-contract/investor=:id", async (req, res) => {
    var investor = await Investor.findOne({ ident: req.params.id });
    var file = req.body.link;

    investor.file = file;


    try {
        let saveInvestor = await investor.save();
        console.log("Uploading Contract", saveInvestor);
        req.flash("info", "Contract Uploaded for " + investor.full);
        return res.redirect("/investors");
    } catch (e) {
        console.log(e)
        req.flash("error", "An error has occured");
        return res.redirect("/investors");
    }

})

router.get("/investor=:id/approved", async (req, res) => {
    var investor = await Investor.findById(req.params.id);

    investor.status = "Approved";
    investor.file = '';

    try {
        let saveInvestor = await investor.save();
        console.log("Saving Investor", saveInvestor);
        req.flash("info", investor.full + " is approved");
        return res.redirect("/investors");
    } catch (e) {
        console.log(e)
        req.flash("error", "An error has occured");
        return res.redirect("/investors");
    }

})

router.post("/search-investor=:type", (req, res) => {
    var invest = req.params.type;
    console.log(invest);

    if (invest != "All") {
        Investor.find({ status: invest }).then((investor) => {
            res.render("investors/_partials/investor", { investor: investor });
            console.log(invest, investor);
        })
    } else {
        Investor.find().then((investor) => {
            res.render("investors/_partials/investor", { investor: investor });
            console.log("All", investor);
        });
    }
})

router.post("/add-investors", (req, res) => {
    var first = req.body.first;
    var last = req.body.last;
    var full = first + " " + last;
    var contact = req.body.contact;
    var email = req.body.email;
    var invested = req.body.invested;
    var partner = req.body.partner;
    var start = req.body.start;
    var end = req.body.end;
    var dstart = new Date(start);
    var dend = new Date(end);


    Investor.findOne({ full: full }).then((user) => {
        if (user) {
            req.flash("error", "Investor already exist in the system!");
            return res.redirect("/investors");
        } else if (!user) {

            Investor.count().then((count) => {

                if (count < 10) {
                    var ident = "000" + count;
                } else if (count > 9 && count < 100) {
                    var ident = "00" + count;
                } else if (count > 99 && count < 1000) {
                    var ident = "0" + count;
                } else {
                    var ident = count;
                }

                var newInvestor = new Investor({
                    ident: ident,
                    firstName: first,
                    lastName: last,
                    full: full,
                    contact: contact,
                    email: email,
                    amount: invested,
                    start: dstart,
                    end: dend,
                    spartner: partner,
                    payment: [{'bank':'', 'account':'', 'number':'', payment:false}],
                    status: "Pending"
                });

                newInvestor.save((err, save) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "An error has occueed")
                        return res.redirect("/investors");
                    }
                    console.log(save);
                    req.flash("info", "Investor is now added, waiting for approval!");
                    return res.redirect("/investors");
                })

            })
        } else {
            req.flash("error", "An error has occured");
            return res.redirect("/investors");
        }
    })
})


module.exports = router;