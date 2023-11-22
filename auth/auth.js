var ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash("error", "Please sign-in again!");
        return res.redirect("/");
    }
}


module.exports = { ensureAuthenticated: ensureAuthenticated };