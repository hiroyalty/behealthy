
var mongoose = require('mongoose');

module.exports = mongoose.model('Blog',{
	id: String,
	category: String,
	title: String,
	teaser: String,
	details: String,
	blogimage: String,
	datepublished: Date,
	dateexpired: Date,
	dateupdated: Date,
	published: {type: String, enum: ['yes', 'no']}
});