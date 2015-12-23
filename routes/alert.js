var express = require('express');
var router = express.Router();
var isAuthenticated = require('../passport/authenticator').isAuthenticated;
var Gps = require("../models/taggGps")
var User = require("../models/user")
var ObjectId = require('mongoose').Types.ObjectId;


module.exports = function(passport){


    router.get('/', isAuthenticated, function(req, res) {

        Gps.find({}, function (err, list) {
            if (err) {
                res.end('{"message" : "An error occured. No changes has been saved."');
            }
            var gpsList = [];
            var x = 0;
            list.forEach(function(gps){
                var oi =  ObjectId(gps.allowedUser[0].toJSON());
                User.findById(oi.toJSON(), function (err, user) {
                    x++;
                    var element = {
                        name: gps.name,
                        user: user.username
                    };
                    gpsList.push(element);

                    if (x == list.length) {
                        console.log(gpsList);
                        res.render('alert/list', {user: req.user, gpsList: gpsList});
                    }
                });

            });


           // res.render('gps/list', {gpsList: gpsList, user: req.user});
        });

	});


	return router;
}





