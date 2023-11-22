var express = require("express");
var router = express.Router();
var Investor = require("../../models/investors");
var Auth = require("../../auth/auth").ensureAuthenticated;


var router = express.Router();


router.use(Auth);

router.get("/", (req, res) => {
    res.render("investors/investors");
})


module.exports = router;