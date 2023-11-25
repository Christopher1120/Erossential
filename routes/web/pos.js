var express = require("express");
var Products = require("../../models/inventory");
var Batch = require("../../models/batch");
var Cx = require("../../models/customers");
var User = require("../../models/users");
var Order = require("../../models/orders");
var Purchased = require("../../models/purchased");
var Auth = require("../../auth/auth").ensureAuthenticated;
var Auth2 = require("../../auth/auth2").ensureAuthenticated2;
var passport = require("passport");


var router = express.Router();


router.use(Auth2);

router.get("/login", (req, res) => {
    res.render("pos/login");
});

router.get("/", (req, res) => {
    res.render("pos/pos");
})

router.get("/oid=:ident", (req, res) => {
    Order.findOne({ oid: req.params.ident }).then((order) => {
        Batch.find().then((batch) => { 
            if (!order || !batch) {
                req.flash("error", "Some data are missing!");
                return res.redirect("/pos");
            }
            res.render("pos/create-order", { order: order,batch:batch });
        })
    })
})

router.get("/oid=:ident/assign", (req, res) => {
    Order.findOne({ oid: req.params.ident }).then((order) => {
        res.render("pos/_partial/register", { order: order });
    })
})

router.get("/oid=:ident/purchased", (req, res) => {
    Purchased.find({ oid: req.params.ident }).then((pur) => {
        Order.findOne({ oid: req.params.ident }).then((order) => {
            res.render("pos/_partial/purchased", { pur: pur, order: order });
        });
    })
})

router.get("/oid=:ident/items", (req, res) => {

    var batch = req.query.batch;

    Products.find({ batchNo: batch }).then((prod) => {
        Order.findOne({ oid: req.params.ident }).then((order) => {
            res.render("pos/_partial/itm", { prod: prod, order:order });
            console.log(prod);
        });
    });
})

router.get("/oid=:ident/add-to-cart=:id", (req, res) => {
    Products.findById(req.params.id).then((prod) => {
        res.render("pos/_partial/qty", { prod: prod });
    })
})



// DATA Processing

router.post("/oid=:ident/add-to-cart=:id", async (req, res) => {
    var inventory = await Products.findOne({ _id: req.params.id });
    var order = await Order.findOne({ oid: req.params.ident });
    var purch = await Purchased.findOne({ oid: req.params.oid, productName: inventory.productName,batch:inventory.batch, variant:inventory.variant, });
    var batched = await Batch.findOne({ batchNo: inventory.batchNo });
    var qty = req.body.qty;
    var cal = (inventory.price * 1) * (qty * 1);
    var fix = cal.toFixed(2);
    var unit = inventory.price
    var u = unit.toFixed(2);


    if (!inventory) {
        res.status(404);
        res.send("No product match!");
        return;
    }
    else if (inventory.qty <= 0) {
        res.status(502);
        res.send("Opps! No more stocks with " + inventory.productName + " " + inventory.variant);
        return;
    }
    else if (inventory.qty < qty) {
        res.status(502);
        res.send(inventory.productName + " " + inventory.variant + " stocks left : " + inventory.qty);
        return;
    }

    if (purch) {
        var minus = (inventory.qty * 1) - (qty * 1);
        var sold = (inventory.sold * 1) + (qty * 1);

        var add = (purch.qty * 1) + (qty * 1) // Results of how many;
        var ordertotal = (qty * 1) * (inventory.unit * 1) // Partial results for Order-total itself ;
        var total = (add) * (inventory.unit * 1) // Calculation for purchase units;
        var purchtotal = (total * 1) + (purch.total * 1) // total price of purchased unit;

        var fix = purchtotal.toFixed(2);
        var tot = ordertotal.toFixed(2);

        var fin = (order.total) + (ordertotal * 1) // Final result for the total of the order;
        var fixed = fin.toFixed(2);

        var batchTotal = (batched.sales * 1) + (total * 1);
        var batchFix = batchTotal.toFixed(2);

        inventory.qty = minus;
        inventory.sold = sold;
        purch.qty = add;
        purch.total = fix;
        order.total = tot;
        batched.sales = batchFix

        try {
            let saveInt = await inventory.save();
            let savePurch = await purch.save();
            let savetotal = await order.save();
            let saveBatch = await batched.save();

            console.log("Modifying Inventory", saveInt, "Modifying Purchase", savePurch, "Modifying Order", savetotal, "Modifying Batch", saveBatch);

            res.status(202);
            res.send("Product Modified!");

        } catch (e) {
            res.status(502);
            res.send("Internal Error Occured!");
            console.log(e);
            return;
        };

    } else if (!purch) {

        console.log(fix, unit);

        var minus = (inventory.qty * 1) - (qty * 1);
        var sold = (inventory.sold * 1) + (qty * 1);



        inventory.qty = minus;
        inventory.sold = sold;
        order.total = (order.total * 1) + (fix * 1);
        batched.sales = (batched.sales * 1) + (fix * 1);


        var newPurch = new Purchased({
            oid: order.oid,
            productName: inventory.productName,
            variant: inventory.variant,
            batch: inventory.batchNo,
            qty: qty,
            unit: u,
            total: fix,
            createdBy: req.user.full
        });

        try {
            let saveInv = await inventory.save();
            let saveBatch = await batched.save();
            let saveOrder = await order.save();
            console.log("Modifying inventory", saveInv, "Modifying Batch", saveBatch, "Modifying Order", saveOrder);
            newPurch.save((err, save) => {
                if (err) {
                    console.log(err);
                    res.status(502);
                    res.send("An error has occured");
                    return;
                }
                res.status(202);
                res.send("Product Added To Cart!");
                return;
            })
        } catch (e) {
            console.log(e);
            res.status(502);
            res.send("Internal Error Occured!");
            return;
        }
        
    }

});

