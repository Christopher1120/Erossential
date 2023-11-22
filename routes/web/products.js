var express = require("express");
var Inventory = require("../../models/inventory");
var Auth = require("../../auth/auth").ensureAuthenticated;
var PON = require("../../models/pon");
var PO = require("../../models/po");

var router = express.Router();

router.use(Auth);


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
    var batch = req.query.batch;
    var product = req.query.product;

    PO.find({ batchNo: batch,product:product }).then(async (batch) => {
        try {
            res.send(batch);
            console.log(batch);
            return;
        } catch (e) {
            res.status(404);
            res.send("An error has occured");
            console.log(e);
            return;
        }
    })
})

router.post("/modify-product", (req, res) => {
    var batch = req.body.batch;
    var productN = req.body.product;
    var qty = req.body.qty;
    var variant = req.body.variant;
    var price = req.body.price;
    var fix = (price * 1) * (1 * 1);
    fix.toFixed(2);
    console.log(fix);

    Inventory.findOne({ batchNo: batch, productName: productN }).then(async (prod) => {
        if (!prod) {
            res.status(404);
            res.send("Product Not Found!");
            return;
        }
        if (prod) {

            var product = await Inventory.findOne({ _id: prod._id });
            var po = await PO.findOne({type:"Inventory", batchNo: batch, product: productN, variant: variant });
            console.log("Pruchase Product", po);

            if (!po) {
                res.status(404);
                res.send("Product Not Found!");
                return;
            }

            else if (po.inventory == 0) {
                res.status(404);
                res.send("Product is out of stock : " + po.inventory);
                return
            } else {

                var cal = po.inventory - qty;
                var qtys = product.qty + qty;

                product.qty = qtys;
                product.price = price;
                po.inventory = cal;
                

                try {
                    let saveProd = await product.save();
                    let savePO = await po.save();
                    console.log("saveProduct", saveProd,"Save PO", savePO);
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

    Inventory.findOne({ batchNo: batch, productName: product, variant:variant }).then(async (prod) => {

        if (prod) {
            console.log(prod)
            res.status(502);
            res.send("Product Exist! Please modify instead!");
            return;
        }
        if (!prod) {
            var po = await PO.findOne({ type: "Inventory", batchNo: batch, variant: variant });
            
            if (!po) {
                res.status(404);
                res.send("No product found on PO");
            }

            else if (po.inventory == null) {
                res.status(404);
                res.send("This product has been cleared already");
                return
            }
            else {
                var newProd = new Inventory({
                    batchNo: batch,
                    productName: product,
                    qty: qty,
                    price: fix,
                    sold: 0,
                    variant:variant
                });

                var cal = po.inventory - qty;
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