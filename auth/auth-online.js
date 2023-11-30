var ensureOnline = function ensureOnline(req, res, next) {
    if (req.user.online == "Online") {
        next();
    } else {
        req.logout((err) => {
            if (err) {
                console.log(err);
                return;
            }
            req.flash("error","You have been logged-out")
            return res.redirect("/");
        })
    }
}

module.exports = {ensureOnline:ensureOnline}