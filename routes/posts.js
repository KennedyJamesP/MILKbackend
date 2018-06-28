/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var Post = db.post;
var VERBOSE = false;

const { body, validationResult } = require('express-validator/check');

/*
*	WHY THE F ARE CLASS & INSTANCE METHODS NOT WORKING :(
*/

const model_name = "Post";

// ---- GET POSTS BY ID ----

router.get('/:id', function(req, res, next) {
	const id = req.params.id;

	if (!id) {
    return res.status(400).json({error: "no id provided"});
  }

	const query = Posts.get_by_id(id);

	if (query.error) {
		return res.status(query.status).json({error: query.error});
	}

	res.json(query);
});

// ---- GET POSTS ----

router.get('', function(req, res, next) {

	const query = req.query;

	const limit = query.limit;
	const page = query.page;
	const liked = query.liked;
	const author = query.author;

	const user_id = req.session.user_id;

	let query_params;

	if (liked) {
		let likes = Like.findAll({
			where: {
				model_name: model_name,
				user_id: author ? author : user_id
			}
		})
		.then(result => {
			console.log("got liked posts:", result)
			return result;
		})
		.catch(err => {
			console.log("failed to get liked posts")
			return {error: err.message, status: 500};
		});

		if (likes.error) {
			return res.status(likes.status).json({error: likes.error})
		}

		query_params.likes = [];
		likes.forEach(function(el) {
			query_params.likes.push(el.model_id);
		});
	}

	if (author) {
		query_params.author = author
	}

	res.local.query_params = query_params;
	next();

}, function(req,res,next) {

	const query = req.query;

	const limit = query.limit;
	const page = query.page;

	const query_params = res.local.query_params;

	if (limit || page) {
		next();
	}

	if (query_params.author) {
		return Posts.findAll({
			where: {
				user_id: query_params.author
			}
		})
		.then(posts => {
			res.json(posts);
		})
		.catch(err => {
			console.log("Error getting all posts: ", err);
		   res.status(500).json({error: err.message});
		});
	} else if (query_params.likes) {
		return Posts.findAll({
			where: {
				id: query_params.likes
			}
		})
		.then(posts => {
			res.json(posts);
		})
		.catch(err => {
			console.log("Error getting all posts: ", err);
		  res.status(500).json({error: err.message});
		});
	} 

	return Posts.findAll()
	.then(posts => {
		res.json(posts);
	})
	.catch(err => {
		console.log("Error getting all posts: ", err);
	  res.status(500).json({error: err.message});
	});
	
}, function(req,res) {

	const query = req.query;

	const limit = query.limit;
	const page = query.page;

	const query_params = res.local.query_params;

	if (query_params.author) {
		return Posts.findAndCountAll({
			where: {
				user_id: query_params.author
			},
			offset: page * limit,
    	limit: limit
		})
		.then(posts => {
			console.log(posts.count);
    	console.log(posts.rows);
			res.json(posts);
		})
		.catch(err => {
			console.log("Error getting all posts: ", err);
		  res.status(404).json({error: err.message});
		});
	} else if (query_params.likes) {
		return Posts.findAndCountAll({
			where: {
				id: query_params.likes
			},
			offset: page * limit,
    	limit: limit
		})
		.then(posts => {
			console.log(posts.count);
    	console.log(posts.rows);
			res.json(posts);
		})
		.catch(err => {
			console.log("Error getting all posts: ", err);
		  res.status(404).json({error: err.message});
		});
	}

	return Posts.findAndCountAll({
		offset: page * limit,
    limit: limit
	})
	.then(posts => {
		console.log(posts.count);
  	console.log(posts.rows);
		res.json(posts);
	})
	.catch(err => {
		console.log("Error getting all posts: ", err);
	  res.status(404).json({error: err.message});
	});
});

// ---- POST A POST ----

router.post('', [
		body('file').not().exists().withMessage("Failed to provide an image to upload"),
		body('location').not().isEmpty().withMessage("Please provide location"),
	],function(req, res, next) {

	//check form validation before consuming the request
	const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let errorObj = {};
  	errors.array().forEach(function(err) {
  		errorObj[err.param] = err.msg;
  	})
  	return res.status(422).json({error:errorObj});
  }

	const body = req.body;

	const file = body.file;
	const location = body.location;
	const user_id = req.session.user_id;

	//TODO configure aws s3 upload 
	//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

	const photoKey = 'dummy.png';
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
	let post = Post.perform_create(user_id, location, null);

	//pass statue to next state
	res.locals.post = post;
	res.locals.image_key = photoKey;
	next();

}, function(req,res,next) {

	const post = res.locals.post;
	const image_key = res.locals.image_key;

	if (post.error) {
		return res.status(post.status).json({error: post.error});
	}

	//This is going to fail. find way to securely patch in s3 bucket url without submitting it to github
	let image = Image.create({
		post_id: post.id,
		url: "ASK NOAH FOR THE S3 BUCKET URL/" + image_key
	})
	.then(result => {
		console.log("Successfully created image: ", result);
		return result;
	})
	.catch(err => {
		console.log("Failed to create image");
		return {status: 500, error: err.message};
	});

	if (image.error) {
		return res.status(image.status).json({error: image.error});
	}

	//TODO Serialize post w/ Comments, Likes, Images
	//For now...
	return res.json(post);
});

// ---- POST A COMMENT ----

router.post('/:id/comment', function(req, res, next) {
	const body = req.body;
	const post_id = req.params.id;

	const text = body.text;

	let post = Post.get_by_id(post_id);

	if (post.error) {
		return res.status(image.status).json({error: image.error});
	}

	//NEED TO GET USER_ID FROM SERVER SESSION OR PASS IN IN BODY
	let comment = Comment.create_with_model(model_name, post_id, user_id);

	if (comment.error) {
		return res.status(comment.status).json({error: comment.error});
	}

	res.json(comment);
});

// ---- LIKE A POST ----

router.post('/:id/like', function(req, res, next) {

		const body = req.body;
		const post_id = req.params.id;
		const is_liked = body.is_liked;

		const post = Post.get_by_id(post_id);

		if (post.error) {
			return res.status(post.status).json({error: post.error})
		}

		res.local.post = post;
		next();

	}, function(req,res,next) {

		const post_id = req.params.id;
		const user_id = req.session.user_id;

		const like = Like.get_like_by_user(post_id, user_id);

		res.local.like = like;
		next();

	}, function(req,res,next) {
		const like = res.local.like;

		if (like.error) {
			return res.status(like.status).json({error: like.error})
		}

		//create like if not found and user liked post
		if (like === null && is_liked === true) {
			const newLike = Like.create_with_model(model_name, post_id, user_id);
			if (newLike.error) {
				return res.status(newLike.status).json({error: newLike.error});
			}

			return res.json(newLike)

		//delete like if like found and user unliked post 
		} else if (like !== null && is_liked === false) {
			const delteLike = Like.remove(model_name, post_id, user_id);

			if (delteLike.error) {
				return res.status(delteLike.status).json({error: delteLike.error});
			}

			return res.json(delteLike)
		}
});

module.exports = router;