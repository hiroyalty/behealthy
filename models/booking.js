
var mongoose = require('mongoose');

module.exports = mongoose.model('Booking',{
	id: String,
	category: String,
	username: String,
	details: String,
	datesubmitted: Date,
	appointment: {type: String, enum: ['yes', 'no']}
});