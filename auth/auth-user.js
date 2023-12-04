
var CheckUser = function CheckUser(req, res, next) {
    req.user.access.forEach((access) => {
        if (access.user == true || access.user == null) {
            next();
        } else {
            res.status(401);
            res.render("errors/401");
        }
    })
};


module.exports = { CheckUser: CheckUser };