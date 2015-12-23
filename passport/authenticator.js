/**
 * Created by Julien on 11/09/2015.
 */


exports.isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects

    req.session.returnUrl = req.originalUrl;
    if (req.isAuthenticated())

        return next();
    // if the user is not authenticated then redirect him to the login page
    res.redirect('/');
}