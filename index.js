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
const socketIO = require('socket.io');
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

//app.set('port', (process.env.PORT || 3000));

app.use(express.static(path.join(__dirname + '/public')));
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

//import Chat module
const Chat = require('./models/chat');
//const Chatroom = require('./models/chatroom');

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

const server = http.createServer(options, app).listen(process.env.PORT || 5000, () => {
   console.log('Started and listening on port ' + app.get('port'));
});

//const PORT = process.env.PORT || 5000;
//const INDEX = path.join(__dirname, '/views/chat.ejs');
//const INDEXX = path.join(__dirname, '/views/adminchat.ejs');


//app.use((req, res) => res.sendFile(INDEX) );
//app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
//const server = https.createServer(app).listen(PORT); 


const ios = socketIO(server);
//socket = ios.listen(process.env.PORT);
//app.listen(app.get('port'), function() {
//  console.log('Node app is running on port', app.get('port'));
//});

//module.exports = server;
ios.on('connection', (socket) => {
	var query = Chat.find({ msgtype: 'publicchat' });
	query.sort('-created').limit(5).exec(function(err, docs){
		if(err) throw err;
		console.log('docs ' + docs);
		socket.emit('load old msgs', docs);
	});	
	
	socket.on('new user', (data, callback) => {
		if(data in users) {
			callback(false);
		} else {
			callback(true);
			socket.nickname = data;
			users[socket.nickname] = socket;
			updateNicknames(); //io.sockets.emit('usernames', nicknames);
		}
	});
	
	function updateNicknames(){
		ios.emit('usernames', Object.keys(users));
	}
	
	socket.on('send message', (data, callback) => {
		var msg = data.trim();
		if(msg.substr(0,3) == '/w '){
			msg = msg.substr(3);
			var ind = msg.indexOf(' ');
			if(ind !== -1) {
				var name = msg.substr(0, ind);//check if username is valid
				var msg = msg.substr(ind + 1);
				if(name in users){
					users[name].emit('whisper', {msg: msg, nick: socket.nickname}); //send the trim data instead 'msg' line 36 
					console.log('whisper:');
				} else {
					callback('Error! Enter a valid user.');
				}
				
			} else{
				callback('Error: Please enter a message for your whisper.');
			}
		} else {
			//var newMsg = new Chat({msg: msg, nick: socket.nickname, time: moment().format('YYYY-MM-DD HH:mm:ss')});
			var newMsg = new Chat({msg: msg, nick: socket.nickname, time: moment().format('YYYY-MM-DD HH:mm:ss'), msgtype: 'publicchat' });
			newMsg.save(function(err){
				if(err) throw err;
				ios.emit('new message', {msg: msg, nick: socket.nickname});
			});
		//socket.broadcast.emit('new message', data); To everyone except the user.
		}
	});
	
	socket.on('whisperadmin', (data, callback) => {
		var msg = data.trim();
		var newMsg = new Chat({msg: msg, nick: socket.nickname, time: moment().format('YYYY-MM-DD HH:mm:ss'), msgtype: 'privatechat' });
		newMsg.save(function(err){
			if(err) throw err;
			users['admin'].emit('newwhisperadmin', {msg: msg, nick: socket.nickname});
		});
	});
	
	socket.on('disconnect', (data) => {
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
});