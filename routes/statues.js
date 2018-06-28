/*
* Author: Noah Davidson
*/
var express = require('express');
var router = express.Router();
var db = require ("../models");
var Statue = db.statue;
var VERBOSE = false;

const model_name = "Statue";

router.get('/', function(req, res, next) {
	return Statue.findAll()
	.then(result => {
		return result;
	})
	.catch(err => {
		console.log("Error getting statues: ", err);
		return res.status(500).json({error: err.message});
	});
});

router.post('/', function(req,res,next) {
	const body = req.body;

	const location = body.location;
	const title = body.title;
	const made_by = body.made_by;
	const statue_desc = body.statue_desc;
	const artist_desc = body.artist_desc;
	const artist_name = body.artist_name;
	const artist_url = body.artist_url;

	let statue = Statue.create({
		location: location,
		title: title,
		made_by: made_by,
		statue_desc: statue_desc,
		artist_desc: artist_desc,
		artist_name: artist_name,
		artist_url: artist_url
	})
	.then(result => {
		return result;
	})
	.catch(err => {
		console.log("Error creating statue row: ", err);
		return res.status(500).json({error: err.message});
	});	

	//pass statue to next state
	res.locals.statue = statue;
	next();

}, function(req,res,next) {
	const statue = res.locals.statue;

	if (statue.status >= 400) {
		console.log('Failed to create statue')
		return statue;
	}

	let post = Post.perform_create(user_id, statue.location, statue.id);

	if (post.status >= 400) {
		return post;
	}

	//Todo serialize all statue data 
	
	return statue;
});

router.get('/v2', function(res,req,next ) {
	return Statue.findAll({
		attributes: ['id', 'location', 'title']
	})
	.then(result => {
		console.log('Got v2 statues response')
		return result;
	})
	.catch(err => {
		console.log("Error getting v2 statues: ", err);
		return res.status(500).json({error: err.message});
	});
});

router.post('/:id/comment', function(req, res, next) {
	const body = req.body;
	const statue_id = req.params.id;

	const text = body.text;

	let statue = Statue.get_by_id(statue_id);

	if (statue.status >= 400) {
		return statue;
	}

	//NEED TO GET USER_ID FROM SERVER SESSION OR PASS IN IN BODY
	return Comment.create_with_model(model_name, statue_id, user_id);
});

router.post('/:id/like', function(req, res, next) {
	const body = req.body;
	const statue_id = req.params.id;

	const is_liked = body.is_liked;

	const statue = Statue.get_by_id(statue_id);

	if (statue.status >= 400 ) {
		return statue;
	}

	//NEED TO GET USER_ID FROM SERVER SESSION OR PASS IN IN BODY
	const like = Like.get_like_by_user(statue_id, user_id);

	//create like if not found and user liked statue
	if (like.status >= 400 && is_liked) {
		return Like.create_with_model(model_name, statue_id, user_id);

	//delete like if like found and user unliked statue 
	} else if (like.status >= 200 && like.status< 300 && is_liked === false) {
		return Like.remove(model_name, statue_id, user_id);

	}
});

module.exports = router;