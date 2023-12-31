
var CheckPOS = function CheckPOS(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please sign in again!");
        res.redirect("/pos/logim")
    }
    req.user.access.forEach((access) => {
        if (access.pos == true) {
            next();
        } else {
            res.status(401);
            res.render("errors/401");
        }
    })
};


module.exports = { CheckPOS: CheckPOS }