var ensureAuthenticated2 = function ensureAuthenticated2(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "Please sign-in again!");
        return res.redirect("/pos/login");
    }
}


module.exports = { ensureAuthenticated2: ensureAuthenticated2 };