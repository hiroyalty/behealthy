const io = require('socket.io');
const moment = require('moment');
const Chat = require('../models/chat');
const Chatroom = require('../models/chatroom');

const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

let users = {};
const server = require('../server');
const ios = io.listen(server);

module.exports = function(server) {	
ios.sockets.on('connection', (socket) => {
	console.log('loading io');
	var query = Chat.find({});
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
		//io.sockets.emit('usernames', Object.keys(users));
        socket.emit('usernames', Object.keys(users));
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
			var newMsg = new Chat({msg: msg, nick: socket.nickname, time: moment().format('YYYY-MM-DD HH:mm:ss'), msgtype: 'publicchat' });
			newMsg.save(function(err){
				if(err) throw err;
				//io.sockets.emit('new message', {msg: msg, nick: socket.nickname});
				console.log('emiting new msg');
                //socket.emit('new message', {msg: msg, nick: socket.nickname});
				server.emit('new message', {msg: msg, nick: socket.nickname});
			});
		//socket.broadcast.emit('new message', data); To everyone except the user.
		}
	});
	
	socket.on('whisperadmin', (data, callback) => {
		var msg = data.trim();
		var newMsg = new Chat({msg: msg, nick: socket.nickname, time: moment().format('YYYY-MM-DD HH:mm:ss'), msgtype: 'privatechat' });
		newMsg.save(function(err){
			if(err) throw err;
			users['admin'].emit('whisper', {msg: msg, nick: socket.nickname});
		});
	});
	
	socket.on('disconnect', (data) => {
		if(!socket.nickname) return;
		delete users[socket.nickname];
		updateNicknames();
	});
//});
});
}