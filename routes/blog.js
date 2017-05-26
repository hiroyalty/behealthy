const express = require('express');
const moment = require('moment');
const fs = require('fs');
const multer  = require('multer');
const glob = require('glob');
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
const deleteFiles = (dfilename) => {
	glob('public/files/uploads/'+dfilename, (err,files) => {
	if (err) throw err;
		files.forEach((item,index,array) => {
		console.log(item + " found");
	});
	// Delete files
	files.forEach((item,index,array) => {
		fs.unlink(item, (err) => {
        if (err) throw err;
        console.log(item + " deleted");
		});
	});
});
};
/*************for multer image upload***********************/

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/files/uploads'); // set the destination
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname); // set the file name and extension
    }
});

const upload = multer({storage: storage});
/*****************************/
//load page for creating blogs
router.get('/makeblog', isAuthenticated, (req, res) => {
	res.render('pages/makeblog', { message: 'welcome '+ req.user.username });
});

//make blog and display a list of all blogs
router.post('/makeblog', isAuthenticated, upload.single('blogimage'), (req, res) => {
        console.log(JSON.stringify(req.body));
		var newBlog = new Blog();
        //set the blog's properties credentials
        newBlog.category = req.body.blogcategory;
        newBlog.title = req.body.blogtitle;
		newBlog.teaser = req.body.teaser;
        newBlog.details = req.body.details;
		newBlog.blogimage = req.file.filename;
        newBlog.datepublished = moment().format('YYYY-MM-DD');
        newBlog.dateexpired = req.body.expireddate;
		newBlog.dateupdated = moment().format('YYYY-MM-DD');
		newBlog.published = req.body.publish;
        // save the blog
        newBlog.save((err) => {
			if (err){
				console.log('Error in Saving user: '+err);  
				throw err;  
		}})
		//res.render('pages/home', { message: 'updated '+ req.user });
		Blog.find()
			.exec().then(
				d => {
			res.render('pages/home', { blog: d });
		}
		),
			err => {
				res.send('Error: ' + err);
		};
    //}
//)
});

//delete a blog and its file
router.get('/delete/:id/:filename', (req, res) => {
	console.log(JSON.stringify(req.params));
	glob('public/files/uploads/'+req.params.filename, (err,files) => {
		if (err) throw err;
		files.forEach((item,index,array) => {
			console.log(item + " found");
		});
		// Delete files
		files.forEach((item,index,array) => {
			fs.unlink(item, (err) => {
               if (err) throw err;
               console.log(item + " deleted");
			});
		});
	});
    Blog.remove({"_id": (req.params.id)}, (err, docs) => {  //db.users.remove({"_id": ObjectId("4d512b45cc9374271b02ec4f")});
        if (err) return err;
        console.log(docs);
        //res.send(docs);
		//res.render // comment out for web service
    });
	Blog.find()
			.exec().then(
				d => {
			res.render('pages/home', { blog: d });
		}
		),
			err => {
				res.send('Error: ' + err);
		};
});

//get full blog for display
router.get('/getfullblog/:id', (req, res) => {
	const aval = req.params.id;
	 Blog.findOne({"_id": (req.params.id)}, (err, result) => {
	if (err) return err;
	//res.send(result);
	//console.log(JSON.stringify(result));
	res.render('pages/fullblog', {oneblog : result } )
	});
});

//get a blog for update
router.get('/getblog/:id', (req, res) => {
	const aval = req.params.id;
	 Blog.findOne({"_id": (req.params.id)}, (err, result) => {
	if (err) return err;
	//res.send(result);
	console.log(JSON.stringify(result));
	res.render('pages/updateblog', {oneblog : result } )
	});
});

//update one blog
router.post('/updateblog', isAuthenticated, (req, res) => {
  //db.collection('quotes')
  console.log('body id ' + JSON.stringify(req.body.did));
  //deleteFiles(req.body.blogimage); get the blog details first.
  Blog.findOneAndUpdate({_id: req.body.did}, {
    $set: {
      title: req.body.upblogtitle,
	  teaser: req.body.upteaser,
      details: req.body.updetails,
	  category: req.body.upblogcategory,
	  dateexpired: req.body.upexpireddate,
	  dateupdated: moment().format('YYYY-MM-DD'),
	  published: req.body.uppublish
    }
  }, {new: true},
  (err, result) => {
    if (err) return res.send(err)
	res.render('pages/landing', { message: req.user.username });
  });
  //upload.single('upblogimage');
});


module.exports = router