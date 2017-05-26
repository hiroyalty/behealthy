const express = require('express');
const moment = require('moment');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/booking');

const isAuthenticated = (req, res, next) => {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

//load page for user settings
router.get('/settings', isAuthenticated, (req, res) => {
	res.render('pages/setup', { message: 'welcome '+ req.user.username });
});

//post user seting to end point
router.post('/preference', isAuthenticated, (req, res) => {
  console.log(JSON.stringify(req.body));
  User.findOneAndUpdate({_id: req.user._id}, {
    $set: {
      dateofbirth: req.body.dateofbirth,
      height: req.body.height,
	    weight: req.body.weight,
	    role: req.body.role
	  //preference: req.body.preference
    } 
  },{
    //sort: {_id: -1},
    upsert: false
  },(err, result) => {
    if (err) return res.send(err)
  }) //update the array values in preference
	User.findOneAndUpdate({_id: req.user._id}, {  
		$push : { preference: {$each:  req.body.preference  }  }
	},{
    upsert: false
  },(err, result) => {
  if (err) return res.send(err)
    //res.send(result)
	//res.render('pages/home', { message: 'updated '+ req.user });
	res.render('pages/landing', { message: 'updated '+ req.user.username });
  })
});

//load page for user additional info
router.get('/moreinfo', isAuthenticated, (req, res) => {
	res.render('pages/moreinfo', { message: 'welcome '+ req.user.username });
});
//update user info at the backend
router.post('/moreinfo', isAuthenticated, (req, res) => {
  console.log(JSON.stringify(req.body));
  User.findOneAndUpdate({_id: req.user._id}, {
    $set: {
      phonenumber: req.body.phonenumber,
      meansofcontact: req.body.optionsRadios
	}
	},{
    //sort: {_id: -1},
    upsert: false
  },(err, result) => {
    if (err) return res.send(err)
  }) //update the array values in preference
	User.findOneAndUpdate({_id: req.user._id}, {  
		$set : { address: {  'streetaddress': req.body.streetaddress,
							'city': req.body.city,
							'region': req.body.region,
							'zip': req.body.zip  }  }
	},{
    upsert: false
  },(err, result) => {
  if (err) return res.send(err)
    //res.send(result)
	res.render('pages/landing', { message: 'updated '+ req.user.username });
  })
//} 
});

router.get('/book', isAuthenticated, (req, res) => {
	res.render('pages/booking', { message: req.user.username });
});

router.post('/book', isAuthenticated, (req, res) => {
  console.log(JSON.stringify(req.body));
  const newBooking = new Booking();
  newBooking.category = req.body.bookcategory;
  newBooking.username = req.body.username;
  newBooking.details = req.body.bookdetails;
  newBooking.datesubmitted = moment().format('YYYY-MM-DD');
  newBooking.appointment = req.body.bookappointment;
  //save the booking
  newBooking.save((err) => {
    if (err){
      console.log('Error in saving booking: '+err);
      throw err;
    }})
  res.render('pages/landing', { message: req.user.username });
})
module.exports = router