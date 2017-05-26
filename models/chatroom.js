var mongoose = require('mongoose');

module.exports = mongoose.model('Chatuser',{
    id: String,
    username: String
});