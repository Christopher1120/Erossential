var express = require("express");
var Promos = require("../../models/promos");
var Auth = require("../../auth/auth").ensureAuthenticated;

var router = express.Router();

router.use(Auth);


router.get("/", (req, res) => {
    res.render("promos/promos");
});

router.get("/create-promo", (req, res) => {
    res.render("promos/_partial/create");
});

router.get("/promo-list", (req, res) => {
    Promos.find().then((promo) => {
        res.render("promos/_partial/list", { promo: promo });
    })
})

router.get("/promo-code=:code", (req, res) => {
    Promos.findById(req.params.code).then((promo) => {
        res.render("promos/_partial/promo-info", { promo: promo });
    })
})

// Data processing

router.post("/create-promo", (req, res) => {

    var name = req.body.name;
    var code = req.body.code;
    var start = req.body.start;
    var expiry = req.body.end;
    var amount = req.body.amount;
    var product = req.body.product;
    var qty = req.body.qty;
    var variant = req.body.variant;

    Promos.findOne({ code: code }).then((promo) => {
        if (promo) {
            req.flash("eror","Promo is existing!");
            return res.redirect("/promos");
        } else {

            var startP = new Date(start);
            var expiryP = new Date(expiry);

            var newPromo = new Promos({
                name: name,
                code:code,
                start: startP,
                expiry: expiryP,
                criteria: [{ "product": product, "qty": qty, "variant": variant }],
                amount: amount,
                createdBy: req.user.full,
                status: "Active"
            });

            newPromo.save((err, save) => {
                if (err) {
                    console.log(err);
                    req.flash("error", "An error has occured!");
                    return;
                }
                console.log("Saving Promo");
                req.flash("info", "Promo has been created : " + code);
                return res.redirect("/promos");
            })


        }
    })

})


module.exports = router;

