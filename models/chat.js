var mongoose = require('mongoose');

module.exports = mongoose.model('Chatmessage',{
  nick: String,
  msg: String,
  created: {type: Date, default: Date.now},
  time: String,
  msgtype: {type: String, enum: ['publicchat', 'privatechat']}
});

exports.getOldMsgs = function(limit, cb){
	var query = Chat.find({ msgtype: 'publicchat' });
	query.sort('-created').limit(limit).exec(function(err, docs){
		cb(err, docs);
	});
}

exports.saveMsg = function(data, cb){
	var newMsg = new Chat({msg: data.msg, nick: data.nick });
	newMsg.save(function(err){
		cb(err);
	});
};

//exports.savePrivateMsg = function(data, cb){
//	var newMsg = new Chat({msg: data.msg, nick: data.nick, msgtype: 'privatechat'});
//	newMsg.save(function(err){
//		cb(err);
//	});
//};