router.post("/oid=:ident/search-contact=:contact", (req, res) => {

    var contact = req.params.contact;
    console.log(contact);

    Cx.findOne({ contact: contact }).then((cx) => {
        if (!cx) {
            res.status(404);
            return res.send("No customer found with number indicated");

        } else {
            res.status(200);
            return res.send(cx);
        }
    })

})


router.post("/oid=:ident/assign", async (req, res) => {
    var type = req.body.type;
    var cx = req.body.cx;
    var street = req.body.street;
    var city = req.body.city;
    var contact = req.body.contact;
    var contact2 = req.body.contact2;

    console.log("Contact2", contact2);
    console.log("Contact1", contact);


    if (type == "New Customer") {

        Cx.findOne({ cx: cx, contact: contact }).then((cs) => {

            if (cs) {
                console.log("Cx is existing");
                req.flash("error", "Customer exist on database!");
                return res.redirect("/pos/oid=" + req.params.ident);
            }

            Cx.count().then((count) => {
                if (count < 10) {
                    var ident = "000" + count;
                } else if (count > 9 && count < 100) {
                    var ident = "00" + count;
                } else if (count > 99 && count < 1000) {
                    var ident = "0" + count;
                } else {
                    var ident = count;
                }

                var idcx = ident.toString();

                var newCx = new Cx({
                    uid: ident,
                    name: cx,
                    contact: contact,
                    street: street,
                    city:city,
                    createdBy: req.user.full
                });

                newCx.save(async (err, save) => {
                    if (err) {
                        console.log(err);
                        req.flash("error", "An error has occured");
                        return res.redirect("/pos/oid=" + req.params.ident);
                    } else {

                        Order.updateOne({ oid: req.params.ident }, { $set: { assigned: true, cid: idcx, customer: { name: cx, contact: contact, street: street,city:city } } }).then(async (update) => {
                            console.log(update, save);
                            req.flash("info", "Order Assigned to customer");
                            return res.redirect("/pos/oid=" + req.params.ident);
                        })

                    }
                })

            })
        });
    } else {
        Cx.findOne({ contact: contact }).then((cxs) => { 
            console.log(cxs);
            Order.updateOne({ oid: req.params.ident }, { $set: { assigned: true, cid: cxs.uid, customer: { name: cxs.name, contact: cxs.contact, street: cxs.street, city: cxs.city } } }).then(async (update) => {
                console.log(update);
                req.flash("info", "Order Assigned to customer");
                return res.redirect("/pos/oid=" + req.params.ident);
            });
        })
    }
})


router.post("/login", passport.authenticate("login", {
    successRedirect: "/pos/",
    failureRedirect: "/pos/login",
    failureFlash: true
}));

router.get("/create-order", (req, res) => {

    var d = new Date();
    d.getUTCFullYear();
    const ymd = d.toISOString().split('T')[0].split("-");
    const year = ymd[2] + ymd[1] + ymd[0];


    Order.count().then((count) => {
        if (count < 10) {
            var ident = year + "000" + count;
        } else if (count > 9 && count < 100) {
            var ident = year + "00" + count;
        } else if (count > 99 && count < 1000) {
            var ident = year + "0" + count;
        } else {
            var ident = year + count;
        }

        console.log(ident);


        var newOrder = new Order({
            oid: ident,
            assigned: false,
            deliveryFee: 0,
            cost: 0,
            discount: 0,
            total: 0,
            createdBy: req.user.full,
            status: "Creating"
        });

        newOrder.save((err, save) => {
            if (err) {
                console.log(err);
                req.flash("error", "An error has occured");
                return res.redirect("/pos");
            }
            console.log(save);
            return res.redirect("/pos/oid=" + ident);
        })
    })
})




module.exports = router;