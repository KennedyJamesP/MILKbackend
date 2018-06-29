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
    return res.status(422).json({error:errorObj});
  }

	const post = await Post.findById(id);

	res.json(post);
}));

// ---- GET POSTS ----

router.get('', asyncMiddleware(async (req, res, next) => {

	const user_id = req.session.user_id;
	const query = req.query;
	const { limit, page, liked, author } = query;

	let query_params = {};

	if (liked != null) {
		const likes = await Like.findAll({
			where: {
				model_name: model_name,
				user_id: author != null ? author : user_id
			}
		});

		if (likes.dataValues == null) {
			return res.json(likes);
		}else {
			query_params.likes = [];
			likes.dataValues.forEach(function(el) {
				query_params.likes.push(el.model_id);
			});
		}
		console.log('--formatted liked post ids:', query_params.likes)
	}

	if (author != null) {
		query_params.author = author
	}

	res.locals.query_params = query_params;
	next();

}), asyncMiddleware(async (req, res, next) => {
	console.log('--made it to next', res.locals, res.locals.query_params)
	if (res.locals.query_params) {
        console.log(res.locals.query_params);
    }
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
		console.log('--next')
		next();

	}
}), asyncMiddleware(async (req, res, next) => {

	const query_params = res.locals.query_params;
	const query = req.query;
	const { limit, page } = query;

	console.log('--paginating posts w/ query_params', query_params);

	const offset = page > 1 ? (page - 1) * limit : 0;

	if (query_params.author != null) {
		console.log('author')
		const posts = await Post.findAndCountAll({
			where: {
				user_id: query_params.author
			},
			offset: offset,
    	limit: limit
		})
		
		console.log('PAGINATED POSTS BY AUTHOR: ', posts.count, posts.rows);
		return res.json(posts);
	} else if (query_params.likes != null) {
		console.log('likes')
		const posts = await Post.findAndCountAll({
			where: {
				id: query_params.likes
			},
			offset: offset,
    	limit: limit
		});

		console.log('PAGINATED POSTS BY LIKES', posts.count, posts.rows)
		return res.json(posts);
	}

	console.log('findAndCountAll')
	const posts = await Post.findAndCountAll({
		offset: offset,
    limit: limit
	});

	console.log('PAGINATED POSTS: ', posts.count, posts.rows);
	return res.json(posts);
}));

// ---- POST A POST ----

router.post('', [
		body('file').not().exists().withMessage("Failed to provide an image to upload"),
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
	const body = req.body;
	const { file, location } = body;

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

	const post = await Post.create({
		location: location,
		user_id: user_id,
		statue_id: null
	});

	console.log('created post:', post)

	//pass statue to next state
	res.locals.post = post;
	res.locals.image_key = photoKey;
	next();

}), asyncMiddleware(async (req, res, next) => {

	const { post, image_key } = res.locals;

	//This is going to fail. find way to securely patch in s3 bucket url without submitting it to github
	const image = await Image.create({
		post_id: post.id,
		url: "ASK NOAH FOR THE S3 BUCKET URL/" + image_key
	});

	//TODO Serialize post w/ Comments, Likes, Images
	//For now...

	return res.json(post);
}));

// ---- POST A COMMENT ----

router.post('/:id/comment', asyncMiddleware(async (req, res, next) => {

	const user_id = req.session.user_id;
	const body = req.body;
	const post_id = req.params.id;
	const text = body.text;

	const post = await Post.findById(statue_id);

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
		const post_id = req.params.id;
		const user_id = req.session.user_id;

		const post = await Post.findById(post_id);

		const query = await Like.findOne({
      where: {
        user_id: user_id,
        model_id: post_id,
        model_name: model_name
      }
    });

		console.log('Like Query:', query);

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

      return res.json(like);
		}
	}));

module.exports = router;