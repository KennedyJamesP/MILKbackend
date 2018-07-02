//For form validation should use
//https://www.npmjs.com/package/express-validator

var express = require('express');
var router = express.Router();
var db = require ("../models");
var User = db.user;
var VERBOSE = false;

const { body, param, validationResult } = require('express-validator/check');
const { asyncMiddleware } = require('./middleware');

//----- SIGNUP -----

router.post('/signup', [
	//check POST body fields
	body('email').custom(email => {
	  return User.findOne({where: {email: email}}).then(user => {
	    if (user) {
	      return Promise.reject('E-mail already in use');
	    }
	  });
	}).isEmail().withMessage('must provide a valid email'),
  body('username').custom(username => {
	  return User.findOne({where: {username: username}}).then(user => {
	    if (user) {
	      return Promise.reject('Username already in use');
	    }
	  });
	}).isLength({ min: 5 }).withMessage('must be at least 5 characters long'),
  body('password').isLength({ min: 5 }).withMessage('must be at least 5 characters long')

], asyncMiddleware(async (req, res, next) => {

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
		const email = body.email;
		const username = body.username;
		const password = body.password;

		const user = await User.create({
			username: username,
			email: email, 
			password: password
		},
		{
	    attributes: {
	      exclude: ['password']
	    }
		});

		req.session.user_id = user.id;

		return res.json(user.toJSON());
}));

//----- SIGNIN -----

router.post('/signin', [
		//validate signin fields
		body('email').not().isEmpty().withMessage("Please provide an email"),
		body('password').not().isEmpty().withMessage("Please provide a password"),

	], asyncMiddleware(async (req, res, next) => {

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

		const email = body.email;
		const password = body.password;

		const user = await User.findOne({
			where: {
				email: email,
				password: password,
			}
		});

		if (user === null) {
			return res.status(401).json({
				error: "Log in failed: Email or password was not correct."
			});
		}

		//set session user id
		req.session.user_id = user.id;

		res.json(user.toJSON());
}));

//----- GET UID -----
//route is broken if :id is not numbers
router.get("/:id", [
		param('id').not().isEmpty().withMessage('user id was not provided')
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

	const user = await User.findById(id);

	if (user === null) {
		return res.status(401).json({
			error: "login failed"
		});
	}

	res.json(user.toJSON());
}));

//----- SIGNOUT -----

router.post("/signout", asyncMiddleware(async (req, res, next) => {
	console.log("serving /users/signout request");

	if (req.session && req.session.user_id) {
		await req.session.destroy();
		return res.json({loggedout: true});
	}

	return res.json({loggedout: false});
}));

module.exports = router;

