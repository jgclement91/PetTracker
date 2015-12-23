var express = require('express');
var router = express.Router();
var isAuthenticated = require('../passport/authenticator').isAuthenticated;
var Busboy = require('busboy');
var path = require('path');
var fs = require('fs');
var User = require('../models/user');

module.exports = function () {


    router.get('/profile', isAuthenticated, function (req, res) {
        res.render('users/profile', {user: req.user});
    });

    router.post('/edit', isAuthenticated, function(req, res){

        User.findOne({'username': req.user._doc.username}, function (err, user) {

            if (err) {
                console.log('An error occured during profile edit.');
                res.end('{"message" : "An error occured. No changes has been saved."');
            }

            user.firstName = req.body.user.firstName;
            user.lastName = req.body.user.lastName;
            user.email = req.body.user.email;
            user.save(function(err){
                if (err) {
                    console.log('An error occured while saving the user.');
                    res.end('{"message" : "An error occured. No changes has been saved."');
                }
                else
                    res.json({"success" : "true", "message": "Les modification ont été enregistrées."});
            });
        });

    });


    router.post('/savePicture', function (req, res) {

        var saveTo = '';
        var busboy = new Busboy({headers: req.headers});
        busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            if (filename==""){
                console.log('No file submitted');
                return res.redirect('/users/profile');
            }
            saveTo = path.join('./public/uploads/', filename);
            console.log('Uploading: ' + saveTo);
            file.pipe(fs.createWriteStream(saveTo));
            User.findOne({'username': req.user._doc.username}, function (err, user) {
                user.picturePath = filename;
                user.save();
            });
        });
        busboy.on('finish', function () {

            console.log('Upload complete');
            res.redirect('/users/profile');

        });
        req.pipe(busboy);

    });

    router.get('/partialEdit', isAuthenticated, function(req, res){
        res.render('users/partialEdit', {user: req.user});
    });

    router.get('/partialDetail', isAuthenticated, function(req, res){
        res.render('users/partialDetail', {user: req.user});
    });

    return router;
}





