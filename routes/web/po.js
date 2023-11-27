var express = require("express");
var Auth = require("../../auth/auth").ensureAuthenticated;
var PO = require("../../models/po");
var PON = require("../../models/pon");
var Batch = require("../../models/batch");
var fs = require("fs");
var pdfKit = require("pdfkit");



var router = express.Router();

router.use(Auth);


router.get("/", (req, res) => {
    PON.find().then((po) => {
        res.render("purchased-order/purchase", {po:po});
    });
});

router.get("/create-po/po=:ident", (req, res) => {
    PON.findOne({ purchNo: req.params.ident }).then((purch) => {
        res.render("purchased-order/create", { purch: purch });
    })
})

router.get("/create-po/po=:ident/list", (req, res) => {
    PO.find({ purchNo: req.params.ident }).then((purch) => {
        res.render("purchased-order/_partial/item-list", { purch: purch });
    })
})

// DATA Processing

router.post("/create-po/po=:ident/add-info", async (req, res) => {

    var fee = req.body.fee;
    var supplier = req.body.supplier;
    var order = req.body.order;
    var received = req.body.received;
    var type = req.body.type;

    var initial = await PON.findOne({ purchNo: req.params.ident });


    var total = req.body.total;
    initial.delivery = fee;
    initial.supplier = supplier;
    initial.total = total;
    initial.orderOn = order;
    initial.receivedOn = received;
    initial.type = type;



    try {
        let saveInit = await initial.save();
        console.log("Adding Delivery Fee", saveInit);
        res.status(200);
        res.redirect("/purchase-order/create-invoice/" + initial.purchNo);
        return;

    } catch (e) {
        console.log(e);
        req.flash("error", "An error has occured");
        return res.redirect("/purchase-order");
    }
});

router.get("/create-invoice/:ident", async (req, res) => {
    PON.findOne({ purchNo: req.params.ident }).then(async (po) => {
        var prod = await PO.find({ purchNo: req.params.ident });
        var d = new Date();
        var year = d.getFullYear();
        var month = d.getMonth() + 1;
        var day = d.getDate();
        var date = month + "/" + day + "/" + year;
        var oid = year + month + day;
        var time = d.toLocaleTimeString();

        let companyLogo = "./images/Eros.png";
        let fileName = './invoices/' + req.params.ident + ".pdf";
        let fontNormal = 'Helvetica';
        let fontBold = 'Helvetica-Bold';

        let sellerInfo = {
            "companyName": po.supplier,
        }

        let customerInfo = {
            "customerName": "Erossential",
            "address": "80 Sitio Tibagan Brgy. Cupang",
            "city": "Antipolo City",
            "state": "Rizal",
            "postcode": "1870",
            "country": "Philippines",
            "contactNo": "+639614978517"
        }
            let orderInfo = {
                "orderNo": oid,
                "invoiceNo": po.purchNo,
                "invoiceDate": date,
                "invoiceTime": time,
                "totalValue": po.total,
                "products": [
                    {
                        "product": prod.product,
                        "variant": prod.variant,
                        "unitPrice": prod.unit,
                        "totalPrice": prod.cost,
                        "qty": prod.qty
                    }
                ],
                "totalValue": po.total
            }



            function createPdf() {
                try {

                    let pdfDoc = new pdfKit();

                    let stream = fs.createWriteStream(fileName);
                    pdfDoc.pipe(stream);

                    pdfDoc.image(companyLogo, 25, 20, { width: 50, height: 50 });
                    pdfDoc.font(fontBold).text('EROSSENTIAL', 7, 75);
                    pdfDoc.font(fontNormal).fontSize(14).text('PURCHASED ORDER INVOICE', 400, 30, { width: 300 });

                    pdfDoc.font(fontBold).text("Sold by:", 7, 100);
                    pdfDoc.font(fontNormal).text(sellerInfo.companyName, 7, 115, { width: 250 });

                    pdfDoc.font(fontBold).text("Customer details:", 400, 100);
                    pdfDoc.font(fontNormal).text(customerInfo.customerName, 400, 115, { width: 250 });
                    pdfDoc.text(customerInfo.address, 400, 130, { width: 250 });
                    pdfDoc.text(customerInfo.city + " " + customerInfo.postcode, 400, 145, { width: 250 });
                    pdfDoc.text(customerInfo.state + " " + customerInfo.country, 400, 160, { width: 250 });

                    pdfDoc.text("Order No:" + orderInfo.orderNo, 7, 195, { width: 250 });
                    pdfDoc.text("Invoice No:" + orderInfo.invoiceNo, 7, 210, { width: 250 });
                    pdfDoc.text("Date:" + orderInfo.invoiceDate + " " + orderInfo.invoiceTime, 7, 225, { width: 250 });

                    pdfDoc.rect(7, 250, 560, 20).fill("#FC427B").stroke("#FC427B");
                    pdfDoc.fillColor("#fff").text("Product", 110, 256, { width: 100 });
                    pdfDoc.text("Variant", 20, 256, { width: 190 });
                    pdfDoc.text("Qty", 300, 256, { width: 100 });
                    pdfDoc.text("Price", 400, 256, { width: 100 });
                    pdfDoc.text("Total Price", 500, 256, { width: 100 });

                    let productNo = 1;
                    prod.forEach(element => {
                        console.log("adding", element.product);
                        let y = 256 + (productNo * 20);
                        pdfDoc.fillColor("#000").text(element.product, 110, y, { width: 100 });
                        pdfDoc.text(element.variant, 20, y, { width: 190 });
                        pdfDoc.text(element.qty, 300, y, { width: 100 });
                        pdfDoc.text(element.unit, 400, y, { width: 100 });
                        pdfDoc.text(element.cost, 500, y, { width: 100 });
                        productNo++;
                    });

                    pdfDoc.rect(7, 256 + (productNo * 20), 560, 0.2).fillColor("#000").stroke("#000");
                    productNo++;
                    pdfDoc.font(fontBold).text("Total:", 400, 300 + (productNo * 17));
                    pdfDoc.font(fontBold).text(po.total, 500, 300 + (productNo * 17));

                    pdfDoc.end();
                    console.log("pdf generate successfully");
                } catch (error) {
                    console.log("Error occurred", error);
                }
            }

        createPdf();
        req.flash("info", "PO created!");
        return res.redirect("/purchase-order");
        });
})

