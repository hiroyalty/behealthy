require('dotenv').config()
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');
const glob = require('glob');
const moment = require('moment');
const fs = require('fs');
const multer  = require('multer');
//const io = require('socket.io');
const dbConfig = require('./db');
const flash = require('connect-flash');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// Configuring Passport
const passport = require('passport');
const session = require('express-session');
const express = require('express');
const app = express();

const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem')

const options = {
      key: sslkey,
      cert: sslcert
};

let users = {};

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to DB
mongoose.connect(dbConfig.url).then(() => {
	console.log('Connected successfully ' + Date.now());
}, err => {
  console.log('Connection to db failed: ' + db + ' :: ' + err);
});

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(session({
    secret: 'mySecretKey',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
// Using the flash middleware provided by connect-flash to store messages in session
 // and displaying in templates
app.use(flash());

// Initialize Passport
const initPassport = require('./passport/init');
initPassport(passport);

const routes = require('./routes/index')(passport);
app.use('/', routes);

// catch 404 and forward to error handler
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
        res.render('pages/error', {
            message: err.message,
            error: err
        });
    });
}

//app.get('/', function (req, res) {
 //  res.send('Hello World!');
//});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});