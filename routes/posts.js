var express = require('express');
var router = express.Router();

const aws = require('../utils/aws');
const multer = require('multer');
const upload = multer();

var db = require ("../models");
var Comment = db.comment;
var Image = db.image;
var Like = db.like;
var Post = db.post;
var Statue = db.statue;
var User = db.user;

var VERBOSE = false;

const { body, param, validationResult } = require('express-validator/check');
const { asyncMiddleware } = require('./middleware');

const model_name = "post";

// ---- GET POST BY ID ----

router.get('/:id', [
		param('id').not().isEmpty().withMessage('post id was not provided')
	
	], asyncMiddleware(async (req, res, next) => {

	//check form validation before consuming the request
	const errors = validationResult(req);
  if (!errors.isEmpty()) {
  	let errorObj = {};
  	errors.array().forEach(function(err) {
  		errorObj[err.param] = err.msg;
  	});
    return res.status(422).json({ error: errorObj });
  }

  const id = req.params.id;

	const post = await Post.findById(id, {
		include: [
			{model: Comment},
			{model: Image},
			{model: Like, include: [User]}
		]
	});

	res.json(post);
}));

// ---- GET POSTS ----

router.get('', asyncMiddleware(async (req, res, next) => {

	const user_id = req.session.user_id;
	const { limit, page, liked, author } = req.query;

	let query_params = {};

	//if GET Liked
	if (liked == 'true') {
		const likes = await Like.findAll({
			where: {
				model_name: model_name,
				user_id: author != null ? author : user_id
			},
			include: [User]
		});

		if (likes == null) {
			return res.json(likes);
		}else {
			query_params.likes = [];
			likes.forEach(function(el) {
				query_params.likes.push(el.get('model_id'));
			});
		}
	}

	if (author != null) {
		query_params.author = author
	}

	res.locals.query_params = query_params;
	next();

}), asyncMiddleware(async (req, res, next) => {

	const { author, likes } = res.locals.query_params;
	const { limit, page } = req.query;

	if (limit == null && page == null) {
		if (author != null) {
			console.log('author')
			const posts = await Post.findAll({
				where: {
					user_id: author
				},
				include: [
					{model: Comment},
					{model: Image},
					{model: Like, include:[User]}
				]
			});

			return res.json(posts);

		} else if (likes != null) {
			console.log('likes')
			const posts = await Post.findAll({
				where: {
					id: likes
				},
				include: [
					{model: Comment},
					{model: Image},
					{model: Like, include:[User]}
				]
			});

			return res.json(posts);
		} 

		console.log('findaAll');
		const posts = await Post.findAll({
			include: [
				{model: Comment},
				{model: Image},
				{model: Like, include:[User]}
			]
		});

		return res.json(posts);

	} else {
		next();
	}
}), asyncMiddleware(async (req, res, next) => {
	//if here pagination is a must
	const { author, likes } = res.locals.query_params;
	const { limit, page } = req.query;

	const offset = page > 1 ? (page - 1) * limit : 0;

	let posts;
	//author only
	console.log('--author', author, '--likes',likes)
	if (author != null && likes == null) {
		posts = await Post.findAndCountAll({
			where: {
				user_id: author
			},
			include: [
				{model: Comment},
				{model: Image},
				{model: Like, include:[User]}
			],
			offset: offset,
    	limit: limit
		});
		
	//if liked (takes care of author != null && likes != null)
	} else if (likes != null) {
			posts = await Post.findAndCountAll({
			where: {
				id: likes
			},
			include: [
				{model: Comment},
				{model: Image},
				{model: Like, include:[User]}
			],
			offset: offset,
	  	limit: limit
		});
	} else {
		posts = await Post.findAndCountAll({
			include: [
				{model: Comment},
				{model: Image},
				{model: Like, include:[User]}
			],
			offset: offset,
	  	limit: limit
		});
	}

	return res.json(posts);
}));

// ---- POST A POST ----

router.post('',upload.any(), [
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

  if (req.files == null) {
  	return res.status(400).json({error: "Post must be uploaded with an image"})
  }

  const user_id = req.session.user_id;
	const { caption, location } = req.body;

	//TODO MAYBE ADD INCLUDES
	const post = await Post.create({
		caption: caption,
		location: location,
		user_id: user_id
	});

	//pass statue to next state
	res.locals.post = post;
	next();

}), asyncMiddleware(async (req, res, next) => {

	const { post } = res.locals;
	
  const url = aws.s3ImageUpload(req.files[0].buffer);
  
	const image = await post.createImage({
		url: url
	});

	//how to merge image and post?

	res.json({post, image});
}));

// ---- COMMENT ----

router.get('/:id/comment', asyncMiddleware(async (req, res, next) => {
	const post_id = req.params.id;

	const comments = await Comment.find({
		where: {
			model_id: post_id
		}
	});

	return res.json(comments);
}));

router.post('/:id/comment', asyncMiddleware(async (req, res, next) => {
	const user_id = req.session.user_id;
	const body = req.body;
	const post_id = req.params.id;
	const text = body.text;

	const post = await Post.findById(post_id);

  const comment = await post.createComment({
  	text: text,
    user_id: user_id
  });

	return res.json(comment);
}));

// ---- LIKE ----

router.post('/:id/like', asyncMiddleware(async (req, res, next) => {

		const body = req.body;
		const is_liked = body.is_liked;
		const post_id = req.params.id;
		const user_id = req.session.user_id;

		const post = await Post.findById(post_id);

  	const query = await post.getLikes({
  		where: {
        user_id: user_id,
			}
  	});

  	const found = query[0];

		//create like if not found and user liked statue
		if (found == null && is_liked === true) {
      const like = await post.createLike({
      	user_id: user_id
      });

			return res.json(like);

		//delete like if like found and user unliked statue 
		} else if (found != null && is_liked === false) {
			await Like.destroy({
        where: {
          user_id: user_id,
          model_name: model_name,
          model_id: post_id
        }
      });

			//Todo try to get this one working
   		//const like = await post.removeLikes(found);

      return res.json({});
		}

		next();
	}));

router.delete('/:id', [
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

	Post.destroy({where: {
		id: id
	}})

	res.json({});
}));

module.exports = router;
