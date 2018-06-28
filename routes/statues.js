/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var Statue = db.statue;
var VERBOSE = false;

const { body, validationResult } = require('express-validator/check');

/*
*	WHY THE F ARE CLASS & INSTANCE METHODS NOT WORKING :(
*/

const model_name = "Statue";

router.get('', function(req, res) {
	Statue.findAll()
	.then(statue => {
		if (statue === null) {
			return res.status(401).json({
				error: "Statues array is null"
			});
		}

		res.json(statue);
	})
	.catch(err => {
		console.log("Error getting statues: ", err);
		res.status(500).json({error: err.message});
	});
});

router.post('', [
		//validate statue fields
		body('location').not().isEmpty().withMessage("Please provide location"),
		body('title').not().isEmpty().withMessage("Please provide a title"),
		body('artist_name').not().isEmpty().withMessage("Please provide the artist's name"),
	],function(req,res,next) {

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

		const location = body.location;
		const title = body.title;
		const statue_desc = body.statue_desc;
		const artist_desc = body.artist_desc;
		const artist_name = body.artist_name;
		const artist_url = body.artist_url;

		let statue = Statue.create({
			location: location,
			title: title,
			statue_desc: statue_desc,
			artist_desc: artist_desc,
			artist_name: artist_name,
			artist_url: artist_url
		})
		.then(statue => {
			return statue;
		})
		.catch(err => {
			return {status: 500, error: 'Failed to create a statue'}
		});	

		//TODO - create statue image

		//pass statue to next state
		res.locals.statue = statue;
		next();

	}, function(req,res,next) {

		const statue = res.locals.statue;
		console.log("STATUE OBJ FROM LOCAL RES", statue)

		if (statue.error) {
			console.log('Failed to create statue')
			return res.status(statue.status).json({error: statue.error});
		}

		let post = Post.perform_create(user_id, statue.location, statue.id);

		if (post.error) {
			console.log('Failed to create post')
			res.status(post.status).json({error: post.error});
		}

		//Todo serialize all statue data 
		//for now...

		return res.json(statue);
});

router.get('/v2', function(res,req,next ) {
	return Statue.findAll({
		attributes: ['id', 'location', 'title']
	})
	.then(statue => {
		console.log('Got v2 statues response')
		res.json(statue);
	})
	.catch(err => {
		console.log("Error getting v2 statues: ", err);
		res.status(500).json({error: err.message});
	});
});

router.post('/:id/comment', function(req, res, next) {
	const body = req.body;
	const statue_id = req.params.id;

	const text = body.text;

	let statue = Statue.get_by_id(statue_id);

	if (statue.error) {
		return res.status(statue.status).json({error: statue.error});
	}

	//this is null
	const user_id = req.session.user_id;

	let comment = Comment.create_with_model(model_name, statue_id, user_id);

	if (comment.error) {
		return res.status(statue.status).json({error: statue.error});
	}

	return res.json(comment);
});

router.post('/:id/like', function(req, res, next) {
	const body = req.body;
	const statue_id = req.params.id;

	const is_liked = body.is_liked;

	const statue = Statue.get_by_id(statue_id);

	res.local.statue = statue;
	next();

	}, function(req,res) {
		const statue = res.local.statue;
		
		if (statue.error) {
			return res.status(statue.status).json({error: statue.error});;
		}

		//NEED TO GET USER_ID FROM SERVER SESSION OR PASS IN IN BODY
		const like = Like.get_like_by_user(statue_id, user_id);

		if (like.error) {
			return res.status(like.status).json({error: like.error});;
		}

		//create like if not found and user liked statue
		if (like === null && is_liked === true) {
			return Like.create_with_model(model_name, statue_id, user_id);

		//delete like if like found and user unliked statue 
		} else if (like.status !== null && is_liked === false) {
			return Like.remove(model_name, statue_id, user_id);
		}
});

module.exports = router;