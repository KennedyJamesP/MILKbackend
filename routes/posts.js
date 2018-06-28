/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var Post = db.post;
var VERBOSE = false;

const model_name = "Post";

router.get('/:id', function(req, res, next) {
	const id = req.params.id;

	if (!id) {
    return res.status(400).json({error: "no id provided"});
  }

	return Posts.get_by_id(id);
});

router.get('/', function(req, res, next) {
	const body = req.body;
	const query = req.query;

	const limit = query.limit;
	const page = query.page;
	const liked = query.liked;
	const author = query.author;

	let query_params;

	if (liked) {
		let likes = Like.findAll({
			where: {
				model_name: model_name,
				user_id: author
			}
		})
		.then(result => {
			console.log("got liked posts:", result)
			return result;
		})
		.catch(err => {
			console.log("failed to get liked posts")
			return res.status(500).json({error: err.message});
		});

		query_params.likes = [];
		likes.forEach(function(el) {
			query_params.likes.push(el.model_id);
		});
	}

	if (author) {
		query_params.author = author
	}

	if ((typeof limit === 'undefined' || !limit) || 
			(typeof page === 'undefined' || !page)) {
		return Posts.findAll({
			where: {
				liked: query_params.likes,
				user_id: query_params.author
			}
		})
		.then(results => {
			return results;
		})
		.catch(err => {
			console.log("Error getting all posts: ", err);
		  res.status(404).json({error: err.message});
		});
	}

	return Posts.findAndCountAll({
		where: {
			liked: query_params.likes,
			user_id: query_params.author
		},
    offset: page * limit,
    limit: limit
  })
  .then(result => {
    console.log(result.count);
    console.log(result.rows);
    //may need to patch together paginated object here
    return result;
  })
  .catch(err => {
  	console.log("Error getting posts: ", err);
		return res.status(404).json({error: err.message});
  })
});

router.post('/', function(req, res, next) {
	const body = req.body;

	const file = body.file;
	const location = body.location;
	const user_id = body.userId;

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

	if (post.status >= 400) {
		return post;
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
		return res.status(500).json({error: err.message});
	});

	if (image.status >= 400) {
		return post;
	}

	//TODO Serialize post w/ Comments, Likes, Images

	return post;
});

router.post('/:id/comment', function(req, res, next) {
	const body = req.body;
	const post_id = req.params.id;

	const text = body.text;

	let post = Post.get_by_id(post_id);

	if (post.status >= 400) {
		return post;
	}

	//NEED TO GET USER_ID FROM SERVER SESSION OR PASS IN IN BODY
	return Comment.create_with_model(model_name, post_id, user_id);
});

router.post('/:id/like', function(req, res, next) {
	const body = req.body;
	const post_id = req.params.id;

	const is_liked = body.is_liked;

	const post = Post.get_by_id(post_id);

	if (post.status >= 400 ) {
		return post;
	}

	//NEED TO GET USER_ID FROM SERVER SESSION OR PASS IN IN BODY
	const like = Like.get_like_by_user(post_id, user_id);

	//create like if not found and user liked post
	if (like.status >= 400 && is_liked) {
		return Like.create_with_model(model_name, post_id, user_id);

	//delete like if like found and user unliked post 
	} else if (like.status >= 200 && like.status< 300 && is_liked === false) {
		return Like.remove(model_name, post_id, user_id);

	}
});

module.exports = router;