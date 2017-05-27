const express = require('express');
//const http = require('../server');
const router = express.Router();
//const io = require('socket.io').listen(http);


// maps socket.id to user's nickname
//const nicknames = {};
// list of socket ids
//const clients = [];
//const namesUsed = [];

const isAuthenticated = (req, res, next) => {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

router.get('/chat', isAuthenticated, (req, res) => {
	//res.sendFile(__dirname + '/index.html');
	console.log('loading chat page');
    res.render('pages/chat', { message: req.user.username });
});

//router.get('/chat', isAuthenticated, (req, res) => {
//	console.log('loading admin chat page');
 //   res.render('pages/adminchat', { message: req.user.username });
//});

module.exports = router
//io.sockets.on('connection', (socket) => {

