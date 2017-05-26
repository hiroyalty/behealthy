const express = require('express');
const router = express.Router();
const Blog = require('../models/blog');

const isAuthenticated = (req, res, next) => {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

router.use('/users', require('./users'));
router.use('/blog', require('./blog'));
router.use('/chat', require('./chat'));

module.exports = (passport) => {

	//router.use('/users', require('./users'));

	/* GET login page. */
	router.get('/', (req, res) => {
    	// Display the Login page with any flash message, if any
		res.render('pages/index', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: 'home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', (req, res) => {
		res.render('pages/register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: 'home',
		failureRedirect: 'signup',
		failureFlash : true  
	}));

	/* GET Home Page :list all active content */
	router.get('/home', isAuthenticated, (req, res) => {
		Blog.find( { published: "yes", dateexpired: {$gt: new Date() } })
			.exec().then(
				d => {
					console.log(d);
					//res.send(d);
					res.render('pages/home', { user: req.user, blog: d });
			}
	),
	err => {
		res.send('Error: ' + err);
	};
		//res.render('pages/home', { user: req.user });
	});
	
	/* GET Home Page :list all content */
	router.get('/allcontent', isAuthenticated, (req, res) => {
		Blog.find()
			.exec().then(
				d => {
					console.log(d);
					//res.send(d);
					res.render('pages/home', { user: req.user, blog: d });
			}
	),
	err => {
		res.send('Error: ' + err);
	};
		//res.render('pages/home', { user: req.user });
	});
	
	// load landing page
	router.get('/landing', isAuthenticated, (req, res) => {
		res.render('pages/landing', { message: req.user.username });
	});
	
	/* Handle Logout */
	router.get('/signout', (req, res) => {
		req.logout();
		res.redirect('/');
	});

	return router;
}





