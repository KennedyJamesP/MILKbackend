//For form validation should use
//https://www.npmjs.com/package/express-validator

var express = require('express');
var router = express.Router();
var db = require ("../models");
var User = db.user;
var VERBOSE = false;

const { body, validationResult } = require('express-validator/check');


/*
*	WHY THE F ARE CLASS & INSTANCE METHODS NOT WORKING :(
*/

//----- SIGNUP -----

router.post('/signup', [
	//check POST BODY fields
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
], function(req, res) {

		//check form validation before consuming the request
		const errors = validationResult(req);
	  if (!errors.isEmpty()) {
	    return res.status(422).json({ errors: errors.array() });
	  }

		const body = req.body;

		const email = body.email;
		const username = body.username;
		const password = body.password;

		//create user 
		User.create({
			username: username,
			email: email, 
			password: password
		},
		{
	    attributes: {
	      exclude: ['password']
	    }
		})
	  .then(user => { 

	  	//Session is undefined...
			//req.session.user_id = user.id

			//use user.toJSON() to remove password in user response 
			//see important note at top about inst methods not working
			res.json(user);
		})
		.catch( err => {
	  	console.log("USERS.JS->/new): Error creating new user:", err.message );

	  	if (err instanceof db.Sequelize.ValidationError && err.errors) {
	  		var err_msgs = [];
	  		var message = "";
	  		var each_err = "";
	  		for (var err_idx = 0; err_idx < err.errors.length; err_idx++) {
	  			each_err = err.errors[err_idx];
	  			if (VERBOSE) console.log ("error: ", each_err);
	    		message = "";
	  			if (each_err.type === "unique violation") {
	  				message = "A user account already exists for the provided "	+ each_err.path
	  					 + ": " + each_err.value;
	  			}
	  			else {
	  				message = each_err.message;
	  			}

	  			err_msgs.push(message);
	  		}

	  		if (VERBOSE) console.log ("err_msgs: ", err_msgs);

				return res.status(400).json({error: err_msgs.join(", ")});
	  	}

	  	return res.status(500).json({error: err.message});
	  });
});

//----- SIGNIN -----

router.post('/signin', [
		//validate signin fields
		body('email').not().isEmpty().withMessage("Please provide an email"),
		body('password').not().isEmpty().withMessage("Please provide a password"),
	], function(req, res) {

		//check form validation before consuming the request
		const errors = validationResult(req);
	  if (!errors.isEmpty()) {
	    return res.status(422).json({ errors: errors.array() });
	  }

		const body = req.body;

		const email = body.email;
		const password = body.password;

		//This is broken....
		//see important note at top about inst methods not working
		//User.get_user_by_id(id);
		User.findOne({
			where: {
				email: email,
				password: password,
			}
		})
		.then(user => {
			if (user === null) {
				return res.status(401).json({
					error: "Log in failed: Email or password was not correct."
				});
			}

			//Session is undefined...
			//req.session.user_id = user.id

			//use user.toJSON() to remove password in user response 
			//see important note at top about inst methods not working

			res.json(user);
		})
		.catch(err => {
			console.log("Error logging user in: ", err);
			res.status(500).json({error: err.message});
		});
});

//----- GET UID -----

router.get("/:id", (req, res, next) =>{
	var id = req.params.id;

	if (!id) {
		return res.status(400).json({error: "incorrect id provided"});
	}

	//see important note at top about inst methods not working
	//This is broken....
	// let query = User.get_user_by_id(id);
	// if (query.error) {
	// 	res.status(query.status).json({error: query.error})
	// } else {
	// 	res.json(query)
	// }

	User.findById(id)
  .then(user => {
  	if (user === null) {
			return res.status(401).json({
				error: "Log in failed: Email or password was not correct."
			});
		}

    console.log("User successfully retrieved from db: "+ JSON.stringify(user));

    //use user.toJSON() to remove password in user response 
		//see important note at top about inst methods not working

    res.json(user)
  })
  .catch(err => {
    console.log("Error retrieving user from db:" + JSON.stringify(err));
    res.status(500).json({error: err})
  })
});

//----- SIGNOUT -----

router.post("/signout", (req, res, next) => {
	console.log("serving /users/signout request");

	/* TODO: Destroy the current session */
	//if (req.session) {
	//	req.session.destroy();
	//}
	return res.json({loggedout: true});
})

module.exports = router;

