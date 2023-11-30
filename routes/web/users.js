var express = require("express");
var User = require("../../models/users");
var Auth = require("../../auth/auth").ensureAuthenticated;
const ensureOnline = require("../../auth/auth-online").ensureOnline;

var router = express.Router();


router.use(Auth);
router.use(ensureOnline);


router.get("/", (req, res) => {
    res.render("users/users");
});

router.get("/list", (req, res) => {
    User.find().then((user) => {
        res.render("users/_partial/list", { user: user });
    });
});

router.get("/user=:id/assign-post", (req, res) => {
    User.findById(req.params.id).then((user) => {
        res.render("users/_partial/post", { user: user });
    })
})

router.get("/user=:id/assign-role", (req, res) => {
    User.findById(req.params.id).then((user) => {
        res.render("users/_partial/roles", { user: user });
    })
})

router.get("/user=:id/profile", (req, res) => {
    User.findById(req.params.id).then((user) => {
        res.render("users/profile", { user: user });
    })
})


// DATA Process

router.post("/user=:id/assign-post", async (req, res) => {
    var post = req.body.post;

    var user = await User.findById(req.params.id);

    user.position = post;

    try {
        let saveUser = await user.save();
        console.log("Saving User", saveUser);
        req.flash("info", user.full + "'s position is updated!");
        return res.redirect("/users");
    } catch (e) {
        console.log(e);
        req.flash("error", "An error occured while updating post!");
        return res.redirect("/users");
    } 

})

router.post("/user=:id/assign-role", async (req, res) => {
    var role = req.body.role;

    var user = await User.findById(req.params.id);

    user.role = role;

    try {
        let saveUser = await user.save();
        console.log("Saving User", saveUser);
        req.flash("info", user.full + "'s role is updated!");
        return res.redirect("/users");
    } catch (e) {
        console.log(e);
        req.flash("error", "An error occured while updating role!");
        return res.redirect("/users");
    }

})


router.get("/user=:id/log-out", async (req, res) => {

    var user = await User.findById(req.params.id);

    user.online = "Offline";


    try {
        let saveUser = await user.save();
        console.log("Saving User", saveUser);
        res.status(202);
        res.send(user.full + " has been logged out");
    } catch (e) {
        console.log(e);
        res.status(404);
        res.send("An error has occured");
    }
})

router.get("/user=:id/reset-password", async (req, res) => {

    var user = await User.findById(req.params.id);

    user.password = "Erossential19.";


    try {
        let saveUser = await user.save();
        console.log("Saving User", saveUser);
        res.status(202);
        res.send(user.full + "'s password has been reset!");
    } catch (e) {
        console.log(e);
        res.status(404);
        res.send("An error has occured");
    }
})




module.exports = router;