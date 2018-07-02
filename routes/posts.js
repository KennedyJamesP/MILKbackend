/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var Post = db.post;
var Comment = db.comment;
var Like = db.like;
var Image = db.image;

var VERBOSE = false;

const { body, param, validationResult } = require('express-validator/check');
const { asyncMiddleware } = require('./middleware');

/*
*	WHY THE F ARE CLASS & INSTANCE METHODS NOT WORKING :(
*/

const model_name = "Post";

// ---- GET POSTS BY ID ----

router.get('/:id', [
		param('id').not().isEmpty().withMessage('post id was not provided')
	
	], asyncMiddleware(async (req, res, next) => {

	const id = req.params.id;

	//check form validation before consuming the request
	const errors = validationResult(req);
  if (!errors.isEmpty()) {
  	let errorObj = {};
  	errors.array().forEach(function(err) {
  		errorObj[err.param] = err.msg;
  	})
    return res.status(422).json({ error: errorObj });
  }

	const post = await Post.findById(id);

	console.log('--POST RESPONSE,', post.dataValues)
	console.log('--get comment', post.getComments());
	console.log('--get image', post.getImages());
	console.log('--get likes', post.getLikes());
	//serialize with post, image, comments, likes

	res.json(post);
}));

// ---- GET POSTS ----

router.get('', asyncMiddleware(async (req, res, next) => {

	const user_id = req.session.user_id;
	const query = req.query;
	const { limit, page, liked, author } = query;

	let query_params = {};

	if (liked != null && liked === true) {
		const likes = await Like.findAll({
			where: {
				model_name: model_name,
				user_id: author != null ? author : user_id
			}
		});

		//console.log('--likes dataValues',likes, likes.dataValues, typeof likes.dataValues)

		if (likes.dataValues == null) {
			return res.json(likes);
		}else {
			query_params.likes = [];
			likes.forEach(function(el) {
				query_params.likes.push(el.get('model_id'));
			});
		}
		//console.log('--formatted liked post ids:', query_params.likes)
	}

	if (author != null) {
		query_params.author = author
	}

	res.locals.query_params = query_params;
	next();

}), asyncMiddleware(async (req, res, next) => {

	const query_params = res.locals.query_params;
	const query = req.query;
	const { limit, page } = query;

	if (limit == null && page == null) {
		console.log('--finding all posts');

		if (query_params.author != null) {
			console.log('author')
			const posts = await Post.findAll({
				where: {
					user_id: query_params.author
				}
			});

			return res.json(posts);

		} else if (query_params.likes != null) {
			console.log('likes')
			const posts = await Post.findAll({
				where: {
					id: query_params.likes
				}
			});

			return res.json(posts);
		} 

		console.log('findaALl');
		const posts = await Post.findAll();
		return res.json(posts);

	} else {
		next();
	}
}), asyncMiddleware(async (req, res, next) => {
	//if here pagination is a must
	const query_params = res.locals.query_params;
	const { author, likes } = res.locals.query_params;
	const query = req.query;
	const { limit, page } = query;

	const offset = page > 1 ? (page - 1) * limit : 0;

	let posts;

	//author only
	if (author != null && likes == null) {
		posts = await Post.findAndCountAll({
			where: {
				user_id: author
			},
			offset: offset,
    	limit: limit
		});

		return res.json(posts);

	//if liked
	} else if (likes != null) {
			posts = await Post.findAndCountAll({
			where: {
				id: query_params.likes
			},
			offset: offset,
	  	limit: limit
		});
	} else {
		posts = await Post.findAndCountAll({
			offset: offset,
	  	limit: limit
		});
	}

	return res.json(posts);
}));

// ---- POST A POST ----

router.post('', [
		//body('file').not().isEmpty().withMessage("Failed to provide an image to upload"), PUT THIS IN FOR PRODUCTION
		body('location').not().isEmpty().withMessage("Please provide location")

	],asyncMiddleware(async (req, res, next) => {

	//check form validation before consuming the request
	const errors = validationResult(req);
  if (!errors.isEmpty()) {
  	let errorObj = {};
  	errors.array().forEach(function(err) {
  		errorObj[err.param] = err.msg;
  	})
    return res.status(422).json({ error: errorObj });
  }

  const user_id = req.session.user_id;
	const { location } = req.body;

	const post = await Post.create({
		location: location,
		user_id: user_id,
		statue_id: null
	});

	console.log('created post:', post)

	//pass statue to next state
	res.locals.post = post;
	next();

}), asyncMiddleware(async (req, res, next) => {

	const { file } = req.body;
	const { post } = res.locals;

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

	//This is going to fail. find way to securely patch in s3 bucket url without submitting it to github
	const image = await Image.create({
		url: "ASK NOAH FOR THE S3 BUCKET URL/" + photoKey,
		model_name: model_name,
		model_id: post.id
	});

	//TODO Serialize post w/ Comments, Likes, Images
	//For now...

	return res.json(post);
}));

// ---- POST A COMMENT ----

router.post('/:id/comment', asyncMiddleware(async (req, res, next) => {
	console.log('comment', "user",req.session.user_id)
	const user_id = req.session.user_id;
	const body = req.body;
	const post_id = req.params.id;
	const text = body.text;

	const post = await Post.findById(post_id);

	console.log('post', post)

	const comment = await Comment.create({
    text: text,
    user_id: user_id,
    model_name: model_name,
    model_id: post_id,
  });

	return res.json(comment);
}));

// ---- LIKE A POST ----

router.post('/:id/like', asyncMiddleware(async (req, res, next) => {

		const body = req.body;
		const is_liked = body.is_liked;
		console.log('--is_liked:',is_liked)
		const post_id = req.params.id;
		const user_id = req.session.user_id;

		const post = await Post.findById(post_id);

		console.log('--found post:', user_id, post.get('id'), model_name);

		const query = await Like.findOne({
      where: {
        user_id: user_id,
        model_id: post.get('id'),
        model_name: model_name
      }
    });

		console.log('--like Query:', query);

		//create like if not found and user liked statue
		if (query == null && is_liked === true) {
			const like = await Like.create({
        user_id: user_id,
        model_name: model_name,
        model_id: post_id
      });

			return res.json(like);

		//delete like if like found and user unliked statue 
		} else if (query != null && is_liked === false) {
			const like = await Like.destroy({
        where: {
          user_id: user_id,
          model_name: model_name,
          model_id: post_id
        }
      });

      return res.json({});
		}

		next();
	}));

module.exports = router;