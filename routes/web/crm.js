var express = require("express");
var Auth = require("../../auth/auth").ensureAuthenticated;
var Order = require("../../models/orders");
var Purchased = require("../../models/purchased");
var User = require("../../models/users");
var Cx = require("../../models/customers");
const ensureOnline = require("../../auth/auth-online").ensureOnline;

var router = express.Router();


router.use(Auth);
router.use(ensureOnline);

router.get("/", (req, res) => {
    res.render("crm/customers");
})

router.get("/cxrm", (req, res) => {
    Cx.find().then((cx) => {
        res.render("crm/_partial/cx-record", { cx: cx });
    })
})

router.get("/cx-uid=:uid", (req, res) => {
    Cx.findById(req.params.uid).then((cx) => {
        Order.find({ cid: cx.uid }).then((order) => {
            Purchased.find({ oid: order.oid }).then((purch) => {
                    res.render("crm/_partial/cx-info", { cx: cx, order: order, purch: purch });
            });
        });
    })
})


module.exports = router;