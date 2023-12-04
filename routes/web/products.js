var express = require("express");
var Inventory = require("../../models/inventory");
var Auth = require("../../auth/auth").ensureAuthenticated;
var PON = require("../../models/pon");
var PO = require("../../models/po");
const ensureOnline = require("../../auth/auth-online").ensureOnline;
const CheckInv = require("../../auth/auth-inv").CheckInv;

var router = express.Router();


router.use(Auth);
router.use(ensureOnline);
router.use(CheckInv);

router.use(function check(req, res, next) {

    req.user.access.forEach((access) => {
        if (access.inv == true) {
            next();
        } else {
            res.status(401);
            res.render("errors/401");
        }
    })

})


router.get("/", (req, res) => {
    PON.find().then((po) => {
        res.render("products/products", {po:po});
    });
});

router.get("/product-list", (req, res) => {
    Inventory.find().then((prod) => {
        res.render("products/_partial/product-list", {prod:prod});
    });
})


// DATA Processing

router.get("/batch-search", (req, res) => {
    var ubatch = req.query.batch;
    var prod = req.query.product;

    var product = prod.toLowerCase();


    console.log(ubatch,product)

    PO.find({ batchNo: ubatch, product: product }).then((batches) => {
        res.status(202)
        console.log(batches);
        return res.send(batches);
    })
})

router.post("/modify-product", (req, res) => {
    var batch = req.body.batch;
    var i = req.body.product;
    var qty = req.body.qty;
    var variant = req.body.variant;
    var price = req.body.price;
    var fix = (price * 1) * (1 * 1);
    fix.toFixed(2);
    console.log(fix);

    var prod1 = productN.toLowerCase();
    var prod2 = variant.toLowerCase();

    Inventory.findOne({ batchNo: batch, productName: prod1 }).then(async (prod) => {
        if (!prod) {
            res.status(404);
            res.send("Product Not Found!");
            return;
        }
        if (prod) {

            
        } else {
            res.status(502);
            res.send("An error has occured!");
            return;
        }
    })

})


router.post("/add-products", (req, res) => {

    var batch = req.body.batch;
    var product = req.body.product;
    var variant = req.body.variant;
    var qty = req.body.qty;
    var price = req.body.price;
    var fix = (price * 1) * (1 * 1);
    fix.toFixed(2);
    console.log(fix);

    var prod1 = product.toLowerCase();
    var prod2 = variant.toLowerCase();

    Inventory.findOne({ batchNo: batch, productName: prod1, variant: prod2 }).then(async (prod) => {

        if (prod) {
            var intv = await Inventory.findOne({ _id: prod._id });
            var pos = await PO.findOne({ type: "Inventory", batchNo: batch, product: prod1, variant: prod2 });
            console.log("Purchase Product", po);

            if (!pos) {
                res.status(404);
                res.send("Product Not Found!");
                return;
            }

            else if (pos.inventory <= 0) {
                res.status(404);
                res.send("Product is out of stock : " + pos.inventory);
                return
            } else if (pos.inventory < qty) {
                res.status(502);
                res.send("Stock Left : " + pos.inventory);

            } else {

                var cal = (pos.inventory * 1) - (qty * 1);
                console.log(cal);
                var qtys = (intv.qty * 1) + (qty * 1);

                intv.qty = qtys;
                intv.price = price;
                pos.inventory = cal;


                try {
                    let saveProd = await intv.save();
                    let savePO = await pos.save();
                    console.log("saveProduct", saveProd, "Save PO", savePO);
                    res.status(200)
                    res.send("Product Modified!");
                    return;
                } catch (e) {
                    console.log(e);
                    res.status(402);
                    res.send("An error has occured!");
                    return;
                }
            }
        }
        if (!prod) {
            var po = await PO.findOne({ type: "Inventory", batchNo: batch, product:prod1, variant: prod2 });
            
            if (!po) {
                res.status(404);
                res.send("No product found on PO");
            }

            else if (po.inventory <= 0) {
                res.status(404);
                res.send("This product has been cleared already");
                return
            }
            else {
                var newProd = new Inventory({
                    batchNo: batch,
                    productName: prod1,
                    qty: qty,
                    price: fix,
                    sold: 0,
                    variant:prod2
                });

                var cal = (po.inventory * 1) - (qty * 1);
                po.inventory = cal;

                try {
                    let savePO = await po.save();
                    console.log("Saving PO", savePO);
                    newProd.save((err, save) => {
                        if (err) {
                            console.log(err);
                            res.status(502);
                            res.send("An error has ocurred")
                            return;
                        }
                        res.status(200);
                        res.send("Product Added To Inventory!");
                        console.log(save);
                        return;
                    })

                } catch (e) {
                    console.log(e);
                }

                
            }
        }
    })

})



module.exports = router;