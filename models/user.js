
var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	id: String,
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String,
	time: String,
	dateofbirth: Date,
	height: Number,
	weight: Number,
	role: {type: String, enum: ['member', 'manager', 'admin']},
	preference: {type: Array},
	phonenumber: String,
	meansofcontact: {type: String, enum: ['phone', 'email', 'none']},
	address: [{
         streetaddress: { type: String }
		, city: {type: String}
        , region: { type: String }
        , zip: { type: String }
    }]    
});