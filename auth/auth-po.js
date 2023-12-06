
var CheckPO = function CheckPO(req, res, next) {
    if (!req.isAuthenticated()) {
        req.flash("error", "Please sign in again!");
        res.redirect("/")
    }
    req.user.access.forEach((access) => {
        if (access.po == true) {
            next();
        } else {
            res.status(401);
            res.render("errors/401");
        }
    })
};


module.exports = { CheckPO: CheckPO };