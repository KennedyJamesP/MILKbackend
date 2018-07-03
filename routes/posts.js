/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();

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

	const post = await Post.findById(id, {
			include: [
				{model: Comment},
				{model: Image},
				{model: Like},
				{model: User}
			]
		});

	res.json(await post.toJSON());
}));

// ---- GET POSTS ----

router.get('', asyncMiddleware(async (req, res, next) => {

	const user_id = req.session.user_id;
	const { limit, page, liked, author } = req.query;

	let query_params = {};

	if (liked != null && liked === true) {
		const likes = await Like.findAll({
			where: {
				model_name: model_name,
				user_id: author != null ? author : user_id
			},
			include: [
				{model: Comment},
				{model: Image},
				{model: Like},
				{model: User}
			]
		});

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

	const { author, likes } = res.locals.query_params;
	const { limit, page } = req.query;

	if (limit == null && page == null) {
		console.log('no pag')
		if (author != null) {
			console.log('author')
			const posts = await Post.findAll({
				where: {
					user_id: author
				}
			});

			const result = await Promise.all(posts.map(async (post) => {
	      const content = await post.toJSON()
	      return content;
	    }));

			return res.json(result);

		} else if (likes != null) {
			console.log('likes')
			const posts = await Post.findAll({
				where: {
					id: likes
				}
			});

			const result = await Promise.all(posts.map(async (post) => {
	      const content = await post.toJSON()
	      return content;
	    }));

			return res.json(result);
		} 

		console.log('findaAll');

		const posts = await Post.findAll();

		// const result = await Promise.all(posts.map(async (post) => {
  //     const content = await post.toJSON()
  //     return content;
  //   }));

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
			offset: offset,
    	limit: limit
		});
		
	//if liked (takes care of author != null && likes != null)
	} else if (likes != null) {
			posts = await Post.findAndCountAll({
			where: {
				id: likes
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

	console.log('POSTS W/ LIMIT & PAGE', posts)
	// const result = await Promise.all(posts.get('rows').map(async (post) => {
 //    const content = await post.toJSON()
 //    return content;
 //  }));

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

	console.log('-- 1created post:', post.dataValues)

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

	const image = await post.createImage({
		url: "ASK NOAH FOR THE S3 BUCKET URL/" + photoKey
	});

	res.json(await post.toJSON());
}));

// ---- POST A COMMENT ----

router.post('/:id/comment', asyncMiddleware(async (req, res, next) => {
	console.log('comment', "user",req.session.user_id)
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

// ---- LIKE A POST ----

router.post('/:id/like', asyncMiddleware(async (req, res, next) => {

		const body = req.body;
		const is_liked = body.is_liked;
		const post_id = req.params.id;
		const user_id = req.session.user_id;

		const post = await Post.findById(post_id);
		console.log('post',post.dataValues)

  	const query = await post.getLikes({
  		where: {
        user_id: user_id,
			}
  	});

  	const found = query[0];
  	console.log('found',found.dataValues)
		//create like if not found and user liked statue
		if (found == null && is_liked === true) {
			console.log('--create like')
      const like = await post.createLike({
      	user_id: user_id
      });

			return res.json(like);

		//delete like if like found and user unliked statue 
		} else if (found != null && is_liked === false) {
			console.log('--remove like')
			const like = await Like.destroy({
        where: {
          user_id: user_id,
          model_name: model_name,
          model_id: post_id
        }
      });

   		//const like = await post.removeLikes(found);

      return res.json(like);
		}

		next();
	}));

module.exports = router;