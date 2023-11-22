var express = require("express");
var path = require("path");


var router = express.Router();



router.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.info = req.flash("info");
    res.locals.error = req.flash("error");

    next();
});



router.use("/", require("./home"));
router.use("/products", require("./products"));
router.use("/purchase-order", require("./po"));
router.use("/investors", require("./investors"));




module.exports = router;