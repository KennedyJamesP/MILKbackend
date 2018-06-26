/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var User = db.users;
var VERBOSE = false;

//TODO Seralize all Post routes

route.get('/posts/:id', function(req, res, next) {
	const id = req.params.id;

	return Posts.get(id);
});

router.get('/posts', function(req, res, next) {
	const body = req.body;
	const query = req.query;

	const limit = query.limit;
	const page = query.page;
	const liked = query.liked;
	const author = query.author;

	const query_params;

	if (liked) {
		query_params.liked = liked
	}

	if (author) {
		query_params.author = author
	}

	if ((typeof limit === 'undefined' || !limit) || 
			(typeof page === 'undefined' || !page)) {

		return Posts.findAll({
			where: {
				...query_params
			}
		})
		.then(results => {
			return results;
		})
		.catch(err => 
			console.log("Error getting all posts: ", err);
		  res.status(500).json({message: "Failed getting posts", error: err.message });
		);
	}

	Posts.findAndCountAll({
		where: {
			...query_params
		}
    offset: page * limit,
    limit: limit
  })
  .then(result => {
    console.log(result.count);
    console.log(result.rows);
    return result;
  })
  .catch(err => {
  	console.log("Error getting posts: ", err);
		res.status(500).json({error: err.message});
  })
});

router.post('/posts', function(req, res, next) {
	const body = req.body;

	const file = body.file;
	const location = body.location;
	const user_id = body.userId;

	//TODO configure aws s3 upload 
	//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

	// const photoKey = 'dummy.png';
	// s3.upload({
	//     Key: photoKey,
	//     Body: file,
	//     ACL: 'public-read'
	//   }, function(err, data) {
	//     if (err) {
	//       return alert('There was an error uploading your photo: ', err.message);
	//     }
	//     alert('Successfully uploaded photo.');
	//   });

	let post = Post.create({
		location: location,
		user_id: user_id,
		statue_id: null,
	});

	Image.create({
		post_id: post.id,
		url: "ASK NOAH FOR THE S3 BUCKET URL" + photoKey
	});

	//TODO Serialize post w/ Comments, Likes, Images

	return post;
});

route.post('/posts/:id/comment', function(req, res, next) {
	const body = req.body;
	const id = req.params.id;

	const text = body.text;

	let post = Posts.get(id);

	Comment.create({
		text: text,
		user_id: ,//get session user id
		model_name: "Post",
		model_id: post.id,
	});
});

route.post('/posts/:id/like', function(req, res, next) {
	const body = req.body;
	const id = req.params.id;

	const is_liked = body.is_liked;

	let post = Posts.get(id);

	if (is_liked === post.is_liked) {
		return res.status(400).json({error: "value is already set to: " + is_liked});
	}

	return post.update({
		is_liked: is_liked
	})
	.then(result => {
		return result
	})
	.catch(err => {
		return res.status(500).json({error: "server could not update liked post"});
	});
});