router.post("/create-po/po=:ident", (req, res) => {

    var order = req.body.order;
    var received = req.body.received;
    var product = req.body.product;
    var variant = req.body.variant;
    var qty = req.body.qty;
    var unit = req.body.unit;
    var amount = req.body.amount;
    var type = req.body.type;

    var lower1 = product.toLowerCase();
    var lower2 = variant.toLowerCase();

    PON.findOne({ purchNo: req.params.ident }).then((po) => {
        PO.findOne({ purchNo: po.purchNo, batchNo: po.batchNo, variant: lower2, product:lower1 }).then(async (purch) => {
            console.log(purch);
            if (purch) {
                
                var uPO = await PO.findById(purch._id);

                var qqty = (purch.qty * 1) + (qty * 1);
                console.log("M Quantity", qqty);
                var cal = (purch.unit * 1) * (qqty * 1);
                var fix = cal.toFixed(2);
                console.log("M Cost", fix);

                uPO.qty = qqty;
                uPO.cost = fix;


                var uPON = await PON.findById(po._id);

                var initial = (uPON.total * 1) + (fix * 1);

                uPON.total = initial;
                po.inventory = qqty

                try {
                    let savePO = await uPO.save();
                    let savePON = await uPON.save();
                    console.log("Saving PO", savePO, "Saving PON", savePON);
                    res.status(200);
                    res.send(savePON);
                    return;
                } catch (e) {
                    console.log(e);
                    res.send("An error occured on line 274");
                    return;
                }

                

            }

            var newPO = new PO({
                purchNo: po.purchNo,
                batchNo: po.batchNo,
                product: lower1,
                variant: lower2,
                qty: qty,
                unit: unit,
                cost: amount,
                inventory: qty,
                type: type

            });

            newPO.save(async (err, save) => {
                if (err) {
                    console.log(err);
                    res.status(404);
                    res.send("An error has occured!");
                    return;
                }

                console.log(save);

                var prod = await PON.findOne({ purchNo: req.params.ident });
                var initial = prod.total;

                var cal = (initial * 1) + (amount * 1);
                var fix = cal.toFixed(2);

                prod.total = fix;

                try {
                    let saveProd = await prod.save();
                    console.log("Added Product", saveProd);
                    res.status(202);
                    res.send(saveProd);
                    return;
                } catch (e) {
                    console.log(e);
                    res.status(502);
                    res.send("Internal Error!");
                    return;
                }
            })

                
        
        })
    })
})

router.get("/assign-batch/po=:ident", async (req, res) => {
    var po = await PON.findOne({ purchNo: req.params.ident });

    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;

    Batch.count().then(async (count) => {
        var ident;

        if (count < 10) {
            var ident = year + "-000" + count;
        } else if (count > 9 && count < 100) {
            var ident = year + "-00" + count;
        } else if (count > 99 && count < 1000) {
            var ident = year + "-0" + count;
        } else {
            var ident = year + "-" + count;
        }

        po.batchNo = ident;
        console.log(po);

        var newBatch = new Batch({
            batchNo: ident,
            purchNo: req.params.ident,
            sales: 0,
            loss: 0,
            expenses:0,
            year: year,
            month: month,
            createdBy:req.user.full,
        })

        try {
            let savePO = await po.save();
            let saveBatch = await newBatch.save();
            console.log("savePO", savePO, "saveBatch", saveBatch);
            req.flash("info", "Batch Assign : " + ident);
            return res.redirect("/purchase-order/create-po/po=" + req.params.ident);
        } catch (e) {
            console.log(e);
            res.status(502);
            req.flash("error", "An error has occured")
            return res.redirect("/purchase-order/create-po/po=" + req.params.ident);
            return;
        }

    });

})

router.get("/create-po", (req, res) => {

    var d = new Date();
    var year = d.getFullYear();

    PON.count().then((count) => {
        var ident, batch;

        if (count < 10) {
            var ident = "23-000" + count;
        } else if (count > 9 && count < 100) {
            var ident = "23-00" + count;
        } else if (count > 99 && count < 1000) {
            var ident = "23-0" + count;
        } else {
            var ident = "23-" +count;
        }
        console.log("Purchased Order : " + ident, "Batch No. : " + batch);


        var newPO = new PON({
            purchNo: ident,
            requestBy: req.user.full,
            total: "00.00"
        });
        newPO.save((err, save) => {
            if (err) {
                console.log(err);
                req.flash("error", "An error has occured");
                return res.redirect("/purchase-order");
            }
            console.log(save);
            return res.redirect("/purchase-order/create-po/po=" + ident);
        })
    })
})



module.exports = router;