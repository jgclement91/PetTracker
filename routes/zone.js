var express = require('express');
var router = express.Router();
var isAuthenticated = require('../passport/authenticator').isAuthenticated;
var Zone = require("../models/zone");

module.exports = function () {


    router.get('/create', isAuthenticated, function (req, res) {
        res.render('zone/create', {user: req.user});
    });

    router.post('/create', isAuthenticated, function (req, res) {

        Zone.findOne({'name': req.body.zone.name, allowedUser: req.user._id}, function (err, zone) {
            if (err) {
                res.end('{"message" : "An error occured. No changes has been saved."');
            }

            if (zone) {
                res.json({"success": false, "message": "Vous avez déjà une zone portant ce nom"});
            }
            else {
                var newZone = new Zone({
                    name: req.body.zone.name, shape: JSON.stringify(req.body.zone.shape), allowedUser: req.user
                });

                newZone.save(function (err) {
                    if (err) {

                        console.log('An error occured during zone creation.');
                        console.log(err);
                        res.end('{"message" : "An error occured. No changes has been saved."');
                    }
                    res.json({"success": true, "message": "La zone a été créée avec succès."})
                });
            }

        });


    });

    router.get('/update', isAuthenticated, function (req, res) {
        Zone.findOne({'name': req.query.id, allowedUser: req.user._id}, function (err, zone) {
            if (!err) {
                res.render('zone/update', {zone: zone, user: req.user});
            }
        })

    });


    router.post('/update', isAuthenticated, function (req, res) {

        Zone.findOne({'name': req.body.zone.oldName, allowedUser: req.user._id}, function (err, zone) {

            if (err) {
                console.log('An error occured during zone edition.');
                res.end('{"message" : "An error occured. No changes has been saved."');
            }
            else {
                zone.name = req.body.zone.name;
                zone.latitude = req.body.zone.latitude;
                zone.longitude = req.body.zone.longitude;
                zone.radius = req.body.zone.radius;
                zone.save(function (err) {
                    if (err) {
                        console.log('An error occured while saving the user.');
                        res.end('{"message" : "An error occured. No changes has been saved."');
                    }
                    else
                        res.json({"success": true});
                });
            }

        });

    });

    router.get('/list', isAuthenticated, function (req, res) {
        Zone.find({allowedUser: req.user._id}, function (err, zones) {
            if (err) {
                console.log('An error occured during zone query.');
                res.end('{"message" : "An error occured. No changes has been saved."');
            }

            res.render('zone/list', {zones: zones, user: req.user});
        });
    });

    router.post('/delete', isAuthenticated, function (req, res) {
        Zone.remove({name: req.body.id, allowedUser: req.user._id}, function (err) {
            if (err) {
                console.log('An error occured during zone query.');
                res.end('{"message" : "An error occured. No changes has been saved."');
                res.json({"success": false});
            }
            else
                res.json({"success": true});
        });
    });


    return router;
}





