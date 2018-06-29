/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var Statue = db.statue;
var Post = db.post;
var Comment = db.comment;
var Like = db.like;
var Image = db.image;
var VERBOSE = false;

const { body, validationResult } = require('express-validator/check');
const { asyncMiddleware } = require('./middleware');

const model_name = "Statue";

// ---- GET STATUE ----

router.get('', asyncMiddleware(async (req, res, next) => {
	const statues = await Statue.findAll();

	res.json(statues);
}));

// ---- GET STATUE V2 ----

router.get('/v2', asyncMiddleware(async (req, res, next) => {
	const statues = await Statue.findAll({
		attributes: ['id', 'location', 'title']
	});
	
	console.log('Got v2 statues response')
	res.json(statues);
}));

// ---- POST STATUE ----

//TODO add in image_id

router.post('', [
		//validate statue fields
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
		const {location, title, statue_desc, artist_desc, artist_name, artist_url} = body;

		const statue = await Statue.create({
			location: location,
			title: title,
			statue_desc: statue_desc,
			artist_desc: artist_desc,
			artist_name: artist_name,
			artist_url: artist_url,
			image_id: null
		});
		
		//TODO - create statue image
		
		const post = await Post.create({
      user_id: user_id,
      location: statue.get('location'),
      statue_id: statue.get('id'),
    });

		//Todo serialize all statue data 
		//for now...

		res.json(statue);
}));

router.post('/:id/comment', asyncMiddleware(async (req, res, next) => {

	const user_id = req.session.user_id;
	const body = req.body;
	const statue_id = req.params.id;
	const text = body.text;

	const statue = await Statue.findById(statue_id);

	const comment = await Comment.create({
    text: text,
    user_id: user_id,
    model_name: model_name,
    model_id: statue_id,
  });

	return res.json(comment);
}));

router.post('/:id/like',  asyncMiddleware(async (req, res, next) => {

		const body = req.body;
		const is_liked = body.is_liked;
		const statue_id = req.params.id;
		const user_id = req.session.user_id;
		
		const statue = await Statue.findById(statue_id);

		const query = await Like.findOne({
      where: {
        user_id: user_id,
        model_id: statue_id,
        model_name: model_name
      }
    });

    console.log('Like Query:', query);

		//create like if not found and user liked statue
		if (query === null && is_liked === true) {
			const like = await Like.create({
        user_id: user_id,
        model_name: model_name,
        model_id: statue_id
      });

			return res.json(like);

		//delete like if like found and user unliked statue 
		} else if (query !== null && is_liked === false) {
			const like = await Like.destroy({
        where: {
          user_id: user_id,
          model_name: model_name,
          model_id: statue_id
        }
      });

      return res.json(like);
		}
	}));

module.exports = router;