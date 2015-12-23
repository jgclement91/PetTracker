var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');
var mongoose = require('mongoose');
var util = require('util');
mongoose.connect(config.dbPath);
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




var passport = require('passport');
var expressSession = require('express-session');

app.use(expressSession({secret: config.expressSessionKey}));
app.use(passport.initialize());
app.use(passport.session());


var flash = require('connect-flash');
app.use(flash());


var initPassport = require('./passport/init');
initPassport(passport);

var routes = require('./routes/index')(passport);
var userController = require('./routes/users')(passport);
var zoneController = require('./routes/zone')(passport);
var gpsController = require('./routes/gps')(passport);
var alertController = require('./routes/alert')(passport);
app.use('/', routes);
app.use('/users',userController);
app.use('/zone',zoneController);
app.use('/gps',gpsController);
app.use('/alert',alertController);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.locals.ioServer = util.format("%s:%s",config.serverDomain,config.socketIoPort)

var io = require('socket.io')(config.socketIoPort);
io.on('connection', function (socket) {
    console.log("Connexion socket.io");
    socket.on('alert', function (data) {
        console.log(data);
        var accountSid = config.twilio_accountSID;
        var authToken = config.twilio_authToken;

        //require the Twilio module and create a REST client
        var client = require('twilio')(accountSid, authToken);
        var date = new Date();
        var minutes = (date.getMinutes() < 10) ? "0"+date.getMinutes() : date.getMinutes();
        var seconds = (date.getSeconds() < 10) ? "0"+date.getSeconds() : date.getSeconds();
        var hour = date.getHours()+":"+minutes+":"+seconds;

        client.messages.create({
            to: config.twilio_numberTo,
            from: config.twilio_numberFrom,
            body: "Attention, "+data+" est sorti de sa zone à "+hour
        }, function(err, message) {
            console.log(message.body);
            console.log(message.sid);
        });
        socket.broadcast.emit("animalOut", "Attention, "+data+" est sorti de sa zone!");
    });
});

module.exports = app;
