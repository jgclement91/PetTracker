var express = require('express');
var router = express.Router();
var isAuthenticated = require('../passport/authenticator').isAuthenticated;


module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
        if (req.user)
            res.redirect('users/profile');
		res.render('index', { message: req.flash('message') });
	});

	/* Handle Login POST */
    router.post('/login', passport.authenticate('login', {failureRedirect:'/'}),function(req, res){
        if (req.session.returnUrl && req.session.returnUrl!='/login' && req.session.returnUrl!='/signout' )
            res.redirect(req.session.returnUrl);
        else
        res.render('users/profile', { user: req.user });
    });

	/* GET Registration Page */
	router.get('/signup', function(req, res){
        if (req.user)
            res.redirect('users/profile');
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/users/profile',
		failureRedirect: '/signup',
		failureFlash : true  
	}));


	/* Handle Logout */
	router.get('/signout', isAuthenticated, function(req, res) {
		req.logout();
		res.redirect('/');
	});

    return router;
}





