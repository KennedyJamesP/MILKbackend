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

var VERBOSE = false;

const { body, param, validationResult } = require('express-validator/check');
const { asyncMiddleware } = require('./middleware');

const model_name = "statue";

// ---- GET STATUE ----

router.get('', asyncMiddleware(async (req, res, next) => {

	const statues = await Statue.findAll({
		include: [
			{model: Comment},
			{model: Image},
			{model: Like}
		]
	});

	res.json(statues);
}));

// ---- GET STATUE V2 ----

router.get('/v2', asyncMiddleware(async (req, res, next) => {
	const statues = await Statue.findAll({
		attributes: ['id', 'location', 'title']
	});

	res.json(statues);
}));

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

	const statue = await Statue.findById(id, {
		include: [
			{model: Comment},
			{model: Image},
			{model: Like}
		]
	});

	res.json(statue);
}));

// ---- POST STATUE ----

router.post('', [
		//validate statue fields

		//body('file').not().isEmpty().withMessage("Failed to provide a file"), Todo - add this in for production
		
		body('location').not().isEmpty().withMessage("Please provide location"),
		body('title').not().isEmpty().withMessage("Please provide a title"),
		body('artist_name').not().isEmpty().withMessage("Please provide the artist's name")

	], asyncMiddleware(async (req, res, next) => {

		//check form validation before consuming the request
		const errors = validationResult(req);
	  if (!errors.isEmpty()) {
	    let errorObj = {};
	  	errors.array().forEach(function(err) {
	  		errorObj[err.param] = err.msg;
	  	})
	    return res.status(422).json({ error:errorObj});
	  }

		const user_id = req.session.user_id;
		const body = req.body;
		const { location, title, statue_desc, artist_desc, artist_name, artist_url } = body || {};

		//create statue
		const statue = await Statue.create({
			location: location,
			title: title,
			statue_desc: statue_desc,
			artist_desc: artist_desc,
			artist_name: artist_name,
			artist_url: artist_url
		});

		//pass statue to next state
		res.locals.statue = statue;
		next();

	}), asyncMiddleware(async (req, res, next) => {
		const user_id = req.session.user_id;
		const { file } = req.body;
		const { statue } = res.locals;

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

		const image = await statue.createImage({
			url: "ASK NOAH FOR THE S3 BUCKET URL/" + photoKey
		});

		return res.json(statue);
	})
);

router.post('/:id/comment', asyncMiddleware(async (req, res, next) => {

	const user_id = req.session.user_id;
	const body = req.body || {};
	const statue_id = req.params.id;
	const text = body.text;

	const statue = await Statue.findById(statue_id);

 	const comment = await statue.createComment({
    text: text,
    user_id: user_id
  });

	return res.json(comment);
}));

router.post('/:id/like',  asyncMiddleware(async (req, res, next) => {

		const body = req.body;
		const is_liked = body.is_liked;
		const statue_id = req.params.id;
		const user_id = req.session.user_id;
		
		const statue = await Statue.findById(statue_id);

		const query = await statue.getLikes({
  		where: {
        user_id: user_id,
			}
  	});

  	const found = query[0];

		//create like if not found and user liked statue
		if (found == null && is_liked === true) {
			console.log('--create like')
      const like = await statue.createLike({
      	user_id: user_id
      });

			return res.json(like);

		//delete like if like found and user unliked statue 
		} else if (found != null && is_liked === false) {
			await Like.destroy({
        where: {
          user_id: user_id,
          model_name: model_name,
          model_id: statue_id
        }
      });

			//Todo try to get this one working
   		//const like = await statue.removeLike(query);

      return res.json({});
		}

		next();
}));





module.exports = router;