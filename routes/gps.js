var express = require('express');
var router = express.Router();
var isAuthenticated = require('../passport/authenticator').isAuthenticated;
var Zone = require("../models/zone");
var Gps = require("../models/taggGps");
var config = require("../config");

module.exports = function () {


    router.get('/create', isAuthenticated, function (req, res) {
        res.render('gps/create', {user: req.user});
    });

    router.post('/create', isAuthenticated, function (req, res) {

        Gps.findOne({'name': req.body.gps.name, allowedUser: req.user._id}, function (err, _gps) {
            if (err) {
                res.end('{"message" : "An error occured. No changes has been saved."');
            }

            if (_gps) {
                res.json({"success": false, "message": "Vous avez déjà un système Tagg Gps associé à cet animal"});
            }
            else {
                Zone.findOne({'name': req.body.gps.zone, allowedUser: req.user._id}, function (err, zone) {

                    if (err) {
                        res.end('{"message" : "An error occured. No changes has been saved."');
                    }
                    saveGps(req.body.gps, req.user, zone, res);

                })
            }

        });

    });

    //TODO: callback en parametre pour le retour au navigateur
    function saveGps(gps, user, zone, res) {

        var newGps = new Gps({
            name: gps.name, materialId: gps.materialId, allowedUser: user, associatedZone: zone
        });

        newGps.save(function (err) {
            if (err) {

                console.log('An error occured during gps creation.');
                console.log(err);
                res.end('{"message" : "An error occured. No changes has been saved."');
            }
            else
                res.json({"success": true, "message": "Le Gps a été ajouté avec succès."})
        });
    }

    router.get('/update', isAuthenticated, function (req, res) {
        Gps.findOne({'name': req.query.id, allowedUser: req.user._id}, function (err, gps) {
            if (!err) {
                //inspect.substr parce que j'arrivais pas à avoir accès au id de la zone en sub document du gps
                Zone.findById((gps.associatedZone) ? gps.associatedZone.inspect().substr(2, 24) : null, function (err, zone) {
                    res.render('gps/update', {gps: gps, user: req.user, zone: zone});
                })
            }
            else {
                console.log('An error occured during gps/update get.');
                res.end('{"message" : "An error occured. No changes has been saved."');
            }


        })

    });


    router.post('/update', isAuthenticated, function (req, res) {

        Gps.findOne({'name': req.body.gps.oldName, allowedUser: req.user._id}, function (err, gps) {

            if (err) {
                console.log('An error occured during gps edition.');
                res.end('{"message" : "An error occured. No changes has been saved."');
            }
            else {
                //TODO: Enregistrer aussi la zone à l'update, quand il y aura un drop down list
                gps.name = req.body.gps.name;
                gps.materialId = req.body.gps.materialId;

                gps.save(function (err) {
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
        Gps.find({allowedUser: req.user._id}, function (err, gpsList) {
            if (err) {
                console.log('An error occured during gps query.');
                res.end('{"message" : "An error occured. No changes has been saved."');
            }

            res.render('gps/list', {gpsList: gpsList, user: req.user, googleMapApiKey: config.googleMaps_apiKey});
        });
    });

    router.post('/delete', isAuthenticated, function (req, res) {
        Gps.remove({name: req.body.id, allowedUser: req.user._id}, function (err) {
            if (err) {
                console.log('An error occured during TaggGps query.');
                res.end('{"message" : "An error occured. No changes has been saved."');
                res.json({"success": false});
            }
            else
                res.json({"success": true});
        });
    });


    return router;
}





