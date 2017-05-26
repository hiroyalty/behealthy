require('dotenv').config()
module.exports = {
	//'url' : 'mongodb://<dbuser>:<dbpassword>@novus.modulusmongo.net:27017/<dbName>'
	//'url' : 'mongodb://gbolaga:ayokunle@localhost:27017/catdb'
	//'url' : `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/catdb`
	//'url' : `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/catdb`
	'url' : `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00-ahxal.mongodb.net:27017,cluster0-shard-00-01-ahxal.mongodb.net:27017,cluster0-shard-00-02-ahxal.mongodb.net:27017/${process.env.DB_DATABASE}?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin`

}
