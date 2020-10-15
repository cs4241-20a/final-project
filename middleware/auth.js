module.exports = {
    ensureAuth: function (req, res, next) {
        if (!req.user) {
            res.redirect("/login");
        } else {
            next();
        }
    },
    ensureGuest: function (req, res, next) {
        if (req.user) {
            res.redirect("/");
        } else {
            return next();
        }
    }
